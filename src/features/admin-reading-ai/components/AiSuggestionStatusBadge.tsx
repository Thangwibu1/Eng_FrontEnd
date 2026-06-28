interface AiSuggestionStatusBadgeProps {
  status: 'pending' | 'edited' | 'approved' | 'rejected';
}

export function AiSuggestionStatusBadge({ status }: AiSuggestionStatusBadgeProps) {
  let badgeClasses = '';
  let label = '';

  switch (status) {
    case 'pending':
      badgeClasses = 'bg-amber-50 text-amber-600 border-amber-100';
      label = 'Pending';
      break;
    case 'edited':
      badgeClasses = 'bg-blue-50 text-blue-600 border-blue-100';
      label = 'Edited';
      break;
    case 'approved':
      badgeClasses = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      label = 'Approved';
      break;
    case 'rejected':
      badgeClasses = 'bg-rose-50 text-rose-600 border-rose-100';
      label = 'Rejected';
      break;
    default:
      badgeClasses = 'bg-slate-50 text-slate-600 border-slate-100';
      label = status;
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${badgeClasses}`}>
      {label}
    </span>
  );
}
