-- ============================================
-- MIGRACIÓN: Sistema Avanzado de Penalizaciones
-- Versión: 1.0
-- Fecha: 2026-01-31
-- ============================================

-- ============================================
-- PASO 1: Modificar tabla users
-- ============================================

-- Renombrar columna existente para mayor claridad
ALTER TABLE public.users 
RENAME COLUMN penalties_count TO active_penalties_count;

-- Agregar nuevas columnas
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS penalty_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS recidivism_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_penalties_received INTEGER DEFAULT 0;

-- Migrar datos existentes: mapear active_penalties_count al nuevo penalty_level
UPDATE public.users
SET 
  penalty_level = CASE
    WHEN active_penalties_count >= 3 THEN 3
    WHEN active_penalties_count = 2 THEN 2
    WHEN active_penalties_count = 1 THEN 1
    ELSE 0
  END,
  penalty_assigned_at = CASE
    WHEN active_penalties_count > 0 THEN NOW()
    ELSE NULL
  END,
  total_penalties_received = active_penalties_count
WHERE active_penalties_count > 0;

-- Crear índice para optimizar consultas de limpieza automática
CREATE INDEX IF NOT EXISTS idx_users_penalty_cleanup 
ON public.users(penalty_level, penalty_assigned_at)
WHERE penalty_level > 0 AND penalty_level < 3;

-- Agregar comentarios a las columnas
COMMENT ON COLUMN public.users.penalty_level IS 'Nivel de penalización: 0=Ninguno, 1=Warning, 2=Bloqueo Temporal, 3=Bloqueo Permanente';
COMMENT ON COLUMN public.users.penalty_assigned_at IS 'Fecha en que se asignó la última penalización';
COMMENT ON COLUMN public.users.recidivism_count IS 'Contador de reincidencias (cuántas veces ha reincidido después de limpieza)';
COMMENT ON COLUMN public.users.total_penalties_received IS 'Contador histórico total de penalizaciones recibidas';

-- ============================================
-- PASO 2: Crear tabla penalty_history
-- ============================================

CREATE TABLE IF NOT EXISTS public.penalty_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  penalty_level INTEGER NOT NULL,
  reason TEXT,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  cleaned_at TIMESTAMP,
  recidivism_level INTEGER DEFAULT 0,
  created_by_system BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_penalty_user FOREIGN KEY (user_id) 
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_penalty_history_user 
ON public.penalty_history(user_id);

CREATE INDEX IF NOT EXISTS idx_penalty_history_active 
ON public.penalty_history(user_id, cleaned_at)
WHERE cleaned_at IS NULL;

-- Agregar comentarios
COMMENT ON TABLE public.penalty_history IS 'Historial completo de penalizaciones asignadas y limpiadas';
COMMENT ON COLUMN public.penalty_history.recidivism_level IS 'Nivel de reincidencia en el momento de asignar esta penalización';

-- ============================================
-- PASO 3: Función - Asignar Penalización
-- ============================================

CREATE OR REPLACE FUNCTION assign_penalty(
  p_user_id BIGINT,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  new_penalty_level INTEGER, 
  is_permanent BOOLEAN,
  days_until_cleanup INTEGER
) AS $$
DECLARE
  current_level INTEGER;
  current_recidivism INTEGER;
  new_level INTEGER;
  cleanup_days INTEGER;
BEGIN
  -- Obtener nivel actual y contador de reincidencias
  SELECT penalty_level, recidivism_count
  INTO current_level, current_recidivism
  FROM users
  WHERE id = p_user_id;

  -- Si el usuario no existe, retornar error
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario con ID % no encontrado', p_user_id;
  END IF;

  -- LÓGICA DE REINCIDENCIA (DEFINICIÓN CORRECTA):
  -- Reincide si está limpio (penalty_level=0) y existe al menos una penalización previa que fue limpiada.
  -- Esta es la única prueba fiable de que hubo limpieza real y posterior reincidencia.
  IF current_level = 0 AND EXISTS (
    SELECT 1
    FROM penalty_history
    WHERE user_id = p_user_id
      AND cleaned_at IS NOT NULL
  ) THEN
    -- Incrementar contador de reincidencia
    current_recidivism := current_recidivism + 1;
  END IF;

  -- Calcular nuevo nivel (máximo 3)
  new_level := LEAST(current_level + 1, 3);

  -- Si tiene 3+ reincidencias, forzar Strike 3 (permanente)
  IF current_recidivism >= 3 THEN
    new_level := 3;
  END IF;

  -- Calcular días hasta limpieza según nivel y reincidencia
  IF new_level = 1 THEN
    cleanup_days := 30 * POWER(2, current_recidivism)::INTEGER;
  ELSIF new_level = 2 THEN
    cleanup_days := 180 * POWER(2, current_recidivism)::INTEGER;
  ELSE
    cleanup_days := NULL; -- Permanente
  END IF;

  -- Actualizar usuario
  UPDATE users
  SET 
    penalty_level = new_level,
    penalty_assigned_at = NOW(),
    active_penalties_count = new_level,
    total_penalties_received = total_penalties_received + 1,
    recidivism_count = current_recidivism  -- Actualizar con nuevo valor si reincidió
  WHERE id = p_user_id;

  -- Registrar en historial
  INSERT INTO penalty_history (
    user_id, 
    penalty_level, 
    reason, 
    recidivism_level,
    created_by_system
  )
  VALUES (
    p_user_id, 
    new_level, 
    p_reason, 
    current_recidivism,
    FALSE
  );

  -- Retornar información
  RETURN QUERY SELECT 
    new_level, 
    (new_level = 3),
    cleanup_days;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_penalty IS 'Asigna una penalización a un usuario, incrementando su nivel de strike. Incrementa recidivism_count si el usuario reincide después de estar limpio.';

