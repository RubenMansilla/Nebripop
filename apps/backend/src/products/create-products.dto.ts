import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsOptional() @IsString() summary: string;

  @IsString()
  name: string;

  @IsOptional() @IsString() description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional() @IsString() condition: string;
  @IsOptional() @IsString() brand: string;
  @IsOptional() @IsString() color: string;
  @IsOptional() @IsString() material: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  width_cm: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  height_cm: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  depth_cm: number;

  // 🔥 AHORA SÍ CONVIERTEN STRING → NUMBER
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  category_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subcategory_id: number;

  // 🔥 CONVIERTE "true"/"false" → boolean
  @Type(() => Boolean)
  @IsBoolean()
  shipping_active: boolean;

  @IsOptional() @IsString()
  shipping_size: string;

  @IsOptional() @IsString()
  shipping_weight: string;

  @IsOptional() @IsString()
  postal_code: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  latitude: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  longitude: number;
}
