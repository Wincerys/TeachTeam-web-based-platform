import React, { useState } from 'react';
import logoImage from './logo.png';

// User interface for type safety
interface User {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'tutor' | 'lecturer';
    dateJoined: string;
}

// SignUp pop-up component
interface SignUpProps {
    isVisible: boolean;
    onClose: () => void;
    onSwitchToSignIn: () => void;
    onSignUpSuccess: (user: User) => void;
}

const SignUp: React.FC<SignUpProps> = ({ isVisible, onClose, onSwitchToSignIn, onSignUpSuccess }) => {
    // State management
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'tutor' as 'tutor' | 'lecturer'
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // If visibility is set to false, then render this component invisible
    if (!isVisible) return null;

    // Validation functions
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'firstName':
                if (!value.trim()) return 'First name is required';
                if (value.trim().length < 2) return 'First name must be at least 2 characters';
                return '';
            
            case 'lastName':
                if (!value.trim()) return 'Last name is required';
                if (value.trim().length < 2) return 'Last name must be at least 2 characters';
                return '';
            
            case 'username':
                if (!value.trim()) return 'Username is required';
                if (value.trim().length < 3) return 'Username must be at least 3 characters';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
                return '';
            
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return '';
            
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                }
                return '';
            
            case 'confirmPassword':
                if (!value) return 'Please confirm your password';
                if (value !== formData.password) return 'Passwords do not match';
                return '';
            
            default:
                return '';
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Validate confirm password when password changes
        if (name === 'password' && formData.confirmPassword) {
            const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
            setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError }));
        }
    };

    // Handle blur events for real-time validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'tutor'
        });
        setErrors({});
        setGeneralError('');
        setIsLoading(false);
    };

    // Handle close
    const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.id === "outsidePopup") {
            onClose();
            resetForm();
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');
        
        // Validate all fields
        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'role') {
                const error = validateField(key, formData[key as keyof typeof formData] as string);
                if (error) newErrors[key] = error;
            }
        });

        setErrors(newErrors);

        // If there are validation errors, don't submit
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    role: formData.role
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sign up failed');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // Call success callback
            onSignUpSuccess(data.user);
            
            // Close modal and reset form
            onClose();
            resetForm();

        } catch (error) {
            setGeneralError(error instanceof Error ? error.message : 'An error occurred during sign up');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-25 flex items-center justify-center z-50" 
            id="outsidePopup" 
            onClick={handleClose}
        >
            <div className="w-[650px] md:w-[670px] max-h-[90vh] flex flex-col rounded-xl overflow-hidden">
                {/* Close button */}
                <button 
                    className="text-white text-xl place-self-end hover:text-gray-300 transition-colors p-2" 
                    onClick={() => { onClose(); resetForm(); }}
                    aria-label="Close"
                >
                    ✕
                </button>
                
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex flex-col items-center overflow-auto">
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="w-full mx-auto space-y-4 bg-black p-6 flex flex-col rounded border-b border-t border-gray-500/10">
                            {/* Logo image */}
                            <img alt="Teach Team" src={logoImage.src} className="w-30 h-30 mx-auto" />
                            
                            {/* Main signup label */}
                            <h1 className="text-center text-2xl/9 text-white font-semibold mb-6">Create Your TeachTeam Account</h1>
                            
                            {/* General error message */}
                            {generalError && (
                                <p className="text-red-500 text-center bg-red-100 p-2 rounded">{generalError}</p>
                            )}
                            
                            {/* Name fields row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-white">
                                        First Name *
                                    </label>
                                    <input 
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2 px-3 text-base text-white placeholder:text-gray-400 border rounded-sm ${
                                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                        placeholder="John"
                                        required
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-white">
                                        Last Name *
                                    </label>
                                    <input 
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2 px-3 text-base text-white placeholder:text-gray-400 border rounded-sm ${
                                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                        placeholder="Doe"
                                        required
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                                </div>
                            </div>
                            
                            {/* Username field */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-white">
                                    Username *
                                </label>
                                <input 
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full py-2 px-3 text-base text-white placeholder:text-gray-400 border rounded-sm ${
                                        errors.username ? 'border-red-500' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                    placeholder="johndoe"
                                    required
                                />
                                {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                            </div>
                            
                            {/* Email field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-white">
                                    Email *
                                </label>
                                <input 
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full py-2 px-3 text-base text-white placeholder:text-gray-400 border rounded-sm ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                    placeholder="john@example.com"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>
                            
                            {/* Role selection */}
                            <div className="space-y-2">
                                <label htmlFor="role" className="block text-sm font-medium text-white">
                                    I am a *
                                </label>
                                <select 
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full py-2 px-3 text-base text-white border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    required
                                >
                                    <option value="tutor">Tutor</option>
                                    <option value="lecturer">Lecturer</option>
                                </select>
                            </div>
                            
                            {/* Password fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-white">
                                        Password *
                                    </label>
                                    <input 
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2 px-3 text-base text-white placeholder:text-gray-400 border rounded-sm ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                        placeholder="Password"
                                        required
                                    />
                                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                                        Confirm Password *
                                    </label>
                                    <input 
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full py-2 px-3 text-base text-white placeholder:text-gray-400 border rounded-sm ${
                                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                        placeholder="Confirm Password"
                                        required
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                            
                            {/* Submit button */}
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 bg-blue-600 text-white text-center p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                            
                            {/* Switch to Sign In */}
                            <div className="text-center mt-4">
                                <p className="text-white">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={onSwitchToSignIn}
                                        className="text-blue-300 hover:text-blue-200 underline"
                                    >
                                        Sign In
                                    </button>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;