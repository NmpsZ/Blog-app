type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-8 mt-16 pb-8 w-full">
      <button
        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 font-medium text-ink bg-transparent border border-divider hover:border-brand hover:text-brand transition-colors duration-200 uppercase tracking-widest text-[10px] sm:text-xs disabled:opacity-30 disabled:cursor-not-allowed text-center"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        type="button"
      >
        &larr; ก่อนหน้า (Previous)
      </button>
      <span className="text-ink-muted font-medium text-sm whitespace-nowrap">
        {page} / {totalPages}
      </span>
      <button
        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 font-medium text-ink bg-transparent border border-divider hover:border-brand hover:text-brand transition-colors duration-200 uppercase tracking-widest text-[10px] sm:text-xs disabled:opacity-30 disabled:cursor-not-allowed text-center"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        type="button"
      >
        ถัดไป (Next) &rarr;
      </button>
    </div>
  );
}
