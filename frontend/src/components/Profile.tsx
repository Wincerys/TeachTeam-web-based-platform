import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { authAPI, handleApiError } from '../services/api';

// Updated interface to match backend response
interface UserProfile {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'tutor' | 'lecturer';
    dateJoined: string;
    profilePicture?: string;
    bio?: string;
    phoneNumber?: string;
    location?: string;
}

interface ProfileProps {
    user: UserProfile;
    onClose?: () => void;
    isModal?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, onClose, isModal = false }) => {
    const { setUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<UserProfile>(user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Update edited user when user prop changes
    useEffect(() => {
        setEditedUser(user);
    }, [user]);

    // Format date for display
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    // Handle profile update
    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const updatedUser = await authAPI.updateProfile({
                firstName: editedUser.firstName,
                lastName: editedUser.lastName,
                bio: editedUser.bio,
                phoneNumber: editedUser.phoneNumber,
                location: editedUser.location
            });

            // Update context and localStorage
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            setError(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle cancel editing
    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    // Component content (rest of the component remains the same)
    const profileContent = (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-8 text-white">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-full p-4">
                        <User size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isEditing ? (
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editedUser.firstName}
                                        onChange={handleInputChange}
                                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/70"
                                        placeholder="First Name"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editedUser.lastName}
                                        onChange={handleInputChange}
                                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/70"
                                        placeholder="Last Name"
                                    />
                                </div>
                            ) : (
                                `${editedUser.firstName} ${editedUser.lastName}`
                            )}
                        </h1>
                        <p className="text-blue-100">@{editedUser.username}</p>
                        <p className="text-blue-200 capitalize">{editedUser.role}</p>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-4 flex space-x-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors disabled:bg-green-400"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                    
                    {isModal && onClose && (
                        <button
                            onClick={onClose}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
                {/* Status messages */}
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
                
                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-800 bg-gray-50 p-2 rounded">{editedUser.email}</p>
                            <small className="text-gray-500">Email cannot be changed</small>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Username</label>
                            <p className="text-gray-800 bg-gray-50 p-2 rounded">@{editedUser.username}</p>
                            <small className="text-gray-500">Username cannot be changed</small>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Role</label>
                            <p className="text-gray-800 bg-gray-50 p-2 rounded capitalize">{editedUser.role}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Member Since</label>
                            <p className="text-gray-800 bg-gray-50 p-2 rounded">{formatDate(editedUser.dateJoined)}</p>
                        </div>
                    </div>
                    
                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Additional Information</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={editedUser.phoneNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter phone number"
                                />
                            ) : (
                                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                                    {editedUser.phoneNumber || 'Not provided'}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Location</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="location"
                                    value={editedUser.location || ''}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter location"
                                />
                            ) : (
                                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                                    {editedUser.location || 'Not provided'}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Bio</label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={editedUser.bio || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-800 bg-gray-50 p-2 rounded min-h-[100px]">
                                    {editedUser.bio || 'No bio provided'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Account Statistics */}
                <div className="mt-8 pt-6 border-t">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-blue-600">
                                {Math.floor((Date.now() - new Date(editedUser.dateJoined).getTime()) / (1000 * 60 * 60 * 24))}
                            </h3>
                            <p className="text-gray-600">Days as Member</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-green-600">Active</h3>
                            <p className="text-gray-600">Account Status</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-purple-600 capitalize">{editedUser.role}</h3>
                            <p className="text-gray-600">User Type</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Return modal or regular component
    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
                    {profileContent}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {profileContent}
        </div>
    );
};

export default Profile;
