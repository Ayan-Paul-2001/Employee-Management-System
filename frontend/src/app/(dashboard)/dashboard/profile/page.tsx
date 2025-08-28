'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeApi } from '@/lib/api/employee';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Building, Shield } from 'lucide-react';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  department: string;
  position: string;
  joinDate: string;
  role: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
  profileImage?: string;
};

const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(data => !data.newPassword || data.currentPassword, {
  message: "Current password is required to set a new password",
  path: ['currentPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Mock profile data
  const mockProfile: UserProfile = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, CA 94123',
    dateOfBirth: '1990-05-15',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2020-03-10',
    role: 'EMPLOYEE',
    profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await employeeApi.getEmployeeById('current');
        // setProfile(response.data);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setProfile(mockProfile);
          reset({
            firstName: mockProfile.firstName,
            lastName: mockProfile.lastName,
            email: mockProfile.email,
            phone: mockProfile.phone,
            address: mockProfile.address,
            dateOfBirth: mockProfile.dateOfBirth,
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // In a real app, this would be an API call
      // await employeeApi.updateEmployee(profile!.id, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
        });
      }
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setIsChangingPassword(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
      });
    }
    setIsEditing(false);
    setIsChangingPassword(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-0">
          <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden bg-gray-100 sm:mr-4">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                <User className="h-10 w-10" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {profile.position} • {profile.department}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="firstName"
                      {...register('firstName')}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.firstName ? 'border-red-300' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="lastName"
                      {...register('lastName')}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.lastName ? 'border-red-300' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.phone ? 'border-red-300' : ''}`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of birth
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="dateOfBirth"
                      {...register('dateOfBirth')}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.dateOfBirth ? 'border-red-300' : ''}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      {...register('address')}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.address ? 'border-red-300' : ''}`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="changePassword"
                        name="changePassword"
                        type="checkbox"
                        checked={isChangingPassword}
                        onChange={(e) => setIsChangingPassword(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="changePassword" className="font-medium text-gray-700">Change password</label>
                    </div>
                  </div>
                </div>

                {isChangingPassword && (
                  <>
                    <div className="sm:col-span-6">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="currentPassword"
                          {...register('currentPassword')}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.currentPassword ? 'border-red-300' : ''}`}
                        />
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="newPassword"
                          {...register('newPassword')}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.newPassword ? 'border-red-300' : ''}`}
                        />
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm new password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="confirmPassword"
                          {...register('confirmPassword')}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.confirmPassword ? 'border-red-300' : ''}`}
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-2" aria-hidden="true" /> Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{profile.email}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="h-4 w-4 mr-2" aria-hidden="true" /> Phone number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.phone}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" aria-hidden="true" /> Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.address}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" aria-hidden="true" /> Date of birth
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(profile.dateOfBirth).toLocaleDateString()}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" aria-hidden="true" /> Position
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.position}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-2" aria-hidden="true" /> Department
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.department}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" aria-hidden="true" /> Join date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(profile.joinDate).toLocaleDateString()}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Shield className="h-4 w-4 mr-2" aria-hidden="true" /> Role
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile.role === 'ADMIN' && 'Administrator'}
                  {profile.role === 'HR_MANAGER' && 'HR Manager'}
                  {profile.role === 'EMPLOYEE' && 'Employee'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}