/**
 * Skeleton placeholder for a LawnCard while data is loading.
 * Matches the exact dimensions of LawnCard.
 */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden animate-pulse">
    {/* Image area */}
    <div className="h-48 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100" />

    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Title + rating row */}
      <div className="flex justify-between">
        <div className="h-4 bg-purple-100 rounded w-3/5" />
        <div className="h-4 bg-purple-100 rounded w-10" />
      </div>
      {/* Location */}
      <div className="h-3 bg-purple-100 rounded w-4/5" />
      {/* Capacity */}
      <div className="h-3 bg-purple-100 rounded w-2/5" />
      {/* Amenity pills */}
      <div className="flex gap-2 pt-1">
        <div className="h-5 bg-purple-100 rounded-full w-14" />
        <div className="h-5 bg-purple-100 rounded-full w-16" />
        <div className="h-5 bg-purple-100 rounded-full w-12" />
      </div>
    </div>

    {/* CTA */}
    <div className="px-4 pb-4">
      <div className="h-9 bg-purple-100 rounded-lg w-full" />
    </div>
  </div>
);

/**
 * Renders N skeleton cards in a grid.
 */
export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;