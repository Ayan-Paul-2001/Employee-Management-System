'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { employeeApi } from '@/lib/api/employee';

export default function RecordAttendance() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out'>('check-in');
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if user has already checked in/out today
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        // In a real app, this would check with the API
        // For demo purposes, we'll simulate this check
        
        // Simulate a 50% chance of already being checked in
        const randomCheckedIn = Math.random() > 0.5;
        setAlreadyCheckedIn(randomCheckedIn);
        
        // If checked in, simulate a 30% chance of already being checked out
        if (randomCheckedIn) {
          const randomCheckedOut = Math.random() > 0.7;
          setAlreadyCheckedOut(randomCheckedOut);
        }
      } catch (err) {
        console.error('Failed to check attendance status:', err);
      }
    };

    checkAttendanceStatus();
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        setLocationError('Unable to retrieve your location. Please enable location services.');
      }
    );
  };

  // Handle attendance submission
  const handleSubmit = async () => {
    if (!location) {
      setError('Please allow location access to record attendance');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would send data to the API
      await employeeApi.recordAttendance({
        type: attendanceType,
        timestamp: currentTime.toISOString(),
        location: `${location.latitude},${location.longitude}`
      });
      
      setSuccess(true);
      
      // Update attendance status
      if (attendanceType === 'check-in') {
        setAlreadyCheckedIn(true);
      } else {
        setAlreadyCheckedOut(true);
      }
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/dashboard/attendance');
      }, 2000);
    } catch (err) {
      console.error('Failed to record attendance:', err);
      setError('Failed to record attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Determine if user can check in/out
  const canCheckIn = !alreadyCheckedIn;
  const canCheckOut = alreadyCheckedIn && !alreadyCheckedOut;

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/attendance"
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to attendance"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Record Attendance</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Attendance recorded successfully!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You will be redirected to the attendance page shortly.
              </p>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {formatTime(currentTime)}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-gray-500">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAttendanceType('check-in')}
                    disabled={!canCheckIn}
                    className={`px-3 sm:px-4 py-2 rounded-md flex-1 sm:flex-none ${attendanceType === 'check-in' && canCheckIn ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' : 'bg-gray-100 text-gray-800'} ${!canCheckIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Check In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceType('check-out')}
                    disabled={!canCheckOut}
                    className={`px-3 sm:px-4 py-2 rounded-md flex-1 sm:flex-none ${attendanceType === 'check-out' && canCheckOut ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' : 'bg-gray-100 text-gray-800'} ${!canCheckOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Check Out
                  </button>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex flex-col sm:flex-row justify-center mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
                <div className={`flex items-center justify-center ${alreadyCheckedIn ? 'text-green-600' : 'text-gray-400'}`}>
                  <Clock className="h-5 w-5 mr-1" aria-hidden="true" />
                  <span className="text-xs sm:text-sm">
                    {alreadyCheckedIn ? 'Checked In Today' : 'Not Checked In'}
                  </span>
                </div>
                <div className={`flex items-center justify-center ${alreadyCheckedOut ? 'text-green-600' : 'text-gray-400'}`}>
                  <Clock className="h-5 w-5 mr-1" aria-hidden="true" />
                  <span className="text-xs sm:text-sm">
                    {alreadyCheckedOut ? 'Checked Out Today' : 'Not Checked Out'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-sm text-blue-600 hover:text-blue-500 w-full sm:w-auto text-center sm:text-left py-1 sm:py-0"
                  >
                    Get Current Location
                  </button>
                </div>
                <div className="mt-1">
                  {location ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 bg-gray-50 rounded-md">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 hidden sm:inline" aria-hidden="true" />
                      <span className="text-xs sm:text-sm text-gray-700 break-all">
                        <span className="sm:hidden font-medium block mb-1">Location:</span>
                        Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 hidden sm:inline" aria-hidden="true" />
                      <span className="text-xs sm:text-sm text-gray-500">
                        {locationError || 'Click "Get Current Location" to detect your position'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (!canCheckIn && !canCheckOut) || !location}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Clock className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                      {attendanceType === 'check-in' ? 'Check In' : 'Check Out'}
                    </>
                  )}
                </button>
              </div>

              {(!canCheckIn && !canCheckOut) && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  You have already recorded your attendance for today.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}