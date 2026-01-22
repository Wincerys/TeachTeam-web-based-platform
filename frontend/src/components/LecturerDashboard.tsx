import React, { useEffect, useState } from "react";
import logoImage from '../assets/logo.png';
import AuthWrapper from '../components/AuthWrapper';
import withRoleProtection from '../components/withRoleProtection';
import { useNavigate } from 'react-router-dom';

// Type definition for a general application
type Application = {
  name: string;
  email: string;
  experience?: number;       // Used only for Tutor applicants
  qualifications?: string;   // Used only for Lab Assistant applicants
  availability: string;
  courseCode: string;
  selectionCount?: number;
};

// Extended type for candidates selected by lecturers with rank and comment
type RankedCandidate = Application & {
  rank: number;
  comment: string;
};

// Sorting options - limited to only course name or availability
type SortOption = "courseName" | "availability";

// Static list of courses available for selection
const courses = [
  { code: "COSC1234", name: "Full Stack Development" },
  { code: "COSC2345", name: "Data Structures" },
  { code: "COSC3456", name: "Artificial Intelligence" },
  { code: "COSC4567", name: "Cyber Security" },
];

const LecturerDashboard: React.FC = () => {
  // All applications submitted
  const [applications, setApplications] = useState<Application[]>([]);

  // Currently selected course by the lecturer
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // Candidates selected by the lecturer for the current course
  const [selectedCandidates, setSelectedCandidates] = useState<RankedCandidate[]>([]);

  // Search filters
  const [searchFilters, setsearchFilters] = useState({
    name: "",
    availability: "",
    skillSet: "",
  });

  // Availability options
  const availabilityOptions = ["Full-time", "Part-time"]; 

  // Define sort method and direction.By default, sort by course name in ascending order.
  const [sortBy, setSortBy] = useState<SortOption>("courseName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Applicant statistics for most chosen (one applicant), least chosen (one applicant), and unselected (multiple applicants)
  const [applicantStats, setApplicantStats] = useState<{
    mostChosen: Application | null;
    leastChosen: Application | null;
    notSelected: Application[];
  }>({
    mostChosen: null,
    leastChosen: null,
    notSelected: [],
  });

  // Function to calculate applicant statistics (most chosen, least chosen, unselected)
  const calculateApplicantStats = (allApplications: Application[], selections: any) => {
    // Count selection frequency for each applicant
    const applicationsWithCounts = [...allApplications].map(app => ({
      ...app,
      selectionCount: 0
    }));
    
    // Count selections for each applicant
    Object.values(selections).forEach((courseCandidates: any) => {
      courseCandidates.forEach((candidate: RankedCandidate) => {
        const appIndex = applicationsWithCounts.findIndex(app => app.email === candidate.email);
        if (appIndex >= 0) {
          applicationsWithCounts[appIndex].selectionCount = 
            (applicationsWithCounts[appIndex].selectionCount || 0) + 1;
        }
      });
    });
    
    // Sort by selection count
    applicationsWithCounts.sort((a, b) => 
      (b.selectionCount || 0) - (a.selectionCount || 0)
    );
    
    // Find most chosen and least chosen applicants
    const selectedApps = applicationsWithCounts.filter(app => (app.selectionCount || 0) > 0);
    const mostChosen = selectedApps.length > 0 ? selectedApps[0] : null;
    const leastChosen = selectedApps.length > 0 ? selectedApps[selectedApps.length - 1] : null;
    
    // Find not selected applicants
    const notSelected = applicationsWithCounts.filter(app => !(app.selectionCount || 0));
    
    return {
      mostChosen,
      leastChosen,
      notSelected
    };
  };

  // Load all applications from localStorage when the component mounts
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tutorApplications") || "[]");
    setApplications(stored);
  }, []);

  // Calculate applicant statistics
  useEffect(() => {
    if (applications.length > 0) {
      // Load all saved selections
      const allSelections = JSON.parse(localStorage.getItem("lecturerSelections") || "{}");
      setApplicantStats(calculateApplicantStats(applications, allSelections));
    }
  }, [applications]);

  // Clear selected candidates when course changes
  useEffect(() => {
    setSelectedCandidates([]);
  }, [selectedCourse]);

  // Select a candidate, add to selectedCandidates if not already added
  const handleSelectCandidate = (candidate: Application) => {
    const exists = selectedCandidates.find(
      (c) => c.email === candidate.email && c.courseCode === candidate.courseCode
    );
    if (!exists) {
      setSelectedCandidates((prev) => [
        ...prev,
        { ...candidate, rank: prev.length + 1, comment: "" },
      ]);
    }
  };

  // Update rank or comment for a specific candidate
  const updateCandidate = (email: string, updates: Partial<RankedCandidate>) => {
    setSelectedCandidates((prev) =>
      prev.map((c) =>
        c.email === email && c.courseCode === selectedCourse ? { ...c, ...updates } : c
      )
    );
  };

  // Save selected candidates, their rankings, and comments to localStorage
  const handleSaveSelections = () => {
    const existing = JSON.parse(localStorage.getItem("lecturerSelections") || "{}");

    const updatedSelections = {
      ...existing,
      [selectedCourse]: selectedCandidates,
    };

    localStorage.setItem("lecturerSelections", JSON.stringify(updatedSelections));
    alert("Selections saved successfully!");

    // Clear selections after saving to reset the layout
    setSelectedCandidates([]);

    // Recalculate applicant stats by updating the selections
    setApplicantStats(calculateApplicantStats(applications, updatedSelections));
  };

  // Clear all selections (function implementation for button)
  const handleClearSelections = () => {
    if (selectedCandidates.length > 0) {
      setSelectedCandidates([]);
      alert("All selections cleared!");
    }
  }

  // Handle constant filter search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setsearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle sort changes
  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      // Change direction if same column is clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  // Filter the applications based on search filters and selected course
  const filteredApplications = applications.filter((app) => {
    // Only show applications for selected course if one is selected
    if (selectedCourse && app.courseCode !== selectedCourse) {
      return false;
    }
    // Filter by name
    if (searchFilters.name && !app.name.toLowerCase().includes(searchFilters.name.toLowerCase())) {
      return false;
    }
    // Filter by availability
    if (searchFilters.availability && !app.availability.toLowerCase().includes(searchFilters.availability.toLowerCase())) {
      return false;
    }
    // Filter by skill set (could be in qualifications or experience)
    if (searchFilters.skillSet) {
      const skillSetLower = searchFilters.skillSet.toLowerCase();
      if (
        !(app.qualifications && app.qualifications.toLowerCase().includes(skillSetLower)) &&
        !(typeof app.experience === 'number' && app.experience > 0)
      ) {
        return false;
      }
    }
    return true;
  });

  // Find course name by code (for sorting functionality)
  const getCourseNameByCode = (code: string): string => {
    const course = courses.find(c => c.code === code);
    return course ? course.name : code;
  };

  // Sort filtered applications either by course name or availability
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "courseName":
        // Get the course names for comparison
        const courseNameA = getCourseNameByCode(a.courseCode);
        const courseNameB = getCourseNameByCode(b.courseCode);
        comparison = courseNameA.localeCompare(courseNameB);
        break;
      case "availability":
        comparison = a.availability.localeCompare(b.availability);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col min-h-screen w-full">
    {/* Full-width Header */}
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md fixed top-0 w-full z-50">
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
        <h1 className="text-4xl font-bold text-center mb-6">Lecturer Dashboard</h1>
        
        {/* Role confirmation banner */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <p className="text-blue-800 text-center">
            ✅ You have access to the lecturer dashboard as a <span className="font-semibold">lecturer</span>.
          </p>
        </div>

        {/* Applicant Statistics Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Applicant Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Most Chosen Applicant Card */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-2">Most Selected Applicants</h3>
              {/* If a most chosen applicant exists then display their details */}
              {applicantStats.mostChosen ? (
                <div>
                  <p className="font-semibold">{applicantStats.mostChosen.name}</p>
                  <p className="text-sm text-gray-600">{applicantStats.mostChosen.email}</p>
                  <p className="mt-2 text-green-700 font-medium">
                    Selected {applicantStats.mostChosen.selectionCount} time(s)
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No applicants have been selected yet</p>
              )}
            </div>
            {/* Least Chosen Applicant Card */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Least Selected Applicants</h3>
              {/*If a least chosen applicant exists then display their details */}
              {applicantStats.leastChosen ? (
                <div>
                  <p className="font-semibold">{applicantStats.leastChosen.name}</p>
                  <p className="text-sm text-gray-600">{applicantStats.leastChosen.email}</p>
                  <p className="mt-2 text-yellow-700 font-medium">
                    Selected {applicantStats.leastChosen.selectionCount} time(s)
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No applicants have been selected yet</p>
              )}
            </div>
            {/* Not Selected Applicants Card */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">Unselected Applicants</h3>
              {/*If unselected applicants exist then display their details */}
              {applicantStats.notSelected.length > 0 ? (
                <div>
                  <p className="font-medium">{applicantStats.notSelected.length} applicant(s) not selected</p>
                  <div className="mt-2 max-h-24 overflow-y-auto text-sm">
                    {applicantStats.notSelected.slice(0, 3).map((app, i) => (
                      <p key={i} className="text-gray-700">{app.name}</p>
                    ))}
                    {/* If there are more than 3 unselected applicants then just display "more..." instead of further applicant names */}
                    {applicantStats.notSelected.length > 3 && (
                      <p className="text-gray-500 italic">And {applicantStats.notSelected.length - 3} more...</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">All applicants have been selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="text-xl block font-semibold mb-2">Select Course:</label>
          <select
            className="border p-3 rounded w-full text-lg"
            onChange={(e) => setSelectedCourse(e.target.value)}
            value={selectedCourse}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">Filter Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Input for tutor name search */}
            <div>
              <label className="block text-sm font-medium mb-1">Tutor Name</label>
              <input
                type="text"
                name="name"
                className="border p-2 rounded w-full"
                value={searchFilters.name}
                onChange={handleSearchChange}
                placeholder="e.g. John Doe"
              />
            </div>
            {/* Input for skillset search */}
            <div>
              <label className="block text-sm font-medium mb-1">Skill Set</label>
              <input
                type="text"
                name="skillSet"
                className="border p-2 rounded w-full"
                value={searchFilters.skillSet}
                onChange={handleSearchChange}
                placeholder="e.g. Bachelors of Biomedicine"
              />
            </div>
            {/* Dropdown for availability filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Availability</label>
              <select
              name="availability"
              className="border p-2 rounded w-full"
              value={searchFilters.availability}
              onChange={handleSearchChange}
              >
                <option value="">Any availability</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applicants List with Sorting */}
      <div className="bg-white p-6 rounded-lg mt-4">
        <div className="flex justify-between items-center mb-4">
          {/* Applicants Heading */}
          <h2 className="text-2xl font-semibold">Applicants:</h2>
          {/* Sort Options Buttons (coursename and availability) */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Sort by:</span>
            <button
              className={`px-3 py-1 rounded text-sm ${sortBy === "courseName" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => handleSortChange("courseName")}
            >
              Course Name {sortBy === "courseName" && (sortDirection === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${sortBy === "availability" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => handleSortChange("availability")}
            >
              Availability {sortBy === "availability" && (sortDirection === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        {/* In the case of no applicants matching the search criteria, display a relevant message */}
        {/* Otherwise display all applicant cards with relevant details, and an option to select applicant */}
        {sortedApplications.length === 0 ? (
          <p className="text-gray-600">No applications match your search criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Applicant Cards */}
            {sortedApplications.map((app, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold">{app.name}</h2>
                <p><strong>Email:</strong> {app.email}</p>
                <p><strong>Course:</strong> {app.courseCode} - {getCourseNameByCode(app.courseCode)}</p>
                <p><strong>Availability:</strong> {app.availability}</p>
                {app.experience !== undefined ? (
                  <p><strong>Experience:</strong> {app.experience} years</p>
                ) : (
                  <p><strong>Qualifications:</strong> {app.qualifications}</p>
                )}
                {/* Selection status indicator labels (most selected, least selected, not yet selected) */}
                {applicantStats.mostChosen && applicantStats.mostChosen.email === app.email && (
                  <p className="mt-1 inline-block px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Most selected</p>
                )}
                {applicantStats.leastChosen && applicantStats.leastChosen.email === app.email && 
                  applicantStats.leastChosen.email !== applicantStats.mostChosen?.email && (
                  <p className="mt-1 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Least selected</p>
                )}
                {applicantStats.notSelected.some(a => a.email === app.email) && (
                  <p className="mt-1 inline-block px-2 py-1 bg-red-100 text-red-800 text-sm rounded">Not yet selected</p>
                )}
                {/* Select candidate button */}
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => handleSelectCandidate(app)}
                >
                  Select Candidate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* If selected, show selected candidates for ranking and commenting */}
      {selectedCandidates.length > 0 && (
        <div className="mt-10 bg-white p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Selected Candidates</h2>
          {selectedCandidates.map((candidate, i) => (
            <div key={i} className="border p-4 mb-4 rounded bg-gray-50">
              <h3 className="text-xl font-medium">
                {candidate.name} ({candidate.email})
              </h3>

              {/* Ranking Input */}
              <label className="block mt-2">Rank (1 = highest):</label>
              <input
                type="number"
                className="border p-2 rounded w-20"
                value={candidate.rank}
                min={1}
                onChange={(e) =>
                  updateCandidate(candidate.email, {
                    rank: parseInt(e.target.value),
                  })
                }
              />

              {/* Comment Input */}
              <label className="block mt-2">Comment:</label>
              <textarea
                className="border p-2 rounded w-full"
                rows={3}
                value={candidate.comment}
                onChange={(e) =>
                  updateCandidate(candidate.email, {
                    comment: e.target.value,
                  })
                }
              />
            </div>
          ))}

          {/* Save Selections Button */}
          <button
            className="mr-2 mt-4 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleSaveSelections}
          >
            Save Selections
          </button>

          {/* Clear Selections Button */}
          <button 
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleClearSelections}
          >
            Clear Selections
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

// Export the protected component - only lecturers can access this page
export default withRoleProtection(LecturerDashboard, {
  allowedRoles: ['lecturer'],
  redirectTo: '/'
});