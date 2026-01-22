// src/pages/LecturerAssignments.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { UserCheck, Plus, Trash2, Calendar, GraduationCap, BookOpen } from 'lucide-react';
import { User, Course, Assignment } from '../types';

const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      code
      name
      description
      isActive
      lecturer {
        id
        firstName
        lastName
        username
        email
      }
      createdAt
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      username
      email
      role
      isBlocked
      createdAt
    }
  }
`;

const GET_ASSIGNMENTS = gql`
  query GetAssignments {
    assignments {
      id
      course {
        id
        code
        name
        description
      }
      lecturer {
        id
        firstName
        lastName
        username
        email
      }
      semester
      year
      createdAt
    }
  }
`;

const ASSIGN_LECTURER = gql`
  mutation AssignLecturer($courseId: ID!, $lecturerId: ID!, $semester: String!, $year: Int!) {
    assignLecturerToCourse(courseId: $courseId, lecturerId: $lecturerId, semester: $semester, year: $year) {
      id
      course {
        id
        code
        name
      }
      lecturer {
        id
        firstName
        lastName
        username
      }
      semester
      year
      createdAt
    }
  }
`;

const REMOVE_ASSIGNMENT = gql`
  mutation RemoveAssignment($id: ID!) {
    removeAssignment(id: $id)
  }
`;

const LecturerAssignments: React.FC = () => {
  const { data: coursesData } = useQuery(GET_COURSES);
  const { data: usersData } = useQuery(GET_USERS);
  const { data: assignmentsData, loading, error, refetch } = useQuery(GET_ASSIGNMENTS);
  const [assignLecturer] = useMutation(ASSIGN_LECTURER);
  const [removeAssignment] = useMutation(REMOVE_ASSIGNMENT);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    courseId: '',
    lecturerId: '',
    semester: '',
    year: new Date().getFullYear()
  });

  const lecturers = usersData?.users?.filter((user: User) => user.role === 'lecturer') || [];
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await assignLecturer({ 
        variables: { 
          courseId: formData.courseId,
          lecturerId: formData.lecturerId,
          semester: formData.semester,
          year: parseInt(formData.year.toString())
        } 
      });
      
      setShowForm(false);
      setFormData({ courseId: '', lecturerId: '', semester: '', year: new Date().getFullYear() });
      refetch();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await removeAssignment({ variables: { id } });
        refetch();
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading assignments...</div>;
  if (error) return <div className="text-red-600 text-center py-8">Error: {error.message}</div>;

  // Group assignments by year and semester
  const groupedAssignments = assignmentsData?.assignments?.reduce((acc: any, assignment: Assignment) => {
    const key = `${assignment.year}-${assignment.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(assignment);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lecturer Assignments</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Lecturer
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Assignments</p>
              <p className="text-2xl font-bold text-blue-900">{assignmentsData?.assignments?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <GraduationCap className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Active Lecturers</p>
              <p className="text-2xl font-bold text-green-900">
                {new Set(assignmentsData?.assignments?.map((a: Assignment) => a.lecturer.id)).size || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Assigned Courses</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(assignmentsData?.assignments?.map((a: Assignment) => a.course.id)).size || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Assign Lecturer to Course</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Course</option>
                  {coursesData?.courses?.map((course: Course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                <select
                  value={formData.lecturerId}
                  onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((lecturer: User) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName} (@{lecturer.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2020"
                  max="2030"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Assign Lecturer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ courseId: '', lecturerId: '', semester: '', year: new Date().getFullYear() });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments grouped by semester/year */}
      <div className="space-y-6">
        {Object.keys(groupedAssignments).length > 0 ? (
          Object.entries(groupedAssignments)
            .sort(([a], [b]) => b.localeCompare(a)) // Sort by year-semester desc
            .map(([period, assignments]: [string, Assignment[]]) => {
              const [year, semester] = period.split('-');
              return (
                <div key={period} className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {semester} {year} ({assignments.length} assignments)
                      </h3>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignments.map((assignment: Assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{assignment.course.code}</div>
                                <div className="text-sm text-gray-500">{assignment.course.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-full p-2 mr-3">
                                  <GraduationCap className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {assignment.lecturer.firstName} {assignment.lecturer.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">@{assignment.lecturer.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleRemove(assignment.id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
            <p>Start by assigning lecturers to courses for different semesters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerAssignments;