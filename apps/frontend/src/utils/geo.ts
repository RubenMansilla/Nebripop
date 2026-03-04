const COUNTRY_ALIASES: Record<string, string> = {
    'spain': 'ES', 'españa': 'ES', 'espana': 'ES', 'es': 'ES',
    'united states': 'US', 'usa': 'US', 'eeuu': 'US', 'estados unidos': 'US',
    'france': 'FR', 'francia': 'FR',
    'italy': 'IT', 'italia': 'IT',
    'germany': 'DE', 'alemania': 'DE',
    'portugal': 'PT',
    'united kingdom': 'GB', 'uk': 'GB', 'reino unido': 'GB',
    'mexico': 'MX', 'méxico': 'MX',
    'canada': 'CA', 'canadá': 'CA',
};

const ISO2_TO_CONTINENT: Record<string, string> = {
    ES: 'Europe', FR: 'Europe', IT: 'Europe', DE: 'Europe', PT: 'Europe', GB: 'Europe',
    US: 'North America', CA: 'North America', MX: 'North America',
    BR: 'South America', AR: 'South America', CL: 'South America', CO: 'South America', PE: 'South America',
    MA: 'Africa', DZ: 'Africa', TN: 'Africa', NG: 'Africa', ZA: 'Africa',
    CN: 'Asia', JP: 'Asia', KR: 'Asia', IN: 'Asia', TH: 'Asia',
    AU: 'Oceania', NZ: 'Oceania',
};

export function normalizeCountryToISO2(country: string): string | null {
    if (!country) return null;
    const key = country.trim().toLowerCase();
    return COUNTRY_ALIASES[key] ?? (key.length === 2 ? key.toUpperCase() : null);
}

export function continentFromISO2(iso2: string): string | null {
    if (!iso2) return null;
    return ISO2_TO_CONTINENT[iso2.toUpperCase()] ?? null;
}
