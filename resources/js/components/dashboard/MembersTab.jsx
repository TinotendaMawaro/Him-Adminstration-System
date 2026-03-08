import { useState, useRef, useEffect, useMemo } from "react";

// ============================================================================
// RIPPLE BUTTON COMPONENT - Reusable with gold gradient glow
// ============================================================================
function RippleButton({ children, onClick, className = "", variant = "primary", disabled = false, icon: Icon }) {
  const [ripples, setRipples] = useState([]);
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
    
    if (onClick) onClick(e);
  };

  const baseStyles = "relative overflow-hidden px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105",
    secondary: "bg-white/80 backdrop-blur-md text-gray-700 border border-white/50 shadow-md hover:shadow-lg hover:bg-white/90",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100",
  };

  return ( 
    <button 
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
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
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================
function Pagination({ currentPage, totalPages, itemsPerPage, onPageChange, onItemsPerPageChange, totalItems }) {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Show</span>
        <select 
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-gray-500">of {totalItems} members</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}
        
        {pageNumbers.map(num => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              currentPage === num 
                ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white border-gold-500' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            {num}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MEMBER CODE BADGE COMPONENT
// ============================================================================
function MemberCodeBadge({ code }) {
  if (!code) return null;
  
  // Parse code format: R0101M01
  // R = Ministry, 01 = Region, 01 = Zone, M01 = Member
  const ministry = code.charAt(0);
  const region = code.substring(1, 3);
  const zone = code.substring(3, 5);
  const member = code.substring(5);
  
  const ministryColors = {
    'R': 'bg-rose-100 text-rose-700 border-rose-200', // Revival
    'M': 'bg-sky-100 text-sky-700 border-sky-200', // Ministry
    'H': 'bg-emerald-100 text-emerald-700 border-emerald-200', // Harvest
    'P': 'bg-purple-100 text-purple-700 border-purple-200', // Purpose
  };
  
  return (
    <div className="flex items-center gap-1">
      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${ministryColors[ministry] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {ministry}
      </span>
      <span className="text-xs font-mono text-gray-500">{region}</span>
      <span className="text-xs font-mono text-gray-500">{zone}</span>
      <span className="px-1.5 py-0.5 rounded bg-gold-100 text-gold-700 text-xs font-bold border border-gold-200">
        {member}
      </span>
    </div>
  );
}

// ============================================================================
// FLOATING CTA BUTTON - Gold gradient with ripple effect
// ============================================================================
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

// ============================================================================
// MULTI-STEP REGISTRATION MODAL
// ============================================================================
function RegisterMemberModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender_id: "",
    demography_id: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_postal: "",
    home_group_id: "",
    is_active: true,
  });
  const [genders, setGenders] = useState([]);
  const [demographies, setDemographies] = useState([]);
  const [homegroups, setHomegroups] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      setStep(1);
      setError("");
    }
  }, [isOpen]);

  const fetchDropdowns = async () => {
    try {
      const token = localStorage.getItem('token');
      const genderRes = await fetch('/api/genders', { headers: { Authorization: `Bearer ${token}` }});
      const genderData = await genderRes.json();
      if (genderData.success) setGenders(genderData.genders);
      
      const demoRes = await fetch('/api/demographies', { headers: { Authorization: `Bearer ${token}` }});
      const demoData = await demoRes.json();
      if (demoData.success) setDemographies(demoData.demographies);
      
      const hgRes = await fetch('/api/homegroups', { headers: { Authorization: `Bearer ${token}` }});
      const hgData = await hgRes.json();
      if (hgData.success) setHomegroups(hgData.homegroups);
    } catch (err) {
      setGenders([{id: 1, name: 'Male'}, {id: 2, name: 'Female'}]);
      setDemographies([{id: 1, name: 'Single'}, {id: 2, name: 'Married'}, {id: 3, name: 'Widowed'}]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.first_name || !formData.last_name || !formData.email || !formData.phone)) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.gender_id || !formData.home_group_id) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          ...formData, 
          name: `${formData.first_name} ${formData.last_name}`,
          role: 'member',
          address: `${formData.address_street}, ${formData.address_city}, ${formData.address_state} ${formData.address_postal}`
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({
          first_name: "", last_name: "", email: "", phone: "",
          date_of_birth: "", gender_id: "", demography_id: "",
          address_street: "", address_city: "", address_state: "", address_postal: "",
          home_group_id: "", is_active: true,
        });
      } else {
        setError(data.message || 'Failed to register member');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Address" },
    { num: 3, label: "Assignment" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Register New Member</h2>
          <div className="flex items-center justify-between mt-4">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s.num ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s.num}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s.num ? 'text-gold-600 font-medium' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-gold-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="0771234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" name="address_street" value={formData.address_street} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="123 Main Street" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="address_city" value={formData.address_city} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="Harare" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input type="text" name="address_state" value={formData.address_state} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="Harare" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input type="text" name="address_postal" value={formData.address_postal} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" placeholder="001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select name="gender_id" value={formData.gender_id} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all">
                    <option value="">Select gender</option>
                    {genders.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <select name="demography_id" value={formData.demography_id} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all">
                    <option value="">Select status</option>
                    {demographies.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Group *</label>
                <select name="home_group_id" value={formData.home_group_id} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all">
                  <option value="">Select home group</option>
                  {homegroups.map(hg => (<option key={hg.id} value={hg.id}>{hg.name}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-gold-500 focus:ring-gold-400" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Mark as active member</label>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
          {step > 1 ? <RippleButton variant="secondary" onClick={prevStep}>Back</RippleButton> : <div />}
          <div className="flex gap-2">
            <RippleButton variant="secondary" onClick={onClose}>Cancel</RippleButton>
            {step < 3 ? (
              <RippleButton onClick={nextStep}>Next</RippleButton>
            ) : (
              <RippleButton onClick={handleSubmit} disabled={loading}>
                {loading ? 'Registering...' : 'Register Member'}
              </RippleButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MEMBER DRAWER - Slide-out panel with detailed profile
// ============================================================================
function MemberDrawer({ isOpen, onClose, member, onMessage, onUpdate, onPayment, onSchedule }) {
  if (!isOpen || !member) return null;

  // Mock engagement data
  const engagementStats = {
    serviceAttendance: 85,
    weeklyAttendance: 12,
    totalServices: 14,
    conferences: 3,
    partnershipTier: 'Gold',
    titheCompliant: true,
    titheAmount: 150,
    titheDue: 100,
    engagementLevel: 'High',
  };

  const ProgressBar = ({ value, max = 100, color = "from-gold-400 to-gold-500", label }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-400 flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Avatar */}
        <div className="relative px-6 -mt-12 flex-shrink-0">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl border-4 border-white">
                <span className="text-white font-bold text-3xl">{member.name?.charAt(0) || "M"}</span>
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
                <MemberCodeBadge code={member.member_code} />
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
              member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {member.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 flex gap-2 flex-shrink-0 overflow-x-auto">
          <RippleButton variant="primary" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} onClick={onMessage}>
            Message
          </RippleButton>
          <RippleButton variant="secondary" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} onClick={onUpdate}>
            Update
          </RippleButton>
          <RippleButton variant="success" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} onClick={onPayment}>
            Record Payment
          </RippleButton>
          <RippleButton variant="secondary" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} onClick={onSchedule}>
            Schedule
          </RippleButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
              <p className="font-medium text-gray-900">{member.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
              <p className="font-medium text-gray-900">{member.phone}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Gender</p>
              <p className="font-medium text-gray-900">{member.gender?.name || 'Not specified'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Marital Status</p>
              <p className="font-medium text-gray-900">{member.demography?.name || 'Not specified'}</p>
            </div>
          </div>

          {/* Address */}
          {member.address && (
            <div className="p-4 bg-sky-50 rounded-xl">
              <p className="text-xs text-sky-600 uppercase tracking-wider mb-1">Address</p>
              <p className="font-medium text-gray-900">{member.address}</p>
            </div>
          )}

          {/* Home Group */}
          {member.home_group && (
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Home Group</p>
              <p className="font-medium text-gray-900">{member.home_group.name}</p>
            </div>
          )}

          {/* Member History */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Member History</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Joined Church</p>
                  <p className="text-xs text-gray-500">January 15, 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Transferred Home Group</p>
                  <p className="text-xs text-gray-500">Moved to North A from Central - June 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Milestone: 1 Year Member</p>
                  <p className="text-xs text-gray-500">January 15, 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Statistics */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Engagement Statistics</h3>
            
            <div className="space-y-4">
              <ProgressBar value={engagementStats.serviceAttendance} label="Service Attendance" color="from-sky-400 to-sky-500" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Weekly Attendance</p>
                  <p className="text-lg font-bold text-gray-900">{engagementStats.weeklyAttendance}/{engagementStats.totalServices}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Conferences</p>
                  <p className="text-lg font-bold text-gray-900">{engagementStats.conferences}</p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-gold-50 to-amber-50 rounded-lg border border-gold-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Partnership Tier</span>
                  <span className="px-2 py-1 bg-gold-400 text-white text-xs font-bold rounded-full">{engagementStats.partnershipTier}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${engagementStats.titheCompliant ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tithe Status</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${engagementStats.titheCompliant ? 'bg-emerald-400 text-white' : 'bg-red-400 text-white'}`}>
                    {engagementStats.titheCompliant ? 'Compliant' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Last payment:</span>
                  <span className="font-medium text-gray-900">${engagementStats.titheAmount}</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Engagement Level</span>
                  <span className="px-2 py-1 bg-purple-400 text-white text-xs font-bold rounded-full">{engagementStats.engagementLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </>
  );
}

// ============================================================================
// SEARCH AND FILTER COMPONENT
// ============================================================================
function SearchFilter({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterHomeGroup, setFilterHomeGroup, filterMinistry, setFilterMinistry, homegroups }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, member code, phone or email..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filterMinistry}
          onChange={(e) => setFilterMinistry(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all text-sm"
        >
          <option value="">All Ministries</option>
          <option value="R">Revival (R)</option>
          <option value="M">Ministry (M)</option>
          <option value="H">Harvest (H)</option>
          <option value="P">Purpose (P)</option>
        </select>

        <select
          value={filterHomeGroup}
          onChange={(e) => setFilterHomeGroup(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all text-sm"
        >
          <option value="">All Home Groups</option>
          {homegroups.map(hg => (<option key={hg.id} value={hg.id}>{hg.name}</option>))}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// MEMBERS TABLE WITH PAGINATION
// ============================================================================
function MembersTable({ members, onViewMember, loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 when members change
  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

  const totalPages = Math.ceil(members.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = members.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-20 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Members Found</h3>
        <p className="text-gray-500">Register your first member to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/60 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Member Code</th>
                <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Member</th>
                <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Contact</th>
                <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Home Group</th>
                <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Status</th>
                <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentMembers.map((member, idx) => (
                <tr 
                  key={member.id} 
                  className="group hover:bg-white/80 cursor-pointer transition-all duration-300 hover:shadow-md"
                  onClick={() => onViewMember(member)}
                >
                  <td className="px-6 py-4">
                    <MemberCodeBadge code={member.member_code} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <span className="text-white font-semibold">{member.name?.charAt(0) || "M"}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role || 'Member'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-400">{member.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    {member.home_group ? (
                      <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                        {member.home_group.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onViewMember(member); }}
                    >
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={members.length}
      />
    </div>
  );
}

// ============================================================================
// MAIN MEMBERS TAB COMPONENT
// ============================================================================
export default function MembersTab() {
  const [members, setMembers] = useState([]);
  const [homegroups, setHomegroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterHomeGroup, setFilterHomeGroup] = useState("");
  const [filterMinistry, setFilterMinistry] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const membersRes = await fetch('/api/members', { headers: { Authorization: `Bearer ${token}` }});
      const membersData = await membersRes.json();
      if (membersData.success) setMembers(membersData.members);

      const hgRes = await fetch('/api/homegroups', { headers: { Authorization: `Bearer ${token}` }});
      const hgData = await hgRes.json();
      if (hgData.success) setHomegroups(hgData.homegroups);
    } catch (err) {
      // Mock data as fallback
      setMembers([
        { id: 1, name: "John Doe", email: "john@example.com", phone: "0771234567", is_active: true, member_code: "R0101M01", gender: { name: "Male" }, demography: { name: "Married" }, home_group: { id: 1, name: "North A" }, address: "123 Main St, Harare, Harare" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "0772345678", is_active: true, member_code: "R0101M02", gender: { name: "Female" }, demography: { name: "Single" }, home_group: { id: 2, name: "North B" }, address: "456 Oak Ave, Bulawayo" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "0773456789", is_active: false, member_code: "M0201M01", gender: { name: "Male" }, demography: { name: "Single" }, home_group: { id: 1, name: "North A" } },
        { id: 4, name: "Sarah Williams", email: "sarah@example.com", phone: "0774567890", is_active: true, member_code: "H0102M01", gender: { name: "Female" }, demography: { name: "Married" }, home_group: { id: 3, name: "Central" } },
        { id: 5, name: "David Brown", email: "david@example.com", phone: "0775678901", is_active: true, member_code: "P0101M03", gender: { name: "Male" }, demography: { name: "Widowed" }, home_group: { id: 2, name: "North B" } },
        { id: 6, name: "Emily Davis", email: "emily@example.com", phone: "0776789012", is_active: true, member_code: "R0102M02", gender: { name: "Female" }, demography: { name: "Single" }, home_group: { id: 1, name: "North A" } },
        { id: 7, name: "Robert Wilson", email: "robert@example.com", phone: "0777890123", is_active: false, member_code: "M0101M04", gender: { name: "Male" }, demography: { name: "Married" }, home_group: { id: 3, name: "Central" } },
        { id: 8, name: "Lisa Anderson", email: "lisa@example.com", phone: "0778901234", is_active: true, member_code: "H0201M02", gender: { name: "Female" }, demography: { name: "Married" }, home_group: { id: 2, name: "North B" } },
        { id: 9, name: "James Taylor", email: "james@example.com", phone: "0779012345", is_active: true, member_code: "R0101M05", gender: { name: "Male" }, demography: { name: "Single" }, home_group: { id: 1, name: "North A" } },
        { id: 10, name: "Mary Thomas", email: "mary@example.com", phone: "0770123456", is_active: true, member_code: "P0102M03", gender: { name: "Female" }, demography: { name: "Widowed" }, home_group: { id: 3, name: "Central" } },
        { id: 11, name: "Christopher Lee", email: "chris@example.com", phone: "0771234568", is_active: false, member_code: "M0201M03", gender: { name: "Male" }, demography: { name: "Single" }, home_group: { id: 1, name: "North A" } },
        { id: 12, name: "Patricia White", email: "patricia@example.com", phone: "0772345679", is_active: true, member_code: "H0101M04", gender: { name: "Female" }, demography: { name: "Married" }, home_group: { id: 2, name: "North B" } },
      ]);
      setHomegroups([
        { id: 1, name: "North A" },
        { id: 2, name: "North B" },
        { id: 3, name: "Central" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = !searchTerm || 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm) ||
        member.member_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || 
        (filterStatus === 'active' && member.is_active) ||
        (filterStatus === 'inactive' && !member.is_active);
      
      const matchesHomeGroup = !filterHomeGroup || member.home_group?.id === parseInt(filterHomeGroup);
      
      const matchesMinistry = !filterMinistry || (member.member_code && member.member_code.charAt(0) === filterMinistry);

      return matchesSearch && matchesStatus && matchesHomeGroup && matchesMinistry;
    });
  }, [members, searchTerm, filterStatus, filterHomeGroup, filterMinistry]);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowDrawer(true);
  };

  const handleMessage = (member) => console.log('Message:', member);
  const handleUpdate = (member) => console.log('Update:', member);
  const handlePayment = (member) => console.log('Payment:', member);
  const handleSchedule = (member) => console.log('Schedule:', member);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Portal</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">Members</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500 mt-1">Manage your zone's member directory</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search and Filter */}
      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterHomeGroup={filterHomeGroup}
        setFilterHomeGroup={setFilterHomeGroup}
        filterMinistry={filterMinistry}
        setFilterMinistry={setFilterMinistry}
        homegroups={homegroups}
      />

      {/* Members Table */}
      <MembersTable 
        members={filteredMembers}
        onViewMember={handleViewMember}
        loading={loading}
      />

      {/* Register Member Modal */}
      <RegisterMemberModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={fetchData}
      />

      {/* Member Drawer */}
      <MemberDrawer 
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        member={selectedMember}
        onMessage={() => handleMessage(selectedMember)}
        onUpdate={() => handleUpdate(selectedMember)}
        onPayment={() => handlePayment(selectedMember)}
        onSchedule={() => handleSchedule(selectedMember)}
      />

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
        .animate-ripple { animation: ripple 0.6s linear; }
      `}</style>
    </div>
  );
}

