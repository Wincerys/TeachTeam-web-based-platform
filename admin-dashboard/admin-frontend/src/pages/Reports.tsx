import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  FileText, 
  Download, 
  BarChart3, 
  UserX, 
  UserCheck2, 
  Filter, 
  Mail, 
  Phone, 
  Users, 
  BookOpen, 
  UserCheck 
} from 'lucide-react';

// GraphQL Queries
const GET_COURSE_REPORTS = gql`
  query GetCourseReports {
    courseReports {
      course {
        id
        code
        name
        description
      }
      chosenCandidates {
        id
        name
        email
        role
        availability
        phoneNumber
        emergencyContact
        emergencyPhone
        experience
        qualifications
        status
        createdAt
      }
      totalApplicants
      chosenCount
    }
  }
`;

const GET_CHOSEN_CANDIDATES = gql`
  query GetChosenCandidates {
    chosenCandidatesReport {
      id
      name
      email
      courseCode
      courseName
      role
      availability
      phoneNumber
      emergencyContact
      emergencyPhone
      experience
      qualifications
      status
      createdAt
    }
  }
`;

const GET_UNCHOSEN_CANDIDATES = gql`
  query GetUnchosenCandidates {
    unchosenCandidatesReport {
      id
      name
      email
      courseCode
      courseName
      role
      availability
      phoneNumber
      status
      createdAt
    }
  }
`;

const GET_ALL_APPLICATIONS = gql`
  query GetAllApplications {
    applications {
      id
      name
      email
      courseCode
      courseName
      role
      availability
      phoneNumber
      status
      createdAt
    }
  }
`;

// Utility function to export data to CSV
const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'applications' | 'chosen' | 'unchosen' | 'course'>('course');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  // Queries based on active report
  const { data: courseReportsData, loading: courseLoading, error: courseError } = useQuery(GET_COURSE_REPORTS, {
    skip: activeReport !== 'course'
  });
  
  const { data: chosenData, loading: chosenLoading, error: chosenError } = useQuery(GET_CHOSEN_CANDIDATES, {
    skip: activeReport !== 'chosen'
  });
  
  const { data: unchosenData, loading: unchosenLoading, error: unchosenError } = useQuery(GET_UNCHOSEN_CANDIDATES, {
    skip: activeReport !== 'unchosen'
  });
  
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery(GET_ALL_APPLICATIONS, {
    skip: activeReport !== 'applications'
  });

  const loading = courseLoading || chosenLoading || unchosenLoading || applicationsLoading;
  const error = courseError || chosenError || unchosenError || applicationsError;

  // Filter functions
  const filteredChosenCandidates = chosenData?.chosenCandidatesReport?.filter((candidate: any) =>
    (candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCourse === '' || candidate.courseCode === filterCourse)
  ) || [];

  const filteredUnchosenCandidates = unchosenData?.unchosenCandidatesReport?.filter((candidate: any) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredApplications = applicationsData?.applications?.filter((app: any) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Export functions
  const exportCourseReports = () => {
    const exportData = courseReportsData?.courseReports?.flatMap((report: any) =>
      report.chosenCandidates.map((candidate: any) => ({
        'Course Code': report.course.code,
        'Course Name': report.course.name,
        'Candidate Name': candidate.name,
        'Email': candidate.email,
        'Role': candidate.role,
        'Availability': candidate.availability,
        'Phone': candidate.phoneNumber,
        'Emergency Contact': candidate.emergencyContact,
        'Emergency Phone': candidate.emergencyPhone,
        'Experience': candidate.experience || 'N/A',
        'Qualifications': candidate.qualifications || 'N/A',
        'Date Applied': new Date(candidate.createdAt).toLocaleDateString()
      }))
    ) || [];
    exportToCSV(exportData, 'course-reports');
  };

  const exportChosenCandidates = () => {
    const exportData = filteredChosenCandidates.map((candidate: any) => ({
      'Name': candidate.name,
      'Email': candidate.email,
      'Course Code': candidate.courseCode,
      'Course Name': candidate.courseName,
      'Role': candidate.role,
      'Availability': candidate.availability,
      'Phone': candidate.phoneNumber,
      'Emergency Contact': candidate.emergencyContact,
      'Emergency Phone': candidate.emergencyPhone,
      'Experience': candidate.experience || 'N/A',
      'Qualifications': candidate.qualifications || 'N/A',
      'Date Applied': new Date(candidate.createdAt).toLocaleDateString()
    }));
    exportToCSV(exportData, 'chosen-candidates');
  };

  const exportUnchosenCandidates = () => {
    const exportData = filteredUnchosenCandidates.map((candidate: any) => ({
      'Name': candidate.name,
      'Email': candidate.email,
      'Course Code': candidate.courseCode,
      'Course Name': candidate.courseName,
      'Role': candidate.role,
      'Availability': candidate.availability,
      'Phone': candidate.phoneNumber,
      'Status': candidate.status,
      'Date Applied': new Date(candidate.createdAt).toLocaleDateString()
    }));
    exportToCSV(exportData, 'unchosen-candidates');
  };

  const exportAllApplications = () => {
    const exportData = filteredApplications.map((app: any) => ({
      'Name': app.name,
      'Email': app.email,
      'Course Code': app.courseCode,
      'Course Name': app.courseName,
      'Role': app.role,
      'Availability': app.availability,
      'Phone': app.phoneNumber,
      'Status': app.status,
      'Date Applied': new Date(app.createdAt).toLocaleDateString()
    }));
    exportToCSV(exportData, 'all-applications');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading reports: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveReport('applications')}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              activeReport === 'applications' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            All Applications
          </button>
          <button
            onClick={() => setActiveReport('chosen')}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              activeReport === 'chosen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <UserCheck2 className="w-4 h-4 mr-2" />
            Chosen Candidates
          </button>
          <button
            onClick={() => setActiveReport('unchosen')}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              activeReport === 'unchosen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <UserX className="w-4 h-4 mr-2" />
            Unchosen Candidates
          </button>
          <button
            onClick={() => setActiveReport('course')}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              activeReport === 'course' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Course Reports
          </button>
        </div>
      </div>

      {/* Summary Cards for Course Reports */}
      {activeReport === 'course' && courseReportsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-900">{courseReportsData.courseReports.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Applicants</p>
                <p className="text-2xl font-bold text-green-900">
                  {courseReportsData.courseReports.reduce((sum: number, report: any) => sum + report.totalApplicants, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Chosen</p>
                <p className="text-2xl font-bold text-purple-900">
                  {courseReportsData.courseReports.reduce((sum: number, report: any) => sum + report.chosenCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search candidates or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {activeReport === 'chosen' && (
            <div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {Array.from(new Set(chosenData?.chosenCandidatesReport?.map((c: any) => c.courseCode) || [])).map((code: string) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={() => {
              if (activeReport === 'course') exportCourseReports();
              else if (activeReport === 'chosen') exportChosenCandidates();
              else if (activeReport === 'unchosen') exportUnchosenCandidates();
              else if (activeReport === 'applications') exportAllApplications();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Course Reports */}
      {activeReport === 'course' && (
        <div className="space-y-6">
          {courseReportsData?.courseReports && courseReportsData.courseReports.length > 0 ? (
            courseReportsData.courseReports.map((report: any) => (
              <div key={report.course.id} className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {report.course.code} - {report.course.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{report.course.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{report.chosenCount}</div>
                      <div className="text-sm text-gray-500">of {report.totalApplicants} applicants</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {report.totalApplicants > 0 ? Math.round((report.chosenCount / report.totalApplicants) * 100) : 0}% selection rate
                      </div>
                    </div>
                  </div>
                </div>
                
                {report.chosenCandidates.length > 0 ? (
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Chosen Candidates ({report.chosenCandidates.length})</h4>
                    <div className="grid gap-4">
                      {report.chosenCandidates.map((candidate: any) => (
                        <div key={candidate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 rounded-full p-2">
                              <UserCheck2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{candidate.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {candidate.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {candidate.phoneNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 capitalize">{candidate.role}</div>
                            <div className="text-xs text-gray-500">{candidate.availability}</div>
                            <div className="text-xs text-gray-400">
                              Applied: {new Date(candidate.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No candidates have been chosen for this course yet.
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No course reports found.
            </div>
          )}
        </div>
      )}

      {/* All Applications */}
      {activeReport === 'applications' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Applications ({filteredApplications.length})
            </h3>
          </div>
          
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChosenCandidates.map((candidate: any) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-green-100 rounded-full p-2 mr-3">
                            <UserCheck2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{candidate.courseCode}</div>
                          <div className="text-sm text-gray-500">{candidate.courseName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{candidate.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.phoneNumber}</div>
                        <div className="text-xs text-gray-500">
                          Emergency: {candidate.emergencyContact}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No chosen candidates found.
            </div>
          )}
        </div>
      )}

      {/* Unchosen Candidates Report */}
      {activeReport === 'unchosen' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Candidates Not Chosen for Any Course ({filteredUnchosenCandidates.length})
            </h3>
          </div>
          
          {filteredUnchosenCandidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnchosenCandidates.map((candidate: any) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-red-100 rounded-full p-2 mr-3">
                            <UserX className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{candidate.courseCode}</div>
                          <div className="text-sm text-gray-500">{candidate.courseName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{candidate.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          candidate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              All candidates have been chosen for at least one course.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;