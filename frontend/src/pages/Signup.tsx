import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { auth } from '../lib/api';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['engineer', 'manager'], { required_error: 'Please select a role' }),
  skills: z.string().min(1, 'Skills are required'),
  seniority: z.enum(['junior', 'mid', 'senior'], { required_error: 'Please select seniority level' }),
  department: z.string().min(1, 'Department is required'),
  maxCapacity: z.enum(['100', '50'], { required_error: 'Please select employment type' })
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      maxCapacity: '100',
      role: undefined,
      seniority: undefined
    }
  });

  const role = watch('role');
  const seniority = watch('seniority');
  const maxCapacity = watch('maxCapacity');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const formattedData = {
        ...data,
        skills: data.skills.split(',').map(skill => skill.trim()),
        maxCapacity: parseInt(data.maxCapacity, 10)
      };

      await auth.register(formattedData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 bg-indigo-600 text-white flex flex-col justify-center items-center p-10">
        <h2 className="text-4xl font-bold mb-4">Create your account</h2>
        <p className="text-lg max-w-md text-center">
          Join the platform to manage your engineering and management teams with ease.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <Input {...register('name')} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <Input type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Input type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <Select value={role} onValueChange={(val) => setValue('role', val as 'engineer' | 'manager')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <Input placeholder="e.g., React, Node.js" {...register('skills')} />
                {errors.skills && <p className="text-sm text-red-600">{errors.skills.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Seniority</label>
                <Select
                  value={seniority}
                  onValueChange={(val) => setValue('seniority', val as 'junior' | 'mid' | 'senior')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
                {errors.seniority && <p className="text-sm text-red-600">{errors.seniority.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <Input placeholder="e.g., Product, Engineering" {...register('department')} />
                {errors.department && <p className="text-sm text-red-600">{errors.department.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                <Select
                  value={maxCapacity}
                  onValueChange={(val) => setValue('maxCapacity', val as '100' | '50')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Full Time</SelectItem>
                    <SelectItem value="50">Part Time</SelectItem>
                  </SelectContent>
                </Select>
                {errors.maxCapacity && <p className="text-sm text-red-600">{errors.maxCapacity.message}</p>}
              </div>
            </div>

            {/* Submit Button (Full width on bottom) */}
            <div className="col-span-1 md:col-span-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="text-indigo-600 hover:text-indigo-500"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Signup;
