import { IsNotEmpty, IsString, IsDate, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @IsNotEmpty()
  @IsNumber()
  teamSize: number;

  @IsEnum(ProjectStatus)
  status: ProjectStatus = ProjectStatus.PLANNING;
} 