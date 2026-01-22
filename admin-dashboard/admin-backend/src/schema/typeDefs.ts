// src/schema/typeDefs.ts
export const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    username: String!
    email: String!
    role: String!
    isBlocked: Boolean!
    createdAt: String!
  }

  type Course {
    id: ID!
    code: String!
    name: String!
    description: String
    isActive: Boolean!
    lecturer: User
    lecturerId: ID
    createdAt: String!
  }

  type Assignment {
    id: ID!
    course: Course!
    lecturer: User!
    semester: String!
    year: Int!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type CourseReport {
    course: Course!
    chosenCandidates: [Application!]!
    totalApplicants: Int!
    chosenCount: Int!
  }

  type Application {
    id: ID!
    user: User!
    name: String!
    email: String!
    availability: String!
    courseCode: String!
    courseName: String!
    role: String!
    experience: Int
    qualifications: String
    phoneNumber: String!
    emergencyContact: String!
    emergencyPhone: String!
    preferredHours: String!
    transport: String!
    previousInstitutions: String!
    teachingAreas: String!
    motivation: String!
    references: String!
    status: String!
    createdAt: String!
  }

  type Query {
    # Authentication
    me: User
    
    # Users
    users: [User!]!
    user(id: ID!): User
    
    # Courses
    courses: [Course!]!
    course(id: ID!): Course
    
    # Assignments
    assignments: [Assignment!]!
    assignmentsBySemester(semester: String!, year: Int!): [Assignment!]!
    
    # Reports
    courseReports: [CourseReport!]!
    chosenCandidatesReport: [Application!]!
    unchosenCandidatesReport: [Application!]!
    applications: [Application!]!
  }

  type Mutation {
    # Authentication
    login(username: String!, password: String!): AuthPayload!
    
    # User Management
    blockUser(id: ID!): User!
    unblockUser(id: ID!): User!
    
    # Course Management
    createCourse(input: CourseInput!): Course!
    updateCourse(id: ID!, input: CourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    
    # Lecturer Assignment
    assignLecturerToCourse(courseId: ID!, lecturerId: ID!, semester: String!, year: Int!): Assignment!
    removeAssignment(id: ID!): Boolean!
  }

  input CourseInput {
    code: String!
    name: String!
    description: String
    isActive: Boolean = true
  }
`;