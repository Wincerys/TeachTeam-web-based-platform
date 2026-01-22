import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from next/router
import { useUser } from '../contexts/UserContext';
import Profile from '../components/Profile';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <p className="p-4 text-center">Loading profile…</p>;
  }

  if (!user) {
    return <p className="p-4 text-center">No user data available</p>;
  }

  return <Profile user={user} />;
};

export default ProfilePage;