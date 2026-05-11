export default function MemberDrawer({ member, onClose }) {
  if (!member) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'transferred':
        return 'bg-yellow-100 text-yellow-800';
      case 'deceased':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const InfoCard = ({ label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="flex-shrink-0 w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
        <span className="text-gold-700 text-sm">★</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm text-gray-900 font-medium truncate" title={value || 'N/A'}>
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-gold-700">
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {member.name || 'Unknown Member'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-mono text-gray-500">
                    {member.member_code || member.member_number || 'N/A'}
                  </span>
                  {member.status && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Personal Information */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Full Name" value={member.name} />
                {member.surname && (
                  <InfoCard label="Surname" value={member.surname} />
                )}
                <InfoCard label="Phone" value={member.phone || member.mobile} />
                {member.email && (
                  <InfoCard label="Email" value={member.email} />
                )}
                {member.date_of_birth && (
                  <InfoCard label="Date of Birth" value={formatDate(member.date_of_birth)} />
                )}
                {member.gender?.name && (
                  <InfoCard label="Gender" value={member.gender.name} />
                )}
              </div>
            </section>

            {/* Church Assignment */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Church Assignment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {member.zone?.name && (
                  <InfoCard label="Zone" value={member.zone.name} />
                )}
                {member.homeGroup?.name && (
                  <InfoCard label="Home Group" value={member.homeGroup.name} />
                )}
                {member.department?.name && (
                  <InfoCard label="Department" value={member.department.name} />
                )}
                {member.membership_date && (
                  <InfoCard label="Membership Date" value={formatDate(member.membership_date)} />
                )}
              </div>
            </section>

            {/* Additional Information */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Additional Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  label="Baptised"
                  value={member.is_baptised ? 'Yes' : 'No'}
                />
                <InfoCard
                  label="Can Be Partner"
                  value={member.can_be_partner ? 'Yes' : 'No'}
                />
                {member.demography?.name && (
                  <InfoCard label="Demography" value={member.demography.name} />
                )}
                {member.partner && (
                  <InfoCard
                    label="Partner"
                    value={`${member.partner.name} ${member.partner.surname || ''}`.trim()}
                  />
                )}
              </div>
            </section>

            {/* Timestamps */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Record Info
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  label="Created"
                  value={formatDate(member.created_at)}
                />
                <InfoCard
                  label="Updated"
                  value={formatDate(member.updated_at)}
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-gold-500 text-white text-sm font-medium rounded-xl hover:bg-gold-600 transition-colors">
                Edit Member
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
