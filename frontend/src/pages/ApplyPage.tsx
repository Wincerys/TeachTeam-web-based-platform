import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import logoImage from '../assets/logo.png';
import AuthWrapper from '../components/AuthWrapper';
import { useUser } from '../contexts/UserContext';
import { coursesAPI, applicationsAPI, handleApiError } from '../services/api';

// Define the FormData structure
interface FormData {
  availability: "full-time" | "part-time";
  courseCode: string;
  role: "tutor" | "lab-assistant";
  experience?: number;
  qualifications?: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  preferredHours: string;
  previousInstitutions: string;
  teachingAreas: string;
  motivation: string;
  references: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
}

interface Application {
  id: number;
  name: string;
  email: string;
  availability: string;
  course_code: string;
  course_name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const ApplyPage: React.FC = () => {
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>();

  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);

  const selectedRole = watch("role");

  // Pre-populate user data when component mounts
  useEffect(() => {
    if (user) {
      setValue('phoneNumber', '');
      setValue('emergencyContact', '');
      setValue('emergencyPhone', '');
    }
  }, [user, setValue]);

  // Load courses and user applications on component mount
  useEffect(() => {
    loadCourses();
    loadUserApplications();
  }, []);

  // Load available courses
  const loadCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const coursesData = await coursesAPI.getAll();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Load user's existing applications
  const loadUserApplications = async () => {
    try {
      setIsLoadingApplications(true);
      const applicationsData = await applicationsAPI.getUserApplications();
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Check if user has already applied for a course
  const hasAppliedForCourse = (courseCode: string): boolean => {
    return applications.some(app => app.course_code === courseCode);
  };

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

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await applicationsAPI.submit({
        availability: data.availability,
        courseCode: data.courseCode,
        role: data.role,
        experience: data.role === 'tutor' ? data.experience : undefined,
        qualifications: data.role === 'lab-assistant' ? data.qualifications?.trim() : undefined,
        phoneNumber: data.phoneNumber.trim(),
        emergencyContact: data.emergencyContact.trim(),
        emergencyPhone: data.emergencyPhone.trim(),
        preferredHours: data.preferredHours.trim(),
        previousInstitutions: data.previousInstitutions.trim(),
        teachingAreas: data.teachingAreas.trim(),
        motivation: data.motivation.trim(),
        references: data.references.trim()
      });

      setSubmitSuccess('Application submitted successfully!');
      reset();
      loadUserApplications();
    } catch (error) {
      setSubmitError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
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
          
          {/* Existing Applications Section */}
          {!isLoadingApplications && applications.length > 0 && (
            <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6">
                <h2 className="text-2xl font-bold text-white">Your Applications</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{app.course_code} - {app.course_name}</h3>
                          <p className="text-gray-600">Applied as: <span className="capitalize">{app.role}</span></p>
                          <p className="text-gray-600">Availability: {app.availability}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Submitted: {formatDate(app.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Application Form */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-1">
            <div className="bg-white p-8 rounded-xl">
              <h1 className="text-4xl font-bold text-center mb-6">Tutor Application Form</h1>
              
              {/* User Info Display */}
              {user && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                    <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Username:</strong> @{user.username}</p>
                    <p><strong>Member Since:</strong> {new Date(user.dateJoined).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {/* Success/Error Messages */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                  <p className="text-green-800 text-center font-medium">{submitSuccess}</p>
                </div>
              )}
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                  <p className="text-red-800 text-center font-medium">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-2">Applying As *</label>
                  <select
                    {...register("role", { required: "Please select a role" })}
                    className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="">Select role</option>
                    <option value="tutor">Tutor</option>
                    <option value="lab-assistant">Lab Assistant</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                </div>

                {/* Contact Information Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-lg font-semibold mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        {...register("phoneNumber", { 
                          required: "Phone number is required"
                        })}
                        placeholder="e.g., +61 4XX XXX XXX"
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-lg font-semibold mb-2">Emergency Contact Name *</label>
                      <input
                        {...register("emergencyContact", { 
                          required: "Emergency contact is required",
                          minLength: { value: 2, message: "Name must be at least 2 characters" }
                        })}
                        placeholder="Full name of emergency contact"
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.message}</p>}
                    </div>

                    {/* Emergency Phone */}
                    <div>
                      <label className="block text-lg font-semibold mb-2">Emergency Contact Phone *</label>
                      <input
                        type="tel"
                        {...register("emergencyPhone", { 
                          required: "Emergency phone is required"
                        })}
                        placeholder="e.g., +61 4XX XXX XXX"
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Availability Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Availability</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Availability */}
                    <div>
                      <label className="block text-lg font-semibold mb-2">Work Availability *</label>
                      <select
                        {...register("availability", { required: "Availability is required" })}
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      >
                        <option value="">Select availability</option>
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                      </select>
                      {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>}
                    </div>

                    {/* Preferred Hours */}
                    <div>
                      <label className="block text-lg font-semibold mb-2">Preferred Working Hours *</label>
                      <input
                        {...register("preferredHours", { 
                          required: "Preferred hours is required",
                          minLength: { value: 5, message: "Please be more specific" }
                        })}
                        placeholder="e.g., Weekdays 9am-3pm, Evenings, Weekends"
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      {errors.preferredHours && <p className="text-red-500 text-sm mt-1">{errors.preferredHours.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Experience/Qualifications Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Experience & Qualifications</h3>
                  
                  {selectedRole === "tutor" && (
                    <div className="mb-4">
                      <label className="block text-lg font-semibold mb-2">Teaching Experience (Years) *</label>
                      <input
                        type="number"
                        {...register("experience", {
                          required: "Experience is required",
                          min: { value: 0, message: "Experience cannot be negative" },
                          max: { value: 50, message: "Experience seems unusually high" }
                        })}
                        placeholder="e.g., 3"
                        min="0"
                        max="50"
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
                    </div>
                  )}

                  {selectedRole === "lab-assistant" && (
                    <div className="mb-4">
                      <label className="block text-lg font-semibold mb-2">Qualifications *</label>
                      <textarea
                        {...register("qualifications", {
                          required: "Qualifications are required",
                          minLength: { value: 10, message: "Please provide more details" }
                        })}
                        placeholder="e.g., BSc in Computer Science, relevant certifications, technical skills..."
                        rows={4}
                        maxLength={1000}
                        className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        disabled={isSubmitting}
                      />
                      {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications.message}</p>}
                    </div>
                  )}

                  {/* Previous Institutions */}
                  <div className="mb-4">
                    <label className="block text-lg font-semibold mb-2">Previous Teaching/Work Institutions *</label>
                    <textarea
                      {...register("previousInstitutions", { 
                        required: "Previous institutions is required",
                        minLength: { value: 10, message: "Please provide more details" }
                      })}
                      placeholder="List schools, universities, or organizations where you've taught or worked..."
                      rows={3}
                      maxLength={2000}
                      className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      disabled={isSubmitting}
                    />
                    {errors.previousInstitutions && <p className="text-red-500 text-sm mt-1">{errors.previousInstitutions.message}</p>}
                  </div>

                  {/* Teaching Areas */}
                  <div>
                    <label className="block text-lg font-semibold mb-2">Subject Areas & Expertise *</label>
                    <textarea
                      {...register("teachingAreas", { 
                        required: "Teaching areas is required",
                        minLength: { value: 15, message: "Please provide more details" }
                      })}
                      placeholder="Describe your areas of expertise, subjects you can teach, programming languages, etc..."
                      rows={3}
                      maxLength={2000}
                      className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      disabled={isSubmitting}
                    />
                    {errors.teachingAreas && <p className="text-red-500 text-sm mt-1">{errors.teachingAreas.message}</p>}
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-2">Course *</label>
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading courses...</span>
                    </div>
                  ) : (
                    <select
                      {...register("courseCode", { required: "Please select a course" })}
                      className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => {
                        const alreadyApplied = hasAppliedForCourse(course.code);
                        return (
                          <option 
                            key={course.code} 
                            value={course.code}
                            disabled={alreadyApplied}
                          >
                            {course.code} - {course.name} {alreadyApplied ? '(Already Applied)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                  {errors.courseCode && <p className="text-red-500 text-sm mt-1">{errors.courseCode.message}</p>}
                </div>

                {/* Personal Statement Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Statement</h3>
                  
                  {/* Motivation */}
                  <div className="mb-4">
                    <label className="block text-lg font-semibold mb-2">Why do you want to be a tutor? *</label>
                    <textarea
                      {...register("motivation", { 
                        required: "Motivation is required",
                        minLength: { value: 50, message: "Please provide at least 50 characters" }
                      })}
                      placeholder="Explain your motivation for tutoring, what you hope to achieve, and how you can help students..."
                      rows={4}
                      maxLength={2000}
                      className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      disabled={isSubmitting}
                    />
                    {errors.motivation && <p className="text-red-500 text-sm mt-1">{errors.motivation.message}</p>}
                  </div>

                  {/* References */}
                  <div>
                    <label className="block text-lg font-semibold mb-2">References *</label>
                    <textarea
                      {...register("references", { 
                        required: "References are required",
                        minLength: { value: 30, message: "Please provide at least 30 characters" }
                      })}
                      placeholder="Provide at least 2 professional references with names, positions, institutions, and contact information..."
                      rows={4}
                      maxLength={2000}
                      className="border border-gray-300 p-3 w-full rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      disabled={isSubmitting}
                    />
                    {errors.references && <p className="text-red-500 text-sm mt-1">{errors.references.message}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingCourses}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </form>

              {/* Form Guidelines */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Application Guidelines</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• All fields marked with (*) are required</li>
                  <li>• Your name and email are pre-filled from your account</li>
                  <li>• You can only submit one application per course</li>
                  <li>• Provide detailed information about your experience and expertise</li>
                  <li>• Include at least 2 professional references with contact details</li>
                  <li>• Emergency contact information is required for safety purposes</li>
                  <li>• Applications will be reviewed by course lecturers</li>
                  <li>• You will receive notification of application status updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplyPage;