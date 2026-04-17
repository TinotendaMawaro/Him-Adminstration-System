 // ============================================================================
// DEPARTMENT MEMBERS PAGE - Manage department members
// Shows member list with search, filtering, and management options
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./HODIcons";
import { HODInput, HODButton, HODCard, HODBadge, HODDepartmentAvatar } from "./HODComponents";

// ============================================================================
// MEMBER TABLE COMPONENT
// ============================================================================

const MemberTable = ({ members, onView }) => {
    return (
        <div className="overflow-hidden">
            <table className="w-full">
                <thead className="bg-white/60 border-b border-gray-100">
                    <tr>
                        <th className="text-left px-5 py-4 text-gray-500 font-semibold text-sm">Member</th>
                        <th className="text-left px-5 py-4 text-gray-500 font-semibold text-sm">Role</th>
                        <th className="text-left px-5 py-4 text-gray-500 font-semibold text-sm">Status</th>
                        <th className="text-left px-5 py-4 text-gray-500 font-semibold text-sm">Joined</th>
                        <th className="text-right px-5 py-4 text-gray-500 font-semibold text-sm">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {members.map((member) => (
                        <tr key={member.id} className="hover:bg-white/60 transition-colors">
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <HODDepartmentAvatar name={member.name} size="sm" />
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-gray-400 text-xs">{member.phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-gray-600 text-sm">{member.role}</td>
                            <td className="px-5 py-4">
                                <HODBadge variant={member.status === "active" ? "success" : "default"}>
                                    {member.status}
                                </HODBadge>
                            </td>
                            <td className="px-5 py-4 text-gray-500 text-sm">{member.joined}</td>
                            <td className="px-5 py-4 text-right">
                                <button 
                                    onClick={() => onView && onView(member)}
                                    className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ============================================================================
// MEMBER STATS BAR
// ============================================================================

const MemberStatsBar = ({ members }) => {
    const activeCount = members.filter(m => m.status === "active").length;
    const inactiveCount = members.filter(m => m.status === "inactive").length;
    
    return (
        <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl">
                <HODIcons.Users className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">{members.length} Total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{inactiveCount} Inactive</span>
            </div>
        </div>
    );
};

// ============================================================================
// ADD MEMBER FORM (Modal-like component)
// ============================================================================

const AddMemberForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "Member",
        status: "active"
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Member</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <HODIcons.XMark className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-1">Full Name</label>
                        <HODInput 
                            placeholder="Enter member's full name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-1">Phone Number</label>
                        <HODInput 
                            placeholder="0771234567"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 text-gray-900 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 transition-all"
                        >
                            <option value="Member">Member</option>
                            <option value="Leader">Leader</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Treasurer">Treasurer</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <HODButton type="submit" className="flex-1">Add Member</HODButton>
                        <HODButton variant="secondary" onClick={onCancel} className="flex-1">Cancel</HODButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN DEPARTMENT MEMBERS COMPONENT
// ============================================================================

const DepartmentMembersPage = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Sample members data
    const members = [
        { id: 1, name: "John Doe", role: "Leader", status: "active", phone: "0771234567", joined: "Jan 2024" },
        { id: 2, name: "Jane Smith", role: "Secretary", status: "active", phone: "0772345678", joined: "Mar 2024" },
        { id: 3, name: "Mike Johnson", role: "Member", status: "active", phone: "0773456789", joined: "Jun 2024" },
        { id: 4, name: "Sarah Williams", role: "Member", status: "active", phone: "0774567890", joined: "Aug 2024" },
        { id: 5, name: "David Brown", role: "Member", status: "inactive", phone: "0775678901", joined: "Feb 2024" },
    ];

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddMember = (memberData) => {
        console.log("Adding member:", memberData);
        setShowAddForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Department Members</h2>
                    <p className="text-gray-500 mt-1">Manage your department's member directory</p>
                </div>
                <HODButton icon={HODIcons.Plus} onClick={() => setShowAddForm(true)}>
                    Add Member
                </HODButton>
            </div>
            
            {/* Search */}
            <HODCard className="p-4">
                <HODInput 
                    icon={HODIcons.MagnifyingGlass} 
                    placeholder="Search members by name, phone, or role..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </HODCard>
            
            {/* Stats */}
            <MemberStatsBar members={filteredMembers} />
            
            {/* Members Table */}
            <HODCard>
                <MemberTable members={filteredMembers} onView={(member) => console.log("View:", member)} />
            </HODCard>

            {/* Add Member Modal */}
            {showAddForm && (
                <AddMemberForm 
                    onSubmit={handleAddMember} 
                    onCancel={() => setShowAddForm(false)} 
                />
            )}
        </div>
    );
};

export default DepartmentMembersPage;
