import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import Profile from './Profile';

const ProfileDropdown: React.FC = () => {
    const { user, logout, isAuthenticated } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Don't render if not authenticated
    if (!isAuthenticated || !user) {
        return null;
    }

    const handleSignOut = async () => {
        try {
            await logout();
            setIsDropdownOpen(false);
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    const handleViewProfile = () => {
        setIsProfileModalOpen(true);
        setIsDropdownOpen(false);
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 backdrop-blur-sm border border-white/20"
                >
                    <div className="bg-white/20 rounded-full p-1">
                        <User size={20} />
                    </div>
                    <span className="font-medium">
                        {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-full p-2">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                    <p className="text-blue-100 text-sm">@{user.username}</p>
                                    <p className="text-blue-200 text-xs capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={handleViewProfile}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Settings size={18} />
                                <span>View Profile</span>
                            </button>
                            
                            <hr className="my-1 border-gray-200" />
                            
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {isProfileModalOpen && user && (
                <Profile
                    user={user}
                    onClose={() => setIsProfileModalOpen(false)}
                    isModal={true}
                />
            )}
        </>
    );
};

export default ProfileDropdown;