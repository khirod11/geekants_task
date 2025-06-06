import { Exclude, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { UserRole, SeniorityLevel } from '../schemas/user.schema';

export class UserResponseDto {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  seniority: SeniorityLevel;
  maxCapacity: number;
  department: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  __v: number;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
} 