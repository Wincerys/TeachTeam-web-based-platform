import React, { FC, useState, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import logoImage from '../assets/logo.png';
import AuthWrapper from './AuthWrapper';
import { useNavigate } from 'react-router-dom';

// Define the FormData structure based on role
interface BaseFormData {
  name: string;
  email: string;
  availability: "full-time" | "part-time";
  courseCode: string;
  role: "tutor" | "lab-assistant";
}

interface TutorFormData extends BaseFormData {
  experience: number;
}

interface LabAssistantFormData extends BaseFormData {
  qualifications: string;
}

type FormData = TutorFormData | LabAssistantFormData;


const TutorApplicationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const selectedRole = watch("role");


 const onSubmit = async (data: FormData) => {
  setDuplicateError(null);

  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // optional if using cookies
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Application failed');
    }

    alert('Application submitted successfully!');
  } catch (err) {
    if (err instanceof Error) {
      setDuplicateError(err.message);
    } else {
      setDuplicateError('Something went wrong.');
    }
  }
};

  return (
<div className="flex flex-col min-h-screen w-full">
    {/* Full-width Header */}
    <header className="bg-blue-600 text-white p-4 shadow-md fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center px-4">
        <a href="/">
          <img alt="Teach Team" src={logoImage.src} className="w-12 h-12 cursor-pointer" />
        </a>
        <div className="flex items-center space-x-4">
          <AuthWrapper />
        </div>
      </nav>
    </header>

    {/* Padding to account for fixed header */}
    <main className="pt-20 flex-grow"></main>
    
    {/* Main content */}
    <div className="max-w-7xl mx-auto p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl">
      <div className="bg-white p-8 rounded-xl flex flex-col gap-6">
        <h2 className="text-5xl font-bold text-center">Tutor Application Form</h2>
        {duplicateError && <p className="text-red-500 text-center">{duplicateError}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Role Selection */}
          <div>
            <label className="block font-semibold">Applying As</label>
            <select
              {...register("role", { required: "Please select a role" })}
              className="border p-3 w-full rounded text-lg"
            >
              <option value="">Select role</option>
              <option value="tutor">Tutor</option>
              <option value="lab-assistant">Lab Assistant</option>
            </select>
            {errors.role && <p className="text-red-500">{errors.role.message}</p>}
          </div>

          {/* Name Input */}
          <div>
            <label className="block font-semibold">Full Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="John Doe"
              className="border p-3 w-full rounded text-lg"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email Input */}
          <div>
            <label className="block font-semibold">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
              placeholder="you@example.com"
              className="border p-3 w-full rounded text-lg"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          {/* Experience or Qualifications */}
          {selectedRole === "tutor" ? (
            <div>
              <label className="block font-semibold">Teaching Experience (Years)</label>
              <input
                type="number"
                {...register("experience" as const, {
                  required: "Experience is required",
                  min: { value: 0, message: "Experience cannot be negative" },
                })}
                placeholder="e.g., 3"
                className="border p-3 w-full rounded text-lg"
              />
              {errors.experience && <p className="text-red-500">{errors.experience.message}</p>}
            </div>
          ) : selectedRole === "lab-assistant" ? (
            <div>
              <label className="block font-semibold">Qualifications</label>
              <input
                {...register("qualifications" as const, {
                  required: "Qualifications are required",
                })}
                placeholder="e.g., BSc in Computer Science"
                className="border p-3 w-full rounded text-lg"
              />
              {errors.qualifications && <p className="text-red-500">{errors.qualifications.message}</p>}
            </div>
          ) : null}

          {/* Availability Input */}
          <div>
            <label className="block font-semibold">Availability</label>
            <select
              {...register("availability", { required: "Availability is required" })}
              className="border p-3 w-full rounded text-lg text-gray-700"
            >
              <option value="">Select availability</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
            </select>
            {errors.availability && <p className="text-red-500">{errors.availability.message}</p>}
          </div>

          {/* Course Code Dropdown */}
          <div>
            <label className="block font-semibold">Course</label>
            <select
              {...register("courseCode", { required: "Please select a course" })}
              className="border p-3 w-full rounded text-lg"
            >
              <option value="">Select a course</option>
              {courseOptions.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            {errors.courseCode && <p className="text-red-500">{errors.courseCode.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default TutorApplicationForm;