import React from 'react';
import ProfilePictureUpload from "../../ProfilePictureUpload";

const Icons = {
  X: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function ProfileSection({ user, onClose, onUpdate }) {
  return (
    <div className="relative min-h-full p-6">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Icons.X className="w-6 h-6 text-gray-500" />
        </button>
      )}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
        <ProfilePictureUpload
          currentPic={user?.profile_photo}
          onUpdate={(newPic) => onUpdate?.({ ...user, profile_photo: newPic })}
        />
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}