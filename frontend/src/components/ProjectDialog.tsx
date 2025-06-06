import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Project } from '../lib/types';
import { AxiosError } from 'axios';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  requiredSkills: z.string(),
  teamSize: z.string(),
  status: z.enum(['planning', 'active', 'completed']),
  timeline: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
});

type ProjectFormInput = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  project?: Project;
}

export function ProjectDialog({ open, onOpenChange, onSubmit, project }: ProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
        name: project.name,
        description: project.description,
        requiredSkills: project.requiredSkills.join(', '),
        teamSize: project.teamSize.toString(),
        status: project.status,
        timeline: {
          startDate: project.timeline.startDate.split('T')[0],
          endDate: project.timeline.endDate.split('T')[0],
        },
      }
      : {
        name: '',
        description: '',
        requiredSkills: '',
        teamSize: '1',
        status: 'planning',
        timeline: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      },
  });

  const onFormSubmit: SubmitHandler<ProjectFormInput> = async (data) => {
    try {
      setIsSubmitting(true);
      const startDate = new Date(data.timeline.startDate).toISOString();
      const endDate = new Date(data.timeline.endDate).toISOString();

      const projectData = {
        name: data.name,
        description: data.description,
        requiredSkills: data.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
        teamSize: parseInt(data.teamSize, 10),
        status: data.status,
        startDate,
        endDate,
        timeline: {
          startDate,
          endDate,
        },
      };

      await onSubmit(projectData);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      if (error instanceof AxiosError) {
        console.error('Backend error:', error.response?.data?.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left side */}
          <div className="bg-indigo-600 text-white px-6 py-8">
            <h2 className="text-xl font-semibold mb-2">
              {project ? 'Edit Project' : 'Create a New Project'}
            </h2>
            <p className="text-xs text-indigo-100">
              Fill in project info, skills, and timeline. Keep it short and clear.
            </p>
          </div>

          {/* Right side */}
          <div className="px-6 py-6 bg-white">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Project Name</label>
                <Input {...register('name')} placeholder="Enter project name" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Description</label>
                <Textarea {...register('description')} placeholder="Enter project description" />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Required Skills</label>
                <Input
                  {...register('requiredSkills')}
                  placeholder="Enter skills (comma-separated)"
                />
                {errors.requiredSkills && (
                  <p className="text-xs text-red-500">{errors.requiredSkills.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Team Size</label>
                  <Input type="number" min="1" {...register('teamSize')} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Status</label>
                  <Select
                    onValueChange={(value) => setValue('status', value as 'planning' | 'active' | 'completed')}
                    defaultValue={project?.status || 'planning'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Start Date</label>
                  <Input type="date" {...register('timeline.startDate')} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">End Date</label>
                  <Input type="date" {...register('timeline.endDate')} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>

    </Dialog>
  );
}
