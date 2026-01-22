import React, { useEffect } from "react";
import logoImage from '../assets/logo.png'; // Move logo to src/assets/
import '../index.css' // This should come first
import App from './App.tsx'
import AuthWrapper from '../components/AuthWrapper';


const HomePage: React.FC = () => {
  
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md">
        <nav className="flex justify-between items-center container mx-auto">
          <a href="/">
            <img alt="Teach Team" src={logoImage} className="w-12 h-12 cursor-pointer"/>
          </a>
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold">TeachTeam</span>
            <AuthWrapper />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center px-4">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to TeachTeam
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect talented tutors with students. Apply to become a tutor or manage applications as a lecturer.
          </p>
          <div className="space-x-4">
            <a 
              href="/apply" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Apply as Tutor
            </a>
            <a 
              href="/lecturer" 
              className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors inline-block"
            >
              Lecturer Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
