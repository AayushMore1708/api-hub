'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';


export default function AuthButton() {
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (session) {
        try {
          const response = await fetch('/api/profile');
          const data = await response.json();
          setProfileImage(data.image);
        } catch (error) {
          console.error('Error fetching profile image:', error);
          setProfileImage('/default-avatar.png');
        }
      } else {
        setProfileImage(null);
      }
    };

    fetchProfileImage();
  }, [session]);
  if (status === 'loading') {
    return null;
  }

  if (session) {
    return (
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        <div className='flex flex-col justify-center items-center gap-2'>
          <div className="flex items-center gap-3">
          <img
            src={profileImage || '/default-avatar.png'}
            alt="Profile"
            className="w-10 h-10 rounded-full"
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
               <button
          onClick={() => signOut()}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
          title="Sign Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
        </div>
          <span className="text-sm text-gray-700">Welcome, {session.user?.name}!</span>
        </div>
   
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-4">API Hub</h2>
        <p className="text-center mb-4">Sign in to access API Hub</p>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => signIn('google')}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Sign In with Google
          </button>
          <button
            onClick={() => signIn('github')}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          >
            Sign In with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
