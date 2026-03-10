// ============================================================================
// DEPARTMENT PROFILE PAGE - HOD profile settings and management
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./HODIcons";
import { HODButton, HODCard, HODBadge, HODProfileField } from "./HODComponents";

// ============================================================================
// PROFILE AVATAR SECTION
// ============================================================================

const ProfileAvatar = ({ name, department, photoUrl, onPhotoChange }) => {
    return (
        <div className="flex flex-col items-center mb-4 md:mb-6">
            <div className="relative group">
                {photoUrl ? (
                    <img 
                        src={photoUrl} 
                        alt={name} 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-xl border-4 border-white"
                    />
                ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white">
                        <span className="text-white font-bold text-2xl md:text-3xl">{name?.charAt(0) || "H"}</span>
                    </div>
                )}
                {/* Photo upload overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={onPhotoChange}
                        className="hidden"
                    />
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </label>
            </div>
            <p className="text-base md:text-lg font-semibold text-gray-900 mt-3">{name || "HOD Name"}</p>
            <HODBadge variant="purple">{department} Department</HODBadge>
        </div>
    );
};

// ============================================================================
// PROFILE FORM
// ============================================================================

const ProfileForm = ({ user, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        department: user?.department?.name || "Youth",
        zone: user?.zone?.name || "Zone 1",
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="space-y-4">
            <HODProfileField 
                label="Full Name" 
                value={formData.name} 
                onChange={(value) => setFormData({...formData, name: value})}
                icon={HODIcons.UserCircle}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            
            <HODProfileField 
                label="Email" 
                value={formData.email} 
                onChange={(value) => setFormData({...formData, email: value})}
                type="email"
                icon={HODIcons.DocumentChart}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            
            <HODProfileField 
                label="Phone" 
                value={formData.phone} 
                onChange={(value) => setFormData({...formData, phone: value})}
                type="tel"
            />
            
            <HODProfileField 
                label="Department" 
                value={formData.department} 
                disabled={true}
            />
            
            <HODProfileField 
                label="Zone" 
                value={formData.zone} 
                disabled={true}
                icon={HODIcons.BuildingOffice}
            />
            
            <div className="flex gap-3 mt-6">
                <HODButton 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-1"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </HODButton>
                <HODButton variant="secondary" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </HODButton>
            </div>
        </div>
    );
};

// ============================================================================
// PASSWORD CHANGE SECTION
// ============================================================================

const PasswordSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log("Changing password:", passwordData);
        setIsExpanded(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    return (
        <HODCard className="mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                    <p className="text-gray-500 text-sm">Update your account password</p>
                </div>
                <HODButton variant="secondary" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? "Cancel" : "Change"}
                </HODButton>
            </div>
            
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    <HODProfileField 
                        label="Current Password" 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(value) => setPasswordData({...passwordData, currentPassword: value})}
                    />
                    <HODProfileField 
                        label="New Password" 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(value) => setPasswordData({...passwordData, newPassword: value})}
                    />
                    <HODProfileField 
                        label="Confirm New Password" 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(value) => setPasswordData({...passwordData, confirmPassword: value})}
                    />
                    <HODButton onClick={handlePasswordChange} className="w-full">
                        Update Password
                    </HODButton>
                </div>
            )}
        </HODCard>
    );
};

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: true,
        reportReminders: true,
        memberUpdates: false,
    });

    const toggleSetting = (key) => {
        setSettings({...settings, [key]: !settings[key]});
    };

    return (
        <HODCard className="mt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                    <div>
                        <p className="font-medium text-gray-900 text-sm">Email Notifications</p>
                        <p className="text-gray-400 text-xs">Receive updates via email</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('emailNotifications')}
                        className={`w-11 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-violet-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                    <div>
                        <p className="font-medium text-gray-900 text-sm">SMS Notifications</p>
                        <p className="text-gray-400 text-xs">Receive updates via SMS</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('smsNotifications')}
                        className={`w-11 h-6 rounded-full transition-colors ${settings.smsNotifications ? 'bg-violet-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                    <div>
                        <p className="font-medium text-gray-900 text-sm">Report Reminders</p>
                        <p className="text-gray-400 text-xs">Get reminded about report deadlines</p>
                    </div>
                    <button 
                        onClick={() => toggleSetting('reportReminders')}
                        className={`w-11 h-6 rounded-full transition-colors ${settings.reportReminders ? 'bg-violet-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.reportReminders ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                    </button>
                </div>
            </div>
        </HODCard>
    );
};

// ============================================================================
// ACCOUNT INFO SECTION
// ============================================================================

const AccountInfo = ({ user }) => {
    return (
        <HODCard className="mt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-xl bg-white/60">
                    <span className="text-gray-500 text-sm">Member Since</span>
                    <span className="text-gray-900 text-sm font-medium">January 2024</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/60">
                    <span className="text-gray-500 text-sm">Role</span>
                    <span className="text-gray-900 text-sm font-medium">Department Head</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/60">
                    <span className="text-gray-500 text-sm">Account Status</span>
                    <HODBadge variant="success">Active</HODBadge>
                </div>
            </div>
        </HODCard>
    );
};

// ============================================================================
// MAIN DEPARTMENT PROFILE COMPONENT
// ============================================================================

const DepartmentProfilePage = ({ user, onUpdate }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = (formData) => {
        setIsSaving(true);
        setTimeout(() => {
            onUpdate({ ...user, ...formData });
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 1000);
    };

    const departmentName = user?.department?.name || "Youth";
    const zoneName = user?.zone?.name || "Zone 1";

    return (
        <div className="space-y-4 md:space-y-6 max-w-2xl">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Profile</h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your personal information</p>
            </div>

            {saved && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <HODIcons.CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="text-emerald-700 text-sm font-medium">Profile updated successfully!</p>
                </div>
            )}

            <HODCard className="p-6">
                <ProfileAvatar 
                    name={user?.name || "HOD"} 
                    department={departmentName}
                    photoUrl={user?.photo_url}
                    onPhotoChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            console.log('Photo selected:', file.name);
                            // In real app, upload to server
                        }
                    }}
                />
                
                <ProfileForm 
                    user={user} 
                    onSave={handleSave} 
                    onCancel={() => {}}
                    isSaving={isSaving}
                />
            </HODCard>

            <NotificationSettings />
            
            <AccountInfo user={user} />
            
            <PasswordSection />
        </div>
    );
};

export default DepartmentProfilePage;