-- ============================================
-- PASO 4: Función - Limpieza Automática
-- ============================================

CREATE OR REPLACE FUNCTION clean_expired_penalties()
RETURNS TABLE(
  total_cleaned INTEGER,
  strike1_cleaned INTEGER,
  strike2_cleaned INTEGER,
  details TEXT
) AS $$
DECLARE
  v_strike1_count INTEGER := 0;
  v_strike2_count INTEGER := 0;
  v_total INTEGER := 0;
  v_details TEXT := '';
  cleaned_user_ids BIGINT[];
BEGIN
  -- Strike 1: limpiar después de (30 días × 2^recidivism_count)
  -- NO incrementamos recidivism_count aquí, solo limpiamos
  WITH strike1_cleanup AS (
    UPDATE users u
    SET 
      penalty_level = 0,
      active_penalties_count = 0,
      penalty_assigned_at = NULL
      -- NO modificar recidivism_count aquí
    WHERE 
      penalty_level = 1
      AND penalty_assigned_at IS NOT NULL
      AND penalty_assigned_at + (INTERVAL '1 day' * (30 * POWER(2, recidivism_count))) <= NOW()
    RETURNING id
  )
  SELECT ARRAY_AGG(id), COUNT(*) INTO cleaned_user_ids, v_strike1_count 
  FROM strike1_cleanup;
  
  -- Marcar como limpiado en historial
  IF cleaned_user_ids IS NOT NULL AND ARRAY_LENGTH(cleaned_user_ids, 1) > 0 THEN
    UPDATE penalty_history
    SET cleaned_at = NOW()
    WHERE user_id = ANY(cleaned_user_ids) 
      AND penalty_level = 1
      AND cleaned_at IS NULL;
    
    v_details := v_details || 'Strike 1: ' || v_strike1_count || ' usuarios; ';
  END IF;

  -- Strike 2: limpiar después de (180 días × 2^recidivism_count)
  -- NO incrementamos recidivism_count aquí, solo limpiamos
  WITH strike2_cleanup AS (
    UPDATE users u
    SET 
      penalty_level = 0,
      active_penalties_count = 0,
      penalty_assigned_at = NULL
      -- NO modificar recidivism_count aquí
    WHERE 
      penalty_level = 2
      AND penalty_assigned_at IS NOT NULL
      AND penalty_assigned_at + (INTERVAL '1 day' * (180 * POWER(2, recidivism_count))) <= NOW()
    RETURNING id
  )
  SELECT ARRAY_AGG(id), COUNT(*) INTO cleaned_user_ids, v_strike2_count 
  FROM strike2_cleanup;
  
  -- Marcar como limpiado en historial
  IF cleaned_user_ids IS NOT NULL AND ARRAY_LENGTH(cleaned_user_ids, 1) > 0 THEN
    UPDATE penalty_history
    SET cleaned_at = NOW()
    WHERE user_id = ANY(cleaned_user_ids) 
      AND penalty_level = 2
      AND cleaned_at IS NULL;
    
    v_details := v_details || 'Strike 2: ' || v_strike2_count || ' usuarios; ';
  END IF;

  v_total := COALESCE(v_strike1_count, 0) + COALESCE(v_strike2_count, 0);

  IF v_total = 0 THEN
    v_details := 'No hay penalizaciones para limpiar';
  END IF;

  -- Retornar resumen
  RETURN QUERY SELECT 
    v_total,
    COALESCE(v_strike1_count, 0),
    COALESCE(v_strike2_count, 0),
    v_details;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clean_expired_penalties IS 'Limpia automáticamente penalizaciones expiradas según tiempo transcurrido. El contador de recidivism_count NO se modifica durante la limpieza, solo cuando el usuario vuelve a incumplir.';

-- ============================================
-- PASO 5: Función - Verificar Participación
-- ============================================

CREATE OR REPLACE FUNCTION can_participate_in_auctions(p_user_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  user_penalty_level INTEGER;
BEGIN
  SELECT penalty_level INTO user_penalty_level
  FROM users
  WHERE id = p_user_id;

  -- Si no se encuentra el usuario, denegar acceso
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Strike 2 y Strike 3 bloquean participación
  -- Solo permite participar si penalty_level es 0 o 1
  RETURN (user_penalty_level < 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_participate_in_auctions IS 'Verifica si un usuario puede participar en subastas (pujar o crear)';

-- ============================================
-- PASO 6: Configurar Cron Job (pg_cron)
-- ============================================
-- NOTA: Requiere extensión pg_cron instalada
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ejecutar limpieza todos los días a las 3:00 AM
-- Descomentar la siguiente línea si pg_cron está disponible:
/*
SELECT cron.schedule(
  'clean-penalties-daily',
  '0 3 * * *',
  $$SELECT clean_expired_penalties()$$
);
*/

-- ============================================
-- VERIFICACIÓN Y TESTING
-- ============================================

-- Verificar que las columnas se crearon correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'penalty_level'
  ) THEN
    RAISE EXCEPTION 'Error: Columna penalty_level no fue creada';
  END IF;
  
  RAISE NOTICE 'Migración completada exitosamente';
END $$;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
