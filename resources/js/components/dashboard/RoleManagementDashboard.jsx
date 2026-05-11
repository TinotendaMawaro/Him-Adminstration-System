// RoleManagementDashboard.jsx - Updated for Member/Group-based HOD Assignment
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const RoleManagementDashboard = () => {
    const [selectedEntity, setSelectedEntity] = useState(null); // Can be member or group
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entityType, setEntityType] = useState('members'); // 'members' or 'groups'
    const queryClient = useQueryClient();

    // Search for eligible members and groups
    const { data: searchResults, isLoading } = useQuery(
        ['eligible-entities', searchTerm, entityType],
        () => api.get(`/departments/eligible-entities?search=${searchTerm}&type=${entityType}`),
        { enabled: searchTerm.length > 2 }
    );

    const { data: departments } = useQuery(['departments'], () =>
        api.get('/departments').then(res => res.data.departments || [])
    );

    const handleAssignHod = async () => {
        try {
            const payload = {
                entity_type: entityType,
                entity_id: selectedEntity.id,
                department_id: selectedDepartment.id
            };

            const response = await api.post('/departments/assign-hod-entity', payload);

            if (response.data.success) {
                // Update UI, show success message
                queryClient.invalidateQueries(['departments']);
                queryClient.invalidateQueries(['members']);
                queryClient.invalidateQueries(['groups']);
                setSelectedEntity(null);
                setSearchTerm('');

                alert(`HOD assigned successfully! ${response.data.message}`);
            }
        } catch (error) {
            alert('Error assigning HOD: ' + (error.response?.data?.message || error.message));
        }
    };

    const DepartmentSelector = ({ departments, onSelect }) => (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Department</h3>
            <select
                value={selectedDepartment?.id || ''}
                onChange={(e) => {
                    const dept = departments.find(d => d.id == e.target.value);
                    onSelect(dept);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
            >
                <option value="">Choose a department...</option>
                {departments?.map(dept => (
                    <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.zone?.name || 'No Zone'})
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">HOD Assignment Management</h1>
                <p className="text-gray-600">Assign Head of Department roles to members or groups</p>
            </div>

            {/* Entity Type Selector */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Assignment Type</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setEntityType('members');
                            setSelectedEntity(null);
                            setSearchTerm('');
                        }}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            entityType === 'members'
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        👤 Assign to Member
                    </button>
                    <button
                        onClick={() => {
                            setEntityType('groups');
                            setSelectedEntity(null);
                            setSearchTerm('');
                        }}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            entityType === 'groups'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        👥 Assign to Group
                    </button>
                </div>
            </div>

            {/* Search Interface */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Search {entityType === 'members' ? 'Members' : 'Groups'}
                </h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Search ${entityType} by name...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all"
                    />
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Search Results */}
                {searchTerm.length > 2 && (
                    <div className="mt-4 max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
                            </div>
                        ) : searchResults?.data?.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.data.map((entity) => (
                                    <button
                                        key={entity.id}
                                        onClick={() => setSelectedEntity(entity)}
                                        className={`w-full text-left p-3 rounded-xl transition-colors ${
                                            selectedEntity?.id === entity.id
                                                ? 'bg-sky-100 border-2 border-sky-300'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                                                entityType === 'members'
                                                    ? 'bg-gradient-to-br from-sky-400 to-sky-600'
                                                    : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                                            }`}>
                                                {entity.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{entity.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {entityType === 'members'
                                                        ? `${entity.zone_name} • ${entity.home_group_name || 'No Home Group'}`
                                                        : `${entity.zone_name} • ${entity.member_count || 0} members`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p>No eligible {entityType} found</p>
                                <p className="text-sm mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Entity Display */}
            {selectedEntity && (
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected {entityType.slice(0, -1)}</h3>
                    <div className={`flex items-center gap-4 p-4 rounded-xl ${
                        entityType === 'members' ? 'bg-sky-50' : 'bg-emerald-50'
                    }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold ${
                            entityType === 'members'
                                ? 'bg-gradient-to-br from-sky-400 to-sky-600'
                                : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                        }`}>
                            {selectedEntity.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{selectedEntity.name}</p>
                            <p className="text-sm text-gray-600">
                                {entityType === 'members'
                                    ? `${selectedEntity.zone_name} • Member since ${selectedEntity.membership_date || 'N/A'}`
                                    : `${selectedEntity.zone_name} • ${selectedEntity.member_count || 0} members`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <DepartmentSelector
                departments={departments}
                onSelect={setSelectedDepartment}
            />

            <button
                onClick={handleAssignHod}
                disabled={!selectedEntity || !selectedDepartment}
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-2xl hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
                Assign as HOD
            </button>
        </div>
    );
};

export default RoleManagementDashboard;