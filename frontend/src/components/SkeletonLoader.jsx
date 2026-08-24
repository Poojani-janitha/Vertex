export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    
    <div className="space-y-2 pt-2">
      <div className="h-3 bg-gray-100 rounded w-full"></div>
      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-8 bg-gray-200 rounded-xl w-24"></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="w-full overflow-hidden animate-pulse space-y-3">
    <div className="h-8 bg-gray-100 rounded-lg w-full mb-4"></div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 items-center py-3 border-b border-gray-100">
        {Array.from({ length: cols }).map((_, c) => (
          <div
            key={c}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.floor(100 / cols)}%` }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3 shadow-sm">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);
