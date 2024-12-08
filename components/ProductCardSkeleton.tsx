export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Image skeleton */}
      <div className="relative w-full h-[200px] sm:h-[280px] bg-gray-200 animate-pulse">
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* Seller info skeleton */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Price and button skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-10 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
