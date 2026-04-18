const SkeletonDetail = () => (
  <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
    {/* Breadcrumb */}
    <div className="flex gap-2 mb-6">
      <div className="h-3 bg-purple-100 rounded w-12" />
      <div className="h-3 bg-purple-100 rounded w-3" />
      <div className="h-3 bg-purple-100 rounded w-20" />
      <div className="h-3 bg-purple-100 rounded w-3" />
      <div className="h-3 bg-purple-100 rounded w-32" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Photo */}
        <div className="h-80 sm:h-96 bg-purple-100 rounded-2xl" />
        {/* Info card */}
        <div className="bg-white rounded-2xl p-6 border border-purple-100 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-purple-100 rounded w-48" />
              <div className="h-4 bg-purple-100 rounded w-36" />
            </div>
            <div className="h-8 bg-purple-100 rounded w-24" />
          </div>
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
            {[1,2,3].map((i) => (
              <div key={i} className="space-y-1 text-center">
                <div className="h-5 bg-purple-100 rounded mx-auto w-8" />
                <div className="h-3 bg-purple-100 rounded w-full" />
                <div className="h-4 bg-purple-100 rounded w-4/5 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-purple-100 rounded w-full" />
            <div className="h-3 bg-purple-100 rounded w-5/6" />
            <div className="h-3 bg-purple-100 rounded w-4/6" />
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-6 border border-purple-100 space-y-4">
          <div className="h-10 bg-purple-100 rounded w-3/5 mx-auto" />
          <div className="h-12 bg-purple-100 rounded-xl w-full" />
          <div className="h-10 bg-purple-100 rounded-xl w-full" />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-purple-100 space-y-3">
          <div className="h-4 bg-purple-100 rounded w-2/5" />
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-full" />
            <div className="space-y-1.5 flex-grow">
              <div className="h-4 bg-purple-100 rounded w-3/5" />
              <div className="h-3 bg-purple-100 rounded w-2/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonDetail;