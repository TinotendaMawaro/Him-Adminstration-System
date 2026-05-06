import React, { useState, useRef } from 'react';
import api from '../lib/api';

const ProfilePictureUpload = ({ currentPic, onUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await api.post('/user/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.profile_pic) {
                onUpdate(response.data.profile_pic);
                alert('Profile picture updated successfully!');
            } else {
                throw new Error('No URL returned');
            }
        } catch (error) {
            console.error('Upload error:', error.response?.data?.message || error.message);
            alert('Upload failed. Please try again.');
        }
        setUploading(false);
    };

    return (
        <div className="profile-picture-upload">
            <div className="current-pic mb-4">
                {currentPic ? (
                    <img
                        src={currentPic}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-gray-300">
                        <span className="text-white text-2xl font-bold">U</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />

            <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Upload New Picture'}
            </button>
        </div>
    );
};

export default ProfilePictureUpload;