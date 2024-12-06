export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 animate-spin-slow"></div>
      </div>
    </div>
  )
}
