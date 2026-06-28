
export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
      <p className="text-text-secondary font-medium animate-pulse">Loading cute things...</p>
    </div>
  );
}
