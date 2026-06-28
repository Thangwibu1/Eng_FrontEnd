import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'No items found',
  description = 'There is nothing here yet. Try adding something new!',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-soft max-w-md mx-auto my-6">
      <div className="w-16 h-16 bg-brand-yellow/30 text-brand-pink flex items-center justify-center rounded-full mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm">{description}</p>
    </div>
  );
}
