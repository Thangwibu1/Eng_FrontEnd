interface DuplicateStatusBadgeProps {
  status: 'new' | 'exists_in_dictionary' | 'duplicate_in_suggestions' | 'possible_duplicate';
}

export function DuplicateStatusBadge({ status }: DuplicateStatusBadgeProps) {
  let badgeClasses = '';
  let label = '';

  switch (status) {
    case 'new':
      badgeClasses = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      label = 'New Word';
      break;
    case 'exists_in_dictionary':
      badgeClasses = 'bg-brand-pink/10 text-brand-pink border-brand-pink/20';
      label = 'In Dictionary';
      break;
    case 'duplicate_in_suggestions':
      badgeClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Duplicate Suggestion';
      break;
    case 'possible_duplicate':
      badgeClasses = 'bg-amber-50 text-amber-600 border-amber-100';
      label = 'Review Duplicate';
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
