import { useState, useEffect } from 'react';
import { useResource } from '../lib/store';
import { assignments, users, projects } from '../lib/api';
import type { Assignment, User, Project } from '../lib/types';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import * as z from 'zod';
import { useAuth } from '../lib/store';

interface PopulatedAssignment extends Omit<Assignment, 'engineerId' | 'projectId'> {
  engineerId: User;
  projectId: Project;
}

const assignmentFormSchema = z.object({
  engineerId: z.string().min(1, 'Engineer is required'),
  projectId: z.string().min(1, 'Project is required'),
  role: z.string().min(1, 'Role is required'),
  allocationPercentage: z.number()
    .min(0, 'Allocation must be at least 0')
    .max(100, 'Allocation cannot exceed 100'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

const Assignments = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const {
    assignments: assignmentsList,
    users: engineers,
    projects: projectsList,
    setAssignments,
    setUsers,
    setProjects,
  } = useResource();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PopulatedAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCapacity, setAvailableCapacity] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      engineerId: '',
      projectId: '',
      role: '',
      allocationPercentage: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }
  });

  const handleEngineerChange = async (engineerId: string) => {
    setValue('engineerId', engineerId);
    try {
      const response = await assignments.getEngineerCapacity(engineerId);
      console.log('Engineer capacity response:', response.data);
      setAvailableCapacity(response.data);

      // If the engineer has no capacity, show a warning
      if (response.data === 0) {
        setError('Warning: This engineer has no available capacity');
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error('Error getting engineer capacity:', err);
      setError('Failed to get engineer capacity. Please try again.');
      setAvailableCapacity(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading assignments data...');
        const [assignmentsRes, usersRes, projectsRes] = await Promise.all([
          assignments.getAll(),
          users.getAll(),
          projects.getAll(),
        ]);

        console.log('Assignments data:', assignmentsRes.data);
        console.log('Users data:', usersRes.data);
        console.log('Projects data:', projectsRes.data);

        setAssignments(assignmentsRes.data);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setError(null);
      } catch (err: any) {
        console.error('Error loading assignments data:', err);
        setError(err.response?.data?.message || 'Failed to load assignments data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setAssignments, setUsers, setProjects]);

  // Add debug effect to monitor data changes
  useEffect(() => {
    console.log('Current assignments:', assignmentsList);
    console.log('Current engineers:', engineers);
    console.log('Current projects:', projectsList);
  }, [assignmentsList, engineers, projectsList]);

  const onSubmit = handleSubmit(async (data: AssignmentFormData) => {
    try {
      if (selectedAssignment) {
        // For updates, only send the fields that can be updated
        const updateData = {
          role: data.role,
          allocationPercentage: Number(data.allocationPercentage),
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString()
        };

        console.log('Original form data:', data);
        console.log('Update data being sent:', updateData);

        const response = await assignments.update(selectedAssignment._id, updateData);
        setAssignments(
          assignmentsList.map((assign) =>
            assign._id === selectedAssignment._id ? response.data : assign
          )
        );
      } else {
        // For new assignments, send all fields
        const createData = {
          engineerId: data.engineerId,
          projectId: data.projectId,
          role: data.role,
          allocationPercentage: Number(data.allocationPercentage),
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString()
        };

        console.log('Create data being sent:', createData);
        const response = await assignments.create(createData);
        setAssignments([...assignmentsList, response.data]);
      }
      setIsDialogOpen(false);
      setSelectedAssignment(null);
      reset();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save assignment');
    }
  });

  const handleEdit = (assignment: PopulatedAssignment) => {
    console.log('Assignment being edited:', assignment);
    setSelectedAssignment(assignment);
    setValue('engineerId', typeof assignment.engineerId === 'string'
      ? assignment.engineerId
      : assignment.engineerId._id);
    setValue('projectId', typeof assignment.projectId === 'string'
      ? assignment.projectId
      : assignment.projectId._id);
    setValue('role', assignment.role);
    setValue('allocationPercentage', assignment.allocationPercentage);
    setValue('startDate', new Date(assignment.startDate).toISOString().split('T')[0]);
    setValue('endDate', new Date(assignment.endDate).toISOString().split('T')[0]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await assignments.delete(id);
      setAssignments(assignmentsList.filter((assign) => assign._id !== id));
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      setError(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const handleAddNew = () => {
    setSelectedAssignment(null);
    setAvailableCapacity(null);
    reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Assignments {isLoading ? '(Loading...)' : `(${assignmentsList.length})`}
        </h1>
        {isManager && (
          <button
            onClick={handleAddNew}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            disabled={isLoading}
          >
            Add Assignment
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignmentsList.map((assignment) => {
          // Type guards for populated fields
          const engineerName = typeof assignment.engineerId === 'string'
            ? engineers.find(e => e._id === assignment.engineerId)?.name || 'Unknown Engineer'
            : assignment.engineerId.name;

          const projectName = typeof assignment.projectId === 'string'
            ? projectsList.find(p => p._id === assignment.projectId)?.name || 'Unknown Project'
            : assignment.projectId.name;

          return (
            <div
              key={assignment._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {engineerName}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {assignment.role}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <p>Project: {projectName}</p>
                  <p>Allocation: {assignment.allocationPercentage}%</p>
                  <p>Period: {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}</p>
                </div>

                {isManager && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        // Ensure the assignment is fully populated before editing
                        const populatedAssignment: PopulatedAssignment = {
                          ...assignment,
                          engineerId: typeof assignment.engineerId === 'string'
                            ? engineers.find(e => e._id === assignment.engineerId)!
                            : assignment.engineerId,
                          projectId: typeof assignment.projectId === 'string'
                            ? projectsList.find(p => p._id === assignment.projectId)!
                            : assignment.projectId
                        };
                        handleEdit(populatedAssignment);
                      }}
                      className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAvailableCapacity(null);
            setSelectedAssignment(null);
            reset();
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left info panel */}
            <div className="bg-indigo-600 text-white px-6 py-8">
              <h2 className="text-xl font-semibold mb-2">
                {selectedAssignment ? 'Edit Assignment' : 'Add Assignment'}
              </h2>
              <p className="text-xs text-indigo-100">
                {selectedAssignment
                  ? 'Modify the details of this assignment below.'
                  : 'Fill in the form to create a new engineer assignment.'}
              </p>
            </div>

            {/* Right form panel */}
            <div className="px-6 py-6 bg-white overflow-auto">
              <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Engineer */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Engineer</label>
                  <Select
                    value={watch('engineerId')}
                    onValueChange={handleEngineerChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers
                        .filter(eng => eng.role === 'engineer')
                        .map(engineer => (
                          <SelectItem key={engineer._id} value={engineer._id}>
                            {engineer.name} ({engineer.maxCapacity === 100 ? 'Full Time' : 'Part Time'})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.engineerId && <p className="text-xs text-red-600">{errors.engineerId.message}</p>}
                </div>

                {/* Project */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Project</label>
                  <Controller
                    control={control}
                    name="projectId"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!selectedAssignment}
                      >
                        <SelectTrigger className={selectedAssignment ? "bg-gray-100" : ""}>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectsList.map(project => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.projectId && <p className="text-xs text-red-600">{errors.projectId.message}</p>}
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Role</label>
                  <Input {...register('role')} placeholder="e.g., Developer, Tech Lead" />
                  {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
                </div>

                {/* Allocation Percentage */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Allocation Percentage{' '}
                    {availableCapacity !== null && (
                      <span className={`ml-1 ${availableCapacity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        (Available: {availableCapacity}%)
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...register('allocationPercentage', {
                      valueAsNumber: true,
                      validate: {
                        notExceedAvailable: value => {
                          if (availableCapacity === null) return true
                          return value <= availableCapacity || `Cannot exceed available capacity of ${availableCapacity}%`
                        },
                      },
                    })}
                    className={availableCapacity === 0 ? 'bg-red-50' : ''}
                    disabled={availableCapacity === 0}
                  />
                  {errors.allocationPercentage && (
                    <p className="text-xs text-red-600">{errors.allocationPercentage.message}</p>
                  )}
                  {availableCapacity === 0 && (
                    <p className="text-xs text-red-600">
                      This engineer is fully allocated and cannot take new assignments
                    </p>
                  )}
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Start Date</label>
                  <Input type="date" {...register('startDate')} />
                  {errors.startDate && <p className="text-xs text-red-600">{errors.startDate.message}</p>}
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">End Date</label>
                  <Input type="date" {...register('endDate')} />
                  {errors.endDate && <p className="text-xs text-red-600">{errors.endDate.message}</p>}
                </div>

                {/* Buttons span two columns */}
                <div className="sm:col-span-2 flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setSelectedAssignment(null)
                      reset()
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting
                      ? selectedAssignment
                        ? 'Updating...'
                        : 'Adding...'
                      : selectedAssignment
                        ? 'Update'
                        : 'Add'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>

      </Dialog>
    </div>
  );
};

export default Assignments; 