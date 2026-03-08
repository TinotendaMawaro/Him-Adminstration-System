import { useState, useEffect, useRef } from "react";

// Ripple Effect Button Component
function RippleButton({ children, onClick, className = "", variant = "primary" }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  const baseStyles = "relative overflow-hidden px-6 py-3 rounded-full font-semibold transition-all duration-300";
  const variants = {
    primary: "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105",
    secondary: "bg-white/80 backdrop-blur-md text-gray-700 border border-white/50 shadow-md hover:shadow-lg hover:bg-white/90"
  };

  return (
    <button 
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
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

// Member Profile Modal
function MemberProfileModal({ member, isOpen, onClose }) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-gold-400 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-2xl font-bold text-sky-600">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{member.name}</h2>
              <p className="text-white/80">{member.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-50/50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
              <p className="font-semibold text-gray-900">{member.phone}</p>
            </div>
            <div className="bg-gold-50/50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
              <p className="font-semibold text-emerald-600">{member.status}</p>
            </div>
            <div className="bg-violet-50/50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Home Group</p>
              <p className="font-semibold text-gray-900">{member.homeGroup}</p>
            </div>
            <div className="bg-sky-50/50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Zone</p>
              <p className="font-semibold text-gray-900">{member.zone}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <RippleButton variant="primary" className="flex-1">
              Edit Member
            </RippleButton>
            <RippleButton variant="secondary" className="flex-1">
              View Full Profile
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Multi-Step Registration Modal
function RegisterMemberModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    homeGroup: "",
    department: "",
    address: "",
    city: "",
    country: "",
  });

  const steps = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Contact" },
    { num: 3, label: "Church" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Register New Member</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                  step >= s.num 
                    ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg shadow-gold-500/25" 
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s.num ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${step > s.num ? "bg-gold-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Group</label>
                <select
                  name="homeGroup"
                  value={formData.homeGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                >
                  <option value="">Select home group</option>
                  <option value="north">North Home Group</option>
                  <option value="south">South Home Group</option>
                  <option value="east">East Home Group</option>
                  <option value="west">West Home Group</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                >
                  <option value="">Select department</option>
                  <option value="youth">Youth Department</option>
                  <option value="men">Men's Ministry</option>
                  <option value="women">Women's Ministry</option>
                  <option value="children">Children's Ministry</option>
                  <option value="music">Music Ministry</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              step === 1 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Back
          </button>
          {step < 3 ? (
            <RippleButton onClick={nextStep}>
              Continue
            </RippleButton>
          ) : (
            <RippleButton onClick={onClose}>
              Complete Registration
            </RippleButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Search and Filter Component
function SearchFilter({ searchTerm, onSearchChange, filter, onFilterChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/50 bg-white/70 backdrop-blur-md shadow-sm focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all"
        />
      </div>

      {/* Filter Dropdown */}
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-5 py-3 rounded-2xl border border-white/50 bg-white/70 backdrop-blur-md shadow-sm focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 transition-all"
      >
        <option value="all">All Members</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="new">New This Month</option>
      </select>
    </div>
  );
}

// Members Table
function MembersTable({ members, onMemberClick }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Home Group</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Zone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {members.map((member, idx) => (
              <tr 
                key={idx}
                className="group hover:bg-white/80 transition-all duration-300 cursor-pointer"
                onClick={() => onMemberClick(member)}
              >
                {/* Glow effect on hover */}
                <td className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 to-sky-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mx-2" />
                  <div className="relative px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-700">{member.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium">
                    {member.homeGroup}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-700">{member.zone}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    member.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMemberClick(member);
                    }}
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Floating Add Member Button
function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 group"
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse transition-opacity" />
      
      {/* Button */}
      <div className="relative flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full shadow-xl shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-300 hover:scale-110">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-white font-semibold">Add Member</span>
      </div>
    </button>
  );
}

// Main Members Tab Component
export default function MembersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Sample members data
  const allMembers = [
    { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 234 567 8901", homeGroup: "North Group", zone: "North Zone", status: "Active" },
    { name: "John Doe", email: "john.d@email.com", phone: "+1 234 567 8902", homeGroup: "South Group", zone: "South Zone", status: "Active" },
    { name: "Emily Davis", email: "emily.d@email.com", phone: "+1 234 567 8903", homeGroup: "East Group", zone: "East Zone", status: "Active" },
    { name: "Michael Brown", email: "michael.b@email.com", phone: "+1 234 567 8904", homeGroup: "West Group", zone: "West Zone", status: "Inactive" },
    { name: "Jessica Wilson", email: "jessica.w@email.com", phone: "+1 234 567 8905", homeGroup: "North Group", zone: "North Zone", status: "Active" },
    { name: "David Martinez", email: "david.m@email.com", phone: "+1 234 567 8906", homeGroup: "South Group", zone: "South Zone", status: "Active" },
    { name: "Amanda Taylor", email: "amanda.t@email.com", phone: "+1 234 567 8907", homeGroup: "East Group", zone: "East Zone", status: "Active" },
    { name: "Robert Anderson", email: "robert.a@email.com", phone: "+1 234 567 8908", homeGroup: "West Group", zone: "West Zone", status: "Active" },
  ];

  // Filter members based on search and filter
  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || 
                         (filter === "active" && member.status === "Active") ||
                         (filter === "inactive" && member.status === "Inactive");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500 mt-1">Manage church members</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredMembers.length} members
        </div>
      </div>

      {/* Search and Filter */}
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Members Table */}
      <MembersTable 
        members={filteredMembers}
        onMemberClick={setSelectedMember}
      />

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowRegisterModal(true)} />

      {/* Register Member Modal */}
      <RegisterMemberModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      {/* Member Profile Modal */}
      <MemberProfileModal 
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}

