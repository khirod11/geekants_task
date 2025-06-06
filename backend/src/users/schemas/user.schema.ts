import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ENGINEER = 'engineer',
  MANAGER = 'manager'
}

export enum SeniorityLevel {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior'
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.ENGINEER })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ enum: SeniorityLevel, default: SeniorityLevel.JUNIOR })
  seniority: SeniorityLevel;

  @Prop({ required: true, default: 100, min: 0, max: 100 })
  maxCapacity: number;

  @Prop()
  department: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 