import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from next/router
import { useUser } from '../contexts/UserContext';
import ProfileDropdown from './ProfileDropdown';

const AuthWrapper: React.FC = () => {
    const { user, isLoading, isAuthenticated } = useUser();
    const navigate = useNavigate(); // Changed from useRouter

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white">Loading...</span>
            </div>
        );
    }

    // Show profile dropdown and role-specific button if authenticated
    if (isAuthenticated && user) {
        // Determine the role-specific navigation
        const getRoleNavigation = () => {
            switch (user.role) {
                case 'tutor':
                    return {
                        label: 'Apply as Tutor',
                        path: '/apply',
                        icon: '📝'
                    };
                case 'lecturer':
                    return {
                        label: 'Lecturer Dashboard',
                        path: '/lecturer',
                        icon: '📊'
                    };
                default:
                    return null;
            }
        };

        const roleNav = getRoleNavigation();

        return (
            <div className="flex items-center space-x-3">
                {/* Role-specific navigation button */}
                {roleNav && (
                    <button
                        onClick={() => navigate(roleNav.path)} // Changed from router.push
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 backdrop-blur-sm border border-white/20"
                    >
                        <span className="text-lg">{roleNav.icon}</span>
                        <span className="font-medium hidden md:block">{roleNav.label}</span>
                        <span className="font-medium md:hidden">
                            {user.role === 'tutor' ? 'Apply' : 'Dashboard'}
                        </span>
                    </button>
                )}
                
                {/* Profile dropdown */}
                <ProfileDropdown />
            </div>
        );
    }

    // Show sign in/up buttons if not authenticated
    return (
        <div className="flex items-center space-x-4">
            <button
                onClick={() => navigate('/signin')} // Changed from setShowSignIn
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 backdrop-blur-sm border border-white/20"
            >
                <span className="text-lg">{'➡️'}</span>
                <span className="font-medium">Sign In</span>
            </button>
            <button
                onClick={() => navigate('/signup')} // Changed from setShowSignUp
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 backdrop-blur-sm border border-white/20"
            >
                <span className="text-lg">{'📝'}</span>
                <span className="font-medium">Sign Up</span>
            </button>
        </div>
    );
};

export default AuthWrapper;