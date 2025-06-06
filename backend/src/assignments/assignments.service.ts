import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { engineerId, projectId, allocationPercentage } = createAssignmentDto;

    // Check if engineer exists and is an engineer
    const engineer = await this.usersService.findOne(engineerId);
    if (engineer.role !== 'engineer') {
      throw new BadRequestException('Can only assign engineers to projects');
    }
    
    // Check if project exists
    await this.projectsService.findOne(projectId);

    // Calculate current allocation
    const availableCapacity = await this.getEngineerCapacity(engineerId);
    if (availableCapacity < allocationPercentage) {
      throw new BadRequestException(`Engineer only has ${availableCapacity}% capacity available`);
    }

    const createdAssignment = new this.assignmentModel(createAssignmentDto);
    return createdAssignment.save();
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentModel
      .find()
      .populate('engineerId', 'name email')
      .populate('projectId', 'name description')
      .exec();
  }

  async findByEngineerId(engineerId: string): Promise<Assignment[]> {
    return this.assignmentModel
      .find({ engineerId })
      .populate('engineerId', 'name email')
      .populate('projectId', 'name description')
      .exec();
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentModel
      .findById(id)
      .populate('engineerId', 'name email')
      .populate('projectId', 'name description')
      .exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async getEngineerCapacity(engineerId: string): Promise<number> {
    // Get engineer's max capacity
    const engineer = await this.usersService.findOne(engineerId);
    
    // Get current assignments
    const currentAssignments = await this.assignmentModel
      .find({ 
        engineerId,
        endDate: { $gte: new Date() }
      })
      .exec();

    // Calculate total allocation
    const totalAllocated = currentAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage,
      0
    );

    return engineer.maxCapacity - totalAllocated;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    try {
      console.log('Updating assignment with ID:', id);
      console.log('Update data received:', updateAssignmentDto);

      const assignment = await this.assignmentModel.findById(id).exec();
      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }

      // If allocation percentage is being updated, check capacity
      if (updateAssignmentDto.allocationPercentage) {
        console.log('Checking allocation capacity...');
        const currentAllocation = assignment.allocationPercentage;
        const newAllocation = updateAssignmentDto.allocationPercentage;
        const engineerId = assignment.engineerId.toString();
        
        console.log('Current allocation:', currentAllocation);
        console.log('New allocation:', newAllocation);
        console.log('Engineer ID:', engineerId);

        // Get current capacity excluding this assignment
        const engineer = await this.usersService.findOne(engineerId);
        const currentAssignments = await this.assignmentModel
          .find({ 
            engineerId,
            _id: { $ne: id },
            endDate: { $gte: new Date() }
          })
          .exec();

        const otherAllocations = currentAssignments.reduce(
          (sum, a) => sum + a.allocationPercentage,
          0
        );

        console.log('Other allocations:', otherAllocations);
        console.log('Engineer max capacity:', engineer.maxCapacity);

        if (otherAllocations + newAllocation > engineer.maxCapacity) {
          throw new BadRequestException(`Engineer would exceed capacity. Available: ${engineer.maxCapacity - otherAllocations}%, Requested: ${newAllocation}%`);
        }
      }

      // Perform the update
      console.log('Performing update with data:', updateAssignmentDto);
      const updated = await this.assignmentModel
        .findByIdAndUpdate(
          id,
          { $set: updateAssignmentDto },
          { new: true }
        )
        .populate('engineerId', '-password')
        .populate('projectId')
        .exec();

      return updated;
    } catch (error) {
      console.error('Error in update:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update assignment: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.assignmentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Assignment not found');
    }
  }
} 