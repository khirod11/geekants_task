import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: [String], required: true })
  requiredSkills: string[];

  @Prop({ required: true, min: 1 })
  teamSize: number;

  @Prop({ 
    type: String, 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
    required: true 
  })
  status: ProjectStatus;
}

export const ProjectSchema = SchemaFactory.createForClass(Project); 