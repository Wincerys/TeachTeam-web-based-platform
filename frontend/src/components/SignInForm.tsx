import React, { useState } from 'react';
import logoImage from './logo.png';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

// User interface for type safety
export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role?: 'tutor' | 'lecturer';
    dateJoined?: string;
}

// SignIn pop-up component
interface SignInProps {
    isVisible: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
    onLoginSuccess?: (user: User) => void; // Made optional with ?
}

const SignIn: React.FC<SignInProps> = ({ isVisible, onClose, onSwitchToSignUp, onLoginSuccess }) => {
    // State management
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const router = useRouter();
    const { setUser, refreshUser } = useUser();

    // If visibility is set to false, then render this component invisible
    if (!isVisible) return null;

    // Email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    // Password validation
    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return false;
        }
        setPasswordError('');
        return true;
    };

    // Reset form
    const resetForm = () => {
        setError('');
        setEmail('');
        setPassword('');
        setEmailError('');
        setPasswordError('');
        setIsLoading(false);
    };

    // Upon mouse click outside the popup, close the popup
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
        setError('');
        
        // Client-side validation
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        setIsLoading(true);

        try {
            const data = await authService.signin(email, password);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Sign in failed');
            }

            // Update the user context
            setUser(data.user);
            
            // Refresh user data to ensure we have the latest info
            await refreshUser();
            
            // Call the success callback only if it exists and is a function
            if (onLoginSuccess && typeof onLoginSuccess === 'function') {
                onLoginSuccess(data.user);
            }
            
            // Close the modal
            onClose();
            resetForm();

            // Redirect based on role (if role exists) or to a default page
            if (data.user.role === 'tutor') {
                router.push('/apply');
            } else if (data.user.role === 'lecturer') {
                router.push('/lecturer');
            } else {
                // Default redirect if no role is specified
                router.push('/dashboard'); // or wherever you want to redirect
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'An error occurred during sign in');
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
            <div className="w-[600px] md:w-[620px] h-[600px] flex flex-col rounded-xl max-h-[90vh]">
                {/* Close button */}
                <button 
                    className="text-white text-xl place-self-end hover:text-gray-300 transition-colors" 
                    onClick={() => { onClose(); resetForm(); }}
                    aria-label="Close"
                >
                    ✕
                </button>
                
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex flex-col justify-between items-center overflow-auto">
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="w-[540px] md:w-[560px] space-y-4 mx-auto bg-black p-6 flex flex-col rounded border-b border-t border-gray-500/10">
                            {/* Logo image */}
                            <img alt="Teach Team" src={logoImage.src} className="w-30 h-30 mx-auto" />
                            
                            {/* Main signin label */}
                            <h1 className="text-center text-2xl/9 text-white font-semibold mb-6">Sign In to TeachTeam</h1>
                            
                            {/* Error message */}
                            {error && <p className="text-red-500 text-center bg-red-100 p-2 rounded">{error}</p>}
                            
                            {/* Email field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-lg/7 font-medium text-white">
                                    Email *
                                </label>
                                <input 
                                    id="email" 
                                    placeholder="you@example.com" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) validateEmail(e.target.value);
                                    }}
                                    onBlur={(e) => validateEmail(e.target.value)}
                                    className={`rounded-sm block w-full py-1.5 pr-3 pl-3 text-base text-white placeholder:text-gray-400 border ${
                                        emailError ? 'border-red-500' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                    required
                                />
                                {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
                            </div>
                            
                            {/* Password field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-lg/7 font-medium text-white">
                                    Password *
                                </label>
                                <input 
                                    id="password" 
                                    placeholder="Enter your password..." 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) validatePassword(e.target.value);
                                    }}
                                    onBlur={(e) => validatePassword(e.target.value)}
                                    className={`rounded-sm block w-full py-1.5 pr-3 pl-3 text-base text-white placeholder:text-gray-400 border ${
                                        passwordError ? 'border-red-500' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-indigo-600 focus:border-transparent`}
                                    required
                                />
                                {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
                            </div>
                            
                            {/* Submit button */}
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="mt-6 mx-8 bg-blue-600 text-white text-center p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                            
                            {/* Switch to Sign Up */}
                            <div className="text-center mt-4">
                                <p className="text-white">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={onSwitchToSignUp}
                                        className="text-blue-300 hover:text-blue-200 underline"
                                    >
                                        Sign Up
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

export default SignIn;