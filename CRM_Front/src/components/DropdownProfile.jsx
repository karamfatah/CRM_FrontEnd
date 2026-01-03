import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Loading...',
    user_image: null,
    image_mime_type: null, // Added for future MIME type support
  });
  const [orgName, setOrgName] = useState('Loading...');

  const trigger = useRef(null);
  const dropdown = useRef(null);
  const navigate = useNavigate();

  // Log access token size to diagnose 431 error
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('Access token length:', token?.length);
    console.log('Access token (first 100 chars):', token?.substring(0, 100)); // Avoid logging full token in production
  }, []);

  // Fetch user profile data and get org name from localStorage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User ID not found in storage');
        }

        const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;
        // Add timestamp to avoid 304 cached responses
        const response = await fetch(`${API_URL}/api/users/profile?user_id=${userId}&t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': localStorage.getItem('access_token'),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const newProfile = {
          name: data.name || 'Unknown User',
          user_image: data.user_image || null,
          image_mime_type: data.image_mime_type || null, // Support MIME type if provided
        };
        setProfile(newProfile);
        // Cache profile in localStorage
        localStorage.setItem('profile', JSON.stringify(newProfile));
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        setProfile({
          name: 'Error',
          user_image: null,
          image_mime_type: null,
        });
        // Show user-friendly error (optional)
        alert('Failed to load profile. Please try again.');
      }
    };

    // Check for cached profile
    const cachedProfile = localStorage.getItem('profile');
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
    } else {
      fetchProfile();
    }

    // Get organization name from localStorage
    const storedOrgName = localStorage.getItem('org_name_en');
    setOrgName(storedOrgName || 'No Organization');
  }, []);

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  }, [navigate]);

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img
          className="w-8 h-8 rounded-full"
          src={
            profile.user_image
              ? profile.image_mime_type
                ? `data:${profile.image_mime_type};base64,${profile.user_image}`
                : `data:image/jpeg;base64,${profile.user_image}`
              : '/images/def_avatar.svg' // correct fallback for missing image
          }
          width="32"
          height="32"
          alt="User"
        />
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
            {orgName}
          </span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
            <div className="font-medium text-gray-800 dark:text-gray-100">{orgName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">{profile.name}</div>
          </div>
          <ul>
            <li>
              <button
                className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3 w-full text-left"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;