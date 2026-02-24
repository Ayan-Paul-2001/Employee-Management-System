'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService, User } from '@/services/user.service';
import { useAuth } from '@/lib/auth-context';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch all users and filter for those with ADMIN or HR roles, or whatever role defines them.
      // Wait, let's fetch all users, then filter where role is 'admin' (or 'hr' if we want to manage HRs too).
      // Requirement: "Add new section in HR role dashboard named Admins (here Admins can be added, updated, deleted)."
      const allUsers = await userService.getAllUsers();
      // Only keep 'admin' users
      const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'ADMIN');
      setAdmins(adminUsers);
    } catch (err: any) {
      console.error('Failed to fetch admins:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      await userService.deleteUser(id);
      setAdmins(admins.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete admin');
    }
  };

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => {
    if (!searchTerm) return true;

    const fullNameMatch = admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = admin.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return fullNameMatch || emailMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admins</h1>
        <Link
          href="/dashboard/admins/add"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add Admin
        </Link>
      </div>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search admins by name or email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md flex justify-between">
          <span>{error}</span>
          <button className="underline font-semibold" onClick={fetchAdmins}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="bg-white shadow p-6 text-center rounded-md text-black">
          {searchTerm ? 'No admins match your search.' : 'No admins found.'}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <li key={admin.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        {/* Text colors changed to black/gray-800 to be readable on white */}
                        <p className="font-semibold text-gray-900 truncate">{admin.fullName || 'No Name'}</p>
                        <p className="ml-2 flex-shrink-0 font-normal text-gray-600">
                          ({admin.email})
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <p>
                            Role: <span className="uppercase font-bold text-gray-700">{admin.role}</span>
                            {admin.isVerified ?
                              <span className="ml-2 text-green-600 font-semibold text-xs bg-green-100 px-2 py-0.5 rounded-full">Verified</span> :
                              <span className="ml-2 text-amber-600 font-semibold text-xs bg-amber-100 px-2 py-0.5 rounded-full">Pending</span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex gap-3">
                    <Link
                      href={`/dashboard/admins/${admin.id}`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}