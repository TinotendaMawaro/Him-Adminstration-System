import { useState, useEffect, useRef } from "react";

// Ripple Effect Button Component
function RippleButton({ children, onClick, className = "", variant = "primary", shakeOnClick = false, disabled = false }) {
  const [ripples, setRipples] = useState([]);
  const [shaking, setShaking] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (disabled) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    if (shakeOnClick) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
    
    if (onClick) onClick(e);
  };

  const baseStyles = "relative overflow-hidden px-5 py-2.5 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105",
    secondary: "bg-white/80 backdrop-blur-md text-gray-700 border border-white/50 shadow-md hover:shadow-lg hover:bg-white/90",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:shadow-red-500/20",
    dangerGlow: "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105",
  };

  return ( 
    <button 
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${shaking ? 'animate-shake' : ''}`}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/40 rounded-full animate-ripple"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
          }}
        />
      ))}
      {children}
    </button>
  );
}

// Drawer Component - Slide-out Panel
function Drawer({ isOpen, onClose, title, children, size = "md" }) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer Panel - Slide from right */}
      <div className="absolute right-0 top-0 h-full w-full">
        <div className={`relative h-full bg-white/95 backdrop-blur-2xl shadow-2xl animate-slide-in-right ${sizes[size]} ml-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-xl z-10">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Department Modal
function CreateDepartmentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "sky",
  });

  const colors = [
    { name: "Sky Blue", value: "sky", bg: "bg-sky-100", text: "text-sky-600" },
    { name: "Emerald", value: "emerald", bg: "bg-emerald-100", text: "text-emerald-600" },
    { name: "Violet", value: "violet", bg: "bg-violet-100", text: "text-violet-600" },
    { name: "Amber", value: "amber", bg: "bg-amber-100", text: "text-amber-600" },
    { name: "Rose", value: "rose", bg: "bg-rose-100", text: "text-rose-600" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Department</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
              placeholder="e.g., Youth Ministry"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all resize-none"
              placeholder="Brief description of the department..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
            <div className="flex gap-3">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-10 h-10 rounded-full ${color.bg} ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-gold-400' : ''} transition-all`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <RippleButton variant="secondary" onClick={onClose}>Cancel</RippleButton>
          <RippleButton onClick={onClose}>Create Department</RippleButton>
        </div>
      </div>
    </div>
  );
}

// Appoint HOD Modal
function AppointHODModal({ isOpen, onClose, departmentName }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const availableMembers = [
    { id: 1, name: "John Doe", role: "Member", status: "Active" },
    { id: 2, name: "Sarah Johnson", role: "Member", status: "Active" },
    { id: 3, name: "Michael Brown", role: "Member", status: "Active" },
    { id: 4, name: "Emily Davis", role: "Member", status: "Active" },
  ];

  const filteredMembers = availableMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Appoint HOD</h2>
          <p className="text-gray-500 text-sm mt-1">Select a member to lead {departmentName}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                  selectedMember?.id === member.id 
                    ? 'bg-gold-50 border-2 border-gold-400' 
                    : 'bg-white border-2 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                {selectedMember?.id === member.id && (
                  <svg className="w-5 h-5 text-gold-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <RippleButton variant="secondary" onClick={onClose}>Cancel</RippleButton>
          <RippleButton onClick={onClose} disabled={!selectedMember}>Appoint HOD</RippleButton>
        </div>
      </div>
    </div>
  );
}

// Demote Confirmation Modal
function DemoteConfirmationModal({ isOpen, onClose, onConfirm, hodName, departmentName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demote {hodName}?</h2>
          <p className="text-gray-500">
            This will remove {hodName} as the Head of Department for {departmentName}. 
            They will remain as a regular member.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-3">
          <RippleButton variant="secondary" onClick={onClose}>Cancel</RippleButton>
          <RippleButton variant="dangerGlow" onClick={onConfirm}>Demote</RippleButton>
        </div>
      </div>
    </div>
  );
}

