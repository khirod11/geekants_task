import { IsString, IsEmail, MinLength, IsEnum, IsArray, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { UserRole, SeniorityLevel } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.ENGINEER;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[] = [];

  @IsEnum(SeniorityLevel)
  @IsOptional()
  seniority?: SeniorityLevel = SeniorityLevel.JUNIOR;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxCapacity?: number = 100;

  @IsString()
  @IsOptional()
  department?: string;
} 