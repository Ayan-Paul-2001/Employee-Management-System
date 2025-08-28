'use client';

import { useState, useEffect } from 'react';
import { hrApi } from '@/lib/api/hr';
import { formatDate } from '@/lib/utils';

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  department?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    department: 'ALL',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
  });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  // Mock user role - in a real app, this would come from authentication context
  const userRole = 'HR_MANAGER'; // or 'ADMIN', 'EMPLOYEE'

  // Generate mock announcements
  const generateMockAnnouncements = () => {
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Company Holiday Schedule',
        content: 'Please note that the office will be closed on December 24th and 25th for Christmas holidays. Limited staff will be available for emergency support.',
        createdAt: '2023-12-01T10:00:00Z',
        createdBy: 'John Smith',
        department: 'ALL',
        priority: 'HIGH',
      },
      {
        id: '2',
        title: 'New Health Insurance Policy',
        content: 'We are pleased to announce our new health insurance policy with improved coverage. Please check your email for details and update your preferences by the end of this month.',
        createdAt: '2023-11-28T14:30:00Z',
        createdBy: 'HR Department',
        department: 'ALL',
        priority: 'MEDIUM',
      },
      {
        id: '3',
        title: 'IT System Maintenance',
        content: 'The IT system will undergo maintenance this weekend. Please save your work and log out before leaving on Friday. Expected downtime: Saturday 10 PM to Sunday 6 AM.',
        createdAt: '2023-11-25T09:15:00Z',
        createdBy: 'IT Department',
        department: 'ALL',
        priority: 'MEDIUM',
      },
      {
        id: '4',
        title: 'Engineering Team Meeting',
        content: 'Reminder: Weekly engineering team meeting has been moved to Thursday at 2 PM this week due to the product launch preparation.',
        createdAt: '2023-11-20T11:45:00Z',
        createdBy: 'Engineering Manager',
        department: 'ENGINEERING',
        priority: 'LOW',
      },
      {
        id: '5',
        title: 'Quarterly Performance Reviews',
        content: 'Quarterly performance reviews will begin next week. Please complete your self-assessment forms by Friday and schedule a meeting with your manager.',
        createdAt: '2023-11-15T16:20:00Z',
        createdBy: 'HR Department',
        department: 'ALL',
        priority: 'HIGH',
      },
    ];
    return mockAnnouncements;
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await hrApi.getAllAnnouncements();
        // setAnnouncements(response.data);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setAnnouncements(generateMockAnnouncements());
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
        setError('Failed to load announcements. Please try again later.');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAnnouncement(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // In a real app, this would be an API call
      // await hrApi.postAnnouncement(newAnnouncement);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new announcement to the list with mock data
      const newAnnouncementWithId: Announcement = {
        id: `${Date.now()}`,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User', // In a real app, this would be the current user's name
        department: newAnnouncement.department,
        priority: newAnnouncement.priority,
      };
      
      setAnnouncements(prev => [newAnnouncementWithId, ...prev]);
      setNewAnnouncement({
        title: '',
        content: '',
        department: 'ALL',
        priority: 'MEDIUM',
      });
      setShowNewForm(false);
    } catch (err) {
      console.error('Failed to post announcement:', err);
      setError('Failed to post announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'ALL') return true;
    return announcement.department === filter || announcement.department === 'ALL';
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="ALL">All Departments</option>
            <option value="HR">HR Department</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="MARKETING">Marketing</option>
            <option value="FINANCE">Finance</option>
            <option value="OPERATIONS">Operations</option>
          </select>
          
          {(userRole === 'ADMIN' || userRole === 'HR_MANAGER') && (
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              {showNewForm ? 'Cancel' : 'New Announcement'}
            </button>
          )}
        </div>
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

      {showNewForm && (userRole === 'ADMIN' || userRole === 'HR_MANAGER') && (
        <div className="bg-white shadow sm:rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Announcement</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="col-span-1 sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={newAnnouncement.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1">
                  <select
                    id="department"
                    name="department"
                    value={newAnnouncement.department}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="HR">HR Department</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="FINANCE">Finance</option>
                    <option value="OPERATIONS">Operations</option>
                  </select>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-3">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    name="priority"
                    value={newAnnouncement.priority}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No announcements found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{announcement.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Posted by {announcement.createdBy} on {formatDate(announcement.createdAt)}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto ${getPriorityClass(announcement.priority)}`}>
                  {announcement.priority}
                </span>
              </div>
              <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                <p className="text-sm text-gray-700 whitespace-pre-line">{announcement.content}</p>
              </div>
              {announcement.department && announcement.department !== 'ALL' && (
                <div className="border-t border-gray-200 px-4 py-3 sm:px-6 bg-gray-50">
                  <p className="text-xs text-gray-500">Department: {announcement.department}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}