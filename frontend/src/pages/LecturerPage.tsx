import React, { useEffect, useState } from "react";
import logoImage from '../assets/logo.png';
import AuthWrapper from '../components/AuthWrapper';
import { applicationsAPI, handleApiError } from '../services/api';

interface Application {
  id: number;
  name: string;
  email: string;
  availability: string;
  course_code: string;
  course_name: string;
  role: string;
  experience?: number;
  qualifications?: string;
  phone_number: string;
  emergency_contact: string;
  emergency_phone: string;
  preferred_hours: string;
  // transport: string; // REMOVED
  previous_institutions: string;
  teaching_areas: string;
  motivation: string;
  references: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const LecturerPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');

  // Load all applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const applicationsData = await applicationsAPI.getAll();
      setApplications(applicationsData);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique courses from applications
  const uniqueCourses = Array.from(new Set(applications.map(app => app.course_code)))
    .map(code => {
      const app = applications.find(a => a.course_code === code);
      return { code, name: app?.course_name || code };
    });

  // Filter applications based on search criteria
  const filteredApplications = applications.filter(app => {
    const matchesCourse = !selectedCourse || app.course_code === selectedCourse;
    const matchesName = !searchName || app.name.toLowerCase().includes(searchName.toLowerCase());
    return matchesCourse && matchesName;
  });

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md fixed top-0 w-full z-50">
        <nav className="flex justify-between items-center px-4">
          <a href="/">
            <img alt="Teach Team" src={logoImage} className="w-12 h-12 cursor-pointer" />
          </a>
          <div className="flex items-center space-x-4">
            <AuthWrapper />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-20 flex-grow">
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-1">
            <div className="bg-white p-8 rounded-xl">
              <h1 className="text-4xl font-bold text-center mb-6">Lecturer Dashboard</h1>
              
              {/* Role confirmation banner */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-center">
                  ✅ You have access to the lecturer dashboard as a <span className="font-semibold">lecturer</span>.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                  <p className="text-red-800 text-center font-medium">{error}</p>
                </div>
              )}

              {/* Search and Filter Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-3">Filter Applications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Filter by Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">All Courses</option>
                      {uniqueCourses.map((course) => (
                        <option key={course.code} value={course.code}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name Search */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Search by Name</label>
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="border p-2 rounded w-full"
                      placeholder="Enter applicant name..."
                    />
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="bg-white rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">
                    Applications ({filteredApplications.length})
                  </h2>
                  <button
                    onClick={loadApplications}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading applications...</span>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-gray-600 text-lg">
                      {applications.length === 0 
                        ? "No applications have been submitted yet."
                        : "No applications match your search criteria."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredApplications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-6 bg-white shadow hover:shadow-md transition-shadow">
                        {/* Application Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">{app.name}</h3>
                            <p className="text-gray-600">{app.email}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>

                        {/* Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p><strong>Course:</strong> {app.course_code} - {app.course_name}</p>
                            <p><strong>Role:</strong> <span className="capitalize">{app.role}</span></p>
                            <p><strong>Availability:</strong> {app.availability}</p>
                          </div>
                          <div>
                            <p><strong>Phone:</strong> {app.phone_number}</p>
                            <p><strong>Preferred Hours:</strong> {app.preferred_hours}</p>
                            {/* Transport line REMOVED */}
                          </div>
                          <div>
                            {app.experience !== undefined && (
                              <p><strong>Experience:</strong> {app.experience} years</p>
                            )}
                            <p><strong>Emergency Contact:</strong> {app.emergency_contact}</p>
                            <p><strong>Emergency Phone:</strong> {app.emergency_phone}</p>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <details className="mt-4">
                          <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                            View Full Application Details
                          </summary>
                          <div className="mt-4 space-y-4 pl-4 border-l-2 border-blue-200">
                            {app.qualifications && (
                              <div>
                                <h4 className="font-medium">Qualifications:</h4>
                                <p className="text-gray-700">{app.qualifications}</p>
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">Previous Institutions:</h4>
                              <p className="text-gray-700">{app.previous_institutions}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Teaching Areas:</h4>
                              <p className="text-gray-700">{app.teaching_areas}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Motivation:</h4>
                              <p className="text-gray-700">{app.motivation}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">References:</h4>
                              <p className="text-gray-700">{app.references}</p>
                            </div>
                          </div>
                        </details>

                        {/* Application Actions */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-500">
                            Applied: {formatDate(app.created_at)}
                          </p>
                          <div className="space-x-2">
                            {app.status === 'pending' && (
                              <>
                                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                                  Approve
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                              Contact Applicant
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Statistics Section */}
              {applications.length > 0 && (
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Application Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <h4 className="text-2xl font-bold text-blue-600">{applications.length}</h4>
                      <p className="text-gray-600">Total Applications</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <h4 className="text-2xl font-bold text-yellow-600">
                        {applications.filter(app => app.status === 'pending').length}
                      </h4>
                      <p className="text-gray-600">Pending Review</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <h4 className="text-2xl font-bold text-green-600">
                        {applications.filter(app => app.status === 'approved').length}
                      </h4>
                      <p className="text-gray-600">Approved</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <h4 className="text-2xl font-bold text-red-600">
                        {applications.filter(app => app.status === 'rejected').length}
                      </h4>
                      <p className="text-gray-600">Rejected</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LecturerPage;