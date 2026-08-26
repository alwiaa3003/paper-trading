const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-panel2 ${className}`} />
);

export const StatCardsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-28" />
      </div>
    ))}
  </div>
);

export const CardGridSkeleton = ({
  count = 8,
  columns = 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}) => (
  <div className={`grid ${columns} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="flex items-end justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, columns = 5 }) => (
  <div className="card overflow-x-auto">
    <table className="w-full text-sm min-w-[640px]">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r} className="border-b border-line last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c} className="px-4 py-3">
                <Skeleton className="h-4 w-full max-w-[100px]" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Skeleton;