import { useState, useEffect } from 'react';
import { useResource } from '../lib/store';
import { users, auth, assignments } from '../lib/api';
import type { User } from '../lib/types';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const SeniorityLevel = {
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior'
} as const;

// Schema for the form input (raw form data)
const engineerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  skills: z.string().min(1, 'Skills are required'),
  department: z.string().min(1, 'Department is required'),
  seniority: z.enum(['junior', 'mid', 'senior'], {
    required_error: 'Please select a seniority level',
  }),
  maxCapacity: z.enum(['100', '50'], {
    required_error: 'Please select employment type',
  }),
});

type EngineerFormData = z.infer<typeof engineerFormSchema>;

// Type for the API request
type CreateUserData = Partial<User> & {
  password: string;
};

const engineerApiSchema = engineerFormSchema.transform((data): CreateUserData => ({
  name: data.name,
  email: data.email,
  password: data.password,
  role: 'engineer',
  skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
  seniority: data.seniority,
  department: data.department,
  maxCapacity: parseInt(data.maxCapacity, 10),
}));

const Engineers = () => {
  const { users: engineers, setUsers } = useResource();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engineerCapacities, setEngineerCapacities] = useState<Record<string, number>>({});
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EngineerFormData>({
    resolver: zodResolver(engineerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      skills: '',
      department: '',
      seniority: 'junior',
      maxCapacity: '100'
    }
  });

  // Function to fetch engineer capacities
  const fetchEngineersCapacities = async () => {
    try {
      const capacities: Record<string, number> = {};
      for (const engineer of engineers.filter(u => u.role === 'engineer')) {
        const response = await assignments.getEngineerCapacity(engineer._id);
        console.log(`Engineer ${engineer.name} capacity response:`, response.data);
        // The API returns available capacity, store it directly
        capacities[engineer._id] = response.data;
      }
      console.log('Updated engineer capacities:', capacities);
      setEngineerCapacities(capacities);
    } catch (err) {
      console.error('Error fetching engineer capacities:', err);
    }
  };

  // Function to trigger a refresh
  const refreshCapacities = () => {
    setLastRefresh(Date.now());
  };

  useEffect(() => {
    const loadEngineers = async () => {
      try {
        const response = await users.getAll();
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading engineers:', err);
        setError('Failed to load engineers');
      } finally {
        setIsLoading(false);
      }
    };

    loadEngineers();
  }, [setUsers]);

  // Effect to fetch capacities when engineers list changes or refresh is triggered
  useEffect(() => {
    if (engineers.length > 0) {
      fetchEngineersCapacities();
    }
  }, [engineers, lastRefresh]);

  // Set up periodic refresh (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(refreshCapacities, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const onSubmit = handleSubmit(async (data: EngineerFormData) => {
    try {
      // Transform the form data using our API schema
      const registerData = engineerApiSchema.parse(data);

      console.log('Sending registration data:', JSON.stringify(registerData, null, 2));

      // Register the user with all data including capacity
      const response = await auth.register(registerData);
      console.log('Registration response:', response.data);

      // Add the new user to the local state
      setUsers([...engineers, response.data]);
      setIsDialogOpen(false);
      reset();
      setError(null);
    } catch (error: any) {
      console.error('Error adding engineer:', error);
      if (error.response) {
        console.error('Complete error response:', error.response);
        console.error('Error details:', error.response.data);

        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message || 'Failed to add engineer';

        setError(errorMessage);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server');
      } else {
        console.error('Error message:', error.message);
        setError(error.message || 'Failed to add engineer');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading engineers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">Engineers</h1>
          <button
            onClick={refreshCapacities}
            className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Refresh allocation status"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Add Engineer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engineers
          .filter((user) => user.role === 'engineer')
          .map((engineer) => {
            const availableCapacity = engineerCapacities[engineer._id] ?? null;
            // Calculate allocated capacity by subtracting available from max
            const allocatedCapacity = availableCapacity !== null
              ? engineer.maxCapacity - availableCapacity
              : null;

            console.log(`Rendering engineer ${engineer.name}:`, {
              maxCapacity: engineer.maxCapacity,
              availableCapacity,
              allocatedCapacity
            });

            return (
              <div
                key={engineer._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {engineer.name}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p>{engineer.email}</p>
                    <p>Department: {engineer.department}</p>
                    <p>Seniority: {engineer.seniority}</p>
                    <p>Employment: {engineer.maxCapacity === 100 ? 'Full Time' : 'Part Time'}</p>
                    <div className="mt-2">
                      <p className="mb-1">Current Status:</p>
                      {availableCapacity !== null ? (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className={`h-full rounded-full ${allocatedCapacity !== null
                                  ? (allocatedCapacity === engineer.maxCapacity
                                    ? 'bg-red-500'
                                    : (allocatedCapacity > (engineer.maxCapacity * 0.8)
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'))
                                  : 'bg-gray-500'
                                }`}
                              style={{
                                width: `${allocatedCapacity !== null ? (allocatedCapacity / engineer.maxCapacity) * 100 : 0}%`,
                                transition: 'width 0.3s ease-in-out'
                              }}
                            />
                          </div>
                          <p className="text-sm">
                            <span className={
                              allocatedCapacity !== null
                                ? (allocatedCapacity === engineer.maxCapacity
                                  ? 'text-red-600'
                                  : (allocatedCapacity > (engineer.maxCapacity * 0.8)
                                    ? 'text-yellow-600'
                                    : 'text-green-600'))
                                : 'text-gray-600'
                            }>
                              {allocatedCapacity !== null ? `${allocatedCapacity}% allocated` : 'Unknown allocation'}
                            </span>
                            {allocatedCapacity !== null && (
                              <>
                                {' • '}
                                <span className="text-gray-600">
                                  {availableCapacity}% available
                                </span>
                              </>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Loading capacity...</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {engineer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left panel */}
            <div className="bg-indigo-600 text-white px-6 py-8">
              <h2 className="text-xl font-semibold mb-2">Add New Engineer</h2>
              <p className="text-xs text-indigo-100">
                Provide engineer details including skills and availability. All fields are required.
              </p>
            </div>

            {/* Right panel - form with 2 columns */}
            <div className="px-6 py-6 bg-white overflow-auto">
              <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Name</label>
                  <Input {...register('name')} placeholder="Enter engineer name" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Email</label>
                  <Input type="email" {...register('email')} placeholder="Enter email address" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Password</label>
                  <Input type="password" {...register('password')} placeholder="Enter password" />
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Skills</label>
                  <Input {...register('skills')} placeholder="Enter skills (comma-separated)" />
                  {errors.skills && <p className="text-xs text-red-500">{errors.skills.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Department</label>
                  <Input {...register('department')} placeholder="Enter department" />
                  {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Seniority Level</label>
                  <Controller
                    control={control}
                    name="seniority"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seniority level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SeniorityLevel.JUNIOR}>Junior</SelectItem>
                          <SelectItem value={SeniorityLevel.MID}>Mid</SelectItem>
                          <SelectItem value={SeniorityLevel.SENIOR}>Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.seniority && <p className="text-xs text-red-500">{errors.seniority.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Employment Type</label>
                  <Controller
                    control={control}
                    name="maxCapacity"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">Full Time</SelectItem>
                          <SelectItem value="50">Part Time</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.maxCapacity && <p className="text-xs text-red-500">{errors.maxCapacity.message}</p>}
                </div>

                {/* Buttons span both columns */}
                <div className="sm:col-span-2 flex justify-end space-x-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting ? 'Adding...' : 'Add Engineer'}
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

export default Engineers;