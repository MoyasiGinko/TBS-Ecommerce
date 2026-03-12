interface PagerProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pager = ({
  totalPages,
  currentPage,
  onPageChange,
}: PagerProps) => (
  <div className="mt-4 flex items-center gap-2">
    <button
      className="px-3 py-1 rounded border border-gray-3 bg-white disabled:opacity-50"
      disabled={currentPage <= 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Prev
    </button>
    <p className="text-sm">
      Page {currentPage} / {totalPages}
    </p>
    <button
      className="px-3 py-1 rounded border border-gray-3 bg-white disabled:opacity-50"
      disabled={currentPage >= totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </button>
  </div>
);
