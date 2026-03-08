import { useState, useRef } from "react";

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
    <button onClick={handleClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {ripples.map(ripple => (
        <span key={ripple.id} className="absolute bg-white/40 rounded-full animate-ripple" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100 }} />
      ))}
      {children}
    </button>
  );
}

function TabSwitcher({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'finance', label: 'Financial Report' },
    { id: 'status', label: 'Status Report' },
    { id: 'history', label: 'Report History' }
  ];

  return (
    <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg shadow-gold-500/25" : "text-gray-600 hover:bg-white/50"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function FileUpload({ onFileSelect, label }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      onFileSelect(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 ${isDragging ? "border-gold-400 bg-gold-50/50" : "border-gray-200 hover:border-gold-300 bg-white/30"}`}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
      <div className="flex flex-col items-center justify-center">
        {selectedFile ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="font-semibold text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            <button type="button" onClick={() => { setSelectedFile(null); onFileSelect(null); }} className="mt-2 text-sm text-red-500 hover:text-red-600">Remove</button>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? "bg-gold-100" : "bg-gray-100"}`}>
              <svg className={`w-8 h-8 transition-colors duration-300 ${isDragging ? "text-gold-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="font-medium text-gray-700">{label}</p>
            <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-white transition-all">Browse Files</button>
          </>
        )}
      </div>
    </div>
  );
}

function FinancialReportForm({ onSubmit }) {
  const [formData, setFormData] = useState({ weekEnding: "", tithes: "", offerings: "", donations: "", otherIncome: "", expenses: "", notes: "", file: null });

  const calculateTotal = () => {
    return (parseFloat(formData.tithes) || 0) + (parseFloat(formData.offerings) || 0) + (parseFloat(formData.donations) || 0) + (parseFloat(formData.otherIncome) || 0);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, totalIncome: calculateTotal(), balance: calculateTotal() - (parseFloat(formData.expenses) || 0) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week Ending</label>
          <input type="date" name="weekEnding" value={formData.weekEnding} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Tithes</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" name="tithes" value={formData.tithes} onChange={handleChange} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Offerings</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" name="offerings" value={formData.offerings} onChange={handleChange} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Donations</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" name="donations" value={formData.donations} onChange={handleChange} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Other</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" name="otherIncome" value={formData.otherIncome} onChange={handleChange} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div></div>
        </div>
        <div className="bg-emerald-50/50 rounded-2xl p-4"><p className="text-sm text-gray-500">Total Income</p><p className="text-2xl font-bold text-emerald-600">${calculateTotal().toLocaleString()}</p></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Total Expenses</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" name="expenses" value={formData.expenses} onChange={handleChange} placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div></div>
        <div className="bg-gradient-to-r from-gold-400/20 to-gold-500/20 rounded-2xl p-4"><p className="text-sm text-gray-500">Balance</p><p className={`text-2xl font-bold ${calculateTotal() - (parseFloat(formData.expenses) || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${(calculateTotal() - (parseFloat(formData.expenses) || 0)).toLocaleString()}</p></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label><FileUpload onFileSelect={(file) => setFormData(prev => ({ ...prev, file }))} label="Drop files here or click to upload" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes..." className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all resize-none" /></div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <RippleButton variant="secondary">Save as Draft</RippleButton>
        <RippleButton onClick={handleSubmit}>Submit Report</RippleButton>
      </div>
    </div>
  );
}

function StatusReportForm({ onSubmit }) {
  const [formData, setFormData] = useState({ weekEnding: "", attendance: "", newMembers: "", firstTimers: "", conversions: "", salvation: "", cellGroups: "", notes: "", file: null });

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleSubmit = () => { onSubmit(formData); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Week Ending</label><input type="date" name="weekEnding" value={formData.weekEnding} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Attendance</label><input type="number" name="attendance" value={formData.attendance} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">New Members</label><input type="number" name="newMembers" value={formData.newMembers} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">First Timers</label><input type="number" name="firstTimers" value={formData.firstTimers} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Conversions</label><input type="number" name="conversions" value={formData.conversions} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Salvations</label><input type="number" name="salvation" value={formData.salvation} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Cell Groups</label><input type="number" name="cellGroups" value={formData.cellGroups} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label><FileUpload onFileSelect={(file) => setFormData(prev => ({ ...prev, file }))} label="Drop files here or click to upload" /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes..." className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all resize-none" /></div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <RippleButton variant="secondary">Save as Draft</RippleButton>
        <RippleButton onClick={handleSubmit}>Submit Report</RippleButton>
      </div>
    </div>
  );
}

function ReportTimelineItem({ report, onDownload, onPrint }) {
  return (
    <div className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gold-400" />
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-5 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.type === 'finance' ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'}`}>{report.type === 'finance' ? 'Financial' : 'Status'}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : report.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
            </div>
            <h4 className="font-semibold text-gray-900">{report.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400"><span>Week {report.week}</span><span>-</span><span>{report.date}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onDownload(report)} className="p-2.5 rounded-xl bg-gray-100 hover:bg-gold-100 hover:text-gold-600 text-gray-500 transition-all duration-300 group-hover:scale-110" title="Download PDF">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button type="button" onClick={() => onPrint(report)} className="p-2.5 rounded-xl bg-gray-100 hover:bg-sky-100 hover:text-sky-600 text-gray-500 transition-all duration-300 hover:scale-105" title="Print">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
          </div>
        </div>
        {report.type === 'finance' && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div><p className="text-xs text-gray-500">Income</p><p className="font-semibold text-emerald-600">${report.income?.toLocaleString()}</p></div>
            <div><p className="text-xs text-gray-500">Expenses</p><p className="font-semibold text-red-600">${report.expenses?.toLocaleString()}</p></div>
            <div><p className="text-xs text-gray-500">Balance</p><p className={`font-semibold ${(report.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${(report.balance || 0).toLocaleString()}</p></div>
          </div>
        )}
        {report.type === 'status' && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div><p className="text-xs text-gray-500">Attendance</p><p className="font-semibold text-gray-900">{report.attendance}</p></div>
            <div><p className="text-xs text-gray-500">New Members</p><p className="font-semibold text-gray-900">{report.newMembers}</p></div>
            <div><p className="text-xs text-gray-500">First Timers</p><p className="font-semibold text-gray-900">{report.firstTimers}</p></div>
            <div><p className="text-xs text-gray-500">Conversions</p><p className="font-semibold text-gray-900">{report.conversions}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportHistory({ reports, onDownload, onPrint }) {
  return (
    <div className="space-y-2 animate-fade-in">
      {reports.map((report, idx) => (<ReportTimelineItem key={idx} report={report} onDownload={onDownload} onPrint={onPrint} />))}
    </div>
  );
}

function SuccessModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
        <div className="p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-ping opacity-20" />
            <div className="relative bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center">
              <svg className="w-10 h-10 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-500">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <RippleButton onClick={onClose} className="w-full">Done</RippleButton>
        </div>
      </div>
    </div>
  );
}

export default function ReportsTab() {
  const [activeTab, setActiveTab] = useState('finance');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const reportHistory = [
    { type: 'finance', title: 'Weekly Financial Report', description: 'Week 10 - March 3-9, 2025', week: 10, date: 'Mar 10, 2025', status: 'approved', income: 15420, expenses: 8320, balance: 7100 },
    { type: 'status', title: 'Weekly Status Report', description: 'Week 10 - March 3-9, 2025', week: 10, date: 'Mar 10, 2025', status: 'approved', attendance: 245, newMembers: 12, firstTimers: 38, conversions: 8 },
    { type: 'finance', title: 'Weekly Financial Report', description: 'Week 9 - Feb 24 - Mar 2, 2025', week: 9, date: 'Mar 3, 2025', status: 'approved', income: 12850, expenses: 9100, balance: 3750 },
    { type: 'status', title: 'Weekly Status Report', description: 'Week 9 - Feb 24 - Mar 2, 2025', week: 9, date: 'Mar 3, 2025', status: 'pending', attendance: 198, newMembers: 8, firstTimers: 25, conversions: 5 },
    { type: 'finance', title: 'Weekly Financial Report', description: 'Week 8 - Feb 17-23, 2025', week: 8, date: 'Feb 24, 2025', status: 'approved', income: 18200, expenses: 10500, balance: 7700 }
  ];

  const handleSubmit = (data) => {
    console.log('Submitting report:', data);
    setSuccessMessage(activeTab === 'finance' ? 'Financial report submitted successfully!' : 'Status report submitted successfully!');
    setShowSuccess(true);
  };

  const handleDownload = (report) => { console.log('Downloading report:', report); alert(`Downloading ${report.title}...`); };
  const handlePrint = (report) => { console.log('Printing report:', report); window.print(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 mt-1">Submit and manage weekly reports</p>
        </div>
      </div>
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 p-6">
        {activeTab === 'finance' && <FinancialReportForm onSubmit={handleSubmit} />}
        {activeTab === 'status' && <StatusReportForm onSubmit={handleSubmit} />}
        {activeTab === 'history' && <ReportHistory reports={reportHistory} onDownload={handleDownload} onPrint={handlePrint} />}
      </div>
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMessage} />
    </div>
  );
}