// Department Card
function DepartmentCard({ department, onAppointHOD, onDemoteHOD, onViewDetails }) {
  const statusColors = {
    active: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Active" },
    inactive: { bg: "bg-gray-50", text: "text-gray-600", label: "Inactive" },
    pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending" },
  };

  const colorThemes = {
    sky: { gradient: "from-sky-400/20 to-sky-100/10", accent: "sky" },
    emerald: { gradient: "from-emerald-400/20 to-emerald-100/10", accent: "emerald" },
    violet: { gradient: "from-violet-400/20 to-violet-100/10", accent: "violet" },
    amber: { gradient: "from-amber-400/20 to-amber-100/10", accent: "amber" },
    rose: { gradient: "from-rose-400/20 to-rose-100/10", accent: "rose" },
  };

  const theme = colorThemes[department.color] || colorThemes.sky;

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewDetails(department)}>
      {/* Animated border glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-[-2px] rounded-3xl bg-gradient-to-r from-gold-400 via-amber-400 to-gold-400 animate-pulse" />
      </div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <svg className={`w-6 h-6 text-${theme.accent}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[department.status].bg} ${statusColors[department.status].text}`}>
            {statusColors[department.status].label}
          </span>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{department.description}</p>
        </div>

        {/* HOD Info */}
        {department.hod ? (
          <div className="bg-white/50 rounded-2xl p-4 mb-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Head of Department</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white font-bold text-sm">
                {department.hod.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{department.hod}</p>
                <p className="text-xs text-gray-500">Since {department.hodSince}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 text-center">
            <p className="text-sm text-gray-500">No HOD appointed</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{department.members}</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
          <div className="bg-white/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{department.events}</p>
            <p className="text-xs text-gray-500">Events</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {department.hod ? (
            <>
              <RippleButton 
                variant="secondary" 
                className="flex-1 text-sm"
                onClick={() => onAppointHOD(department)}
              >
                Replace HOD
              </RippleButton>
              <RippleButton 
                variant="danger" 
                className="text-sm"
                shakeOnClick={true}
                onClick={() => onDemoteHOD(department)}
              >
                Demote
              </RippleButton>
            </>
          ) : (
            <RippleButton 
              className="flex-1 text-sm"
              onClick={() => onAppointHOD(department)}
            >
              Appoint HOD
            </RippleButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Floating Add Button
function FloatingAddButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="fixed bottom-8 right-8 z-40 group">
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
      <div className="relative flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full shadow-xl shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-300 hover:scale-110">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-white font-semibold">{label}</span>
      </div>
    </button>
  );
}

// Main Departments Tab Component
export default function DepartmentsTab() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const departments = [
    { 
      id: 1, 
      name: "Youth Ministry", 
      description: "Engaging young people in spiritual growth",
      color: "sky",
      status: "active",
      hod: "John Doe",
      hodSince: "Jan 2024",
      members: 45,
      events: 12
    },
    { 
      id: 2, 
      name: "Men's Fellowship", 
      description: "Building strong men of faith",
      color: "emerald",
      status: "active",
      hod: "Michael Brown",
      hodSince: "Mar 2023",
      members: 32,
      events: 8
    },
    { 
      id: 3, 
      name: "Women's Ministry", 
      description: "Empowering women in the faith",
      color: "violet",
      status: "active",
      hod: "Sarah Johnson",
      hodSince: "Jun 2023",
      members: 38,
      events: 10
    },
    { 
      id: 4, 
      name: "Children's Church", 
      description: "Nurturing the next generation",
      color: "amber",
      status: "active",
      hod: null,
      members: 28,
      events: 6
    },
    { 
      id: 5, 
      name: "Music Ministry", 
      description: "Leading worship through music",
      color: "rose",
      status: "pending",
      hod: "Emily Davis",
      hodSince: "Feb 2024",
      members: 15,
      events: 24
    },
    { 
      id: 6, 
      name: "Ushering", 
      description: "Welcoming and guiding congregants",
      color: "sky",
      status: "inactive",
      hod: null,
      members: 12,
      events: 2
    },
  ];

  const handleAppointHOD = (department) => {
    setSelectedDepartment(department);
    setShowAppointModal(true);
  };

  const handleDemoteHOD = (department) => {
    setSelectedDepartment(department);
    setShowDemoteModal(true);
  };

  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    setShowDetailsDrawer(true);
  };

  const confirmDemote = () => {
    // Handle demotion logic here
    console.log(`Demoted HOD from ${selectedDepartment.name}`);
    setShowDemoteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500 mt-1">Manage church departments and HODs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/60 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium text-gray-600">
            {departments.length} Departments
          </div>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(department => (
          <DepartmentCard
            key={department.id}
            department={department}
            onAppointHOD={handleAppointHOD}
            onDemoteHOD={handleDemoteHOD}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowCreateModal(true)} label="Add Department" />

      {/* Create Department Modal */}
      <CreateDepartmentModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Appoint HOD Modal */}
      <AppointHODModal
        isOpen={showAppointModal}
        onClose={() => setShowAppointModal(false)}
        departmentName={selectedDepartment?.name}
      />

      {/* Demote Confirmation Modal */}
      <DemoteConfirmationModal
        isOpen={showDemoteModal}
        onClose={() => setShowDemoteModal(false)}
        onConfirm={confirmDemote}
        hodName={selectedDepartment?.hod}
        departmentName={selectedDepartment?.name}
      />

      {/* Department Details Drawer */}
      <Drawer
        isOpen={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
        title={selectedDepartment?.name}
        size="md"
      >
        {selectedDepartment && (
          <div className="space-y-6">
            {/* Department Info */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  selectedDepartment.color === 'sky' ? 'from-sky-400 to-sky-600' :
                  selectedDepartment.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                  selectedDepartment.color === 'violet' ? 'from-violet-400 to-violet-600' :
                  selectedDepartment.color === 'amber' ? 'from-amber-400 to-amber-600' :
                  'from-rose-400 to-rose-600'
                } flex items-center justify-center shadow-lg`}>
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDepartment.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedDepartment.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    selectedDepartment.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {selectedDepartment.status.charAt(0).toUpperCase() + selectedDepartment.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-gray-600">{selectedDepartment.description}</p>
            </div>

            {/* HOD Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Head of Department</h4>
              {selectedDepartment.hod ? (
                <div className="flex items-center gap-4 p-4 bg-gold-50/50 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedDepartment.hod.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{selectedDepartment.hod}</p>
                    <p className="text-gray-500 text-sm">Since {selectedDepartment.hodSince}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setShowDetailsDrawer(false); handleAppointHOD(selectedDepartment); }}
                      className="p-2 rounded-xl bg-gold-100 text-gold-600 hover:bg-gold-200 transition-colors"
                      title="Replace HOD"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => { setShowDetailsDrawer(false); handleDemoteHOD(selectedDepartment); }}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Demote HOD"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 mb-4">No HOD appointed yet</p>
                  <RippleButton onClick={() => { setShowDetailsDrawer(false); handleAppointHOD(selectedDepartment); }}>
                    Appoint HOD
                  </RippleButton>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <p className="text-4xl font-bold text-gray-900">{selectedDepartment.members}</p>
                <p className="text-gray-500 text-sm mt-1">Members</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <p className="text-4xl font-bold text-gray-900">{selectedDepartment.events}</p>
                <p className="text-gray-500 text-sm mt-1">Events</p>
              </div>
            </div>

            {/* Performance Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Member Attendance</span>
                    <span className="font-medium text-gray-900">78%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Event Success Rate</span>
                    <span className="font-medium text-gray-900">92%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Goal Completion</span>
                    <span className="font-medium text-gray-900">65%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

