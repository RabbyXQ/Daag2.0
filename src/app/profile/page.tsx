'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { FaPencilAlt, FaCheck, FaTimes, FaUpload, FaCamera } from 'react-icons/fa';

const ProfilePage = () => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({
    id: '', // Add ID here
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    mobile: '',
    occupation: '',
    avatar: '',
    age: '',
    dob: '',
    facebook: '',
    twitter: '',
    linkedIn: ''
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'followers' | 'followings'>('followers');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
        setAvatarPreview(data.avatar || 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg');
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setInputValue(userData[field as keyof typeof userData] || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setInputValue('');
    setAvatarFile(null);
    setAvatarPreview(userData.avatar || 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg');
  };

  const handleSave = async (field: string) => {
    try {
      const token = localStorage.getItem('token');
      const value = field === 'age' ? parseInt(inputValue, 10) : inputValue;
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      setUserData({ ...userData, [field]: value });
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('userId', userData.id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload avatar: ${error}`);
      }
      const data = await response.json();
      setUserData({ ...userData, avatar: data.name });
      setAvatarPreview(URL.createObjectURL(avatarFile));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field);
    }
  };

  const renderField = (label: string, field: string, icon: JSX.Element, helperText?: string) => {
    return (
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 w-1/3">
          <p className="text-gray-500 dark:text-gray-300 font-medium text-sm">{label}</p>
        </div>
        <div className="flex-1">
          {editingField === field ? (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              className="w-full p-2 border bg-gray-50 dark:bg-gray-500 text-gray-900 dark:text-gray-50 border-green-500 dark:border-green-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-700"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100">{userData[field as keyof typeof userData]}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {editingField === field ? (
            <>
              <button
                onClick={() => handleSave(field)}
                className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600"
              >
                <FaCheck className="h-5 w-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>{helperText && (
              <p className="text-xs text-gray-500">{helperText}</p>
            )}
            <button
              onClick={() => handleEdit(field)}
              className="p-2 bg-gray-50 rounded-full hover:bg-gray-300"
            >
              {icon}
            </button>
            </>
          )}
        </div>
        
      </div>
    );
  };

  return (
    <div className="max-w-4xl bg-white dark:bg-gray-900 mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="flex items-center mb-8">
        <label htmlFor="avatar-upload" className="relative cursor-pointer">
          <img
            src={avatarPreview || 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaCamera className="h-8 w-8 text-gray-600 dark:text-gray-50 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </label>
        <div className="ml-6">
          <p className="text-gray-900 dark:text-gray-50 text-xl font-semibold">Avatar</p>
          <button
            onClick={handleAvatarUpload}
            className="mt-2 p-2 bg-green-500 rounded-full text-white hover:bg-gray-600"
          >
            <FaUpload className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {renderField('First Name', 'firstName', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Last Name', 'lastName', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Email', 'email', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Address', 'address', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Mobile', 'mobile', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Occupation', 'occupation', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Age', 'age', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Date of Birth', 'dob', <FaPencilAlt className="h-5 w-5 text-gray-700" />, 'dd/mm/yyyy')}
        {renderField('Facebook', 'facebook', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('Twitter', 'twitter', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
        {renderField('LinkedIn', 'linkedIn', <FaPencilAlt className="h-5 w-5 text-gray-700" />)}
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('followers')}
              className={`${
                activeTab === 'followers' ? 'border-green-600 text-green-600 dark:border-green-700 dark:text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-6 border-b-2 font-medium text-md`}
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTab('followings')}
              className={`${
                activeTab === 'followings' ? 'border-green-600 text-green-600 dark:border-green-700 dark:text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } py-4 px-6 border-b-2 font-medium text-md`}
            >
              Followings
            </button>
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'followers' ? (
            <div>
              {/* Replace this with your followers content */}
              <p>List of followers goes here...</p>
            </div>
          ) : (
            <div>
              {/* Replace this with your followings content */}
              <p>List of followings goes here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
