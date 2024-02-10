export default function SkeletonUI() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
      <div className="flex gap-4 items-center w-full">
        <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-4 w-60"></div>
          <div className="skeleton h-4 w-64"></div>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-4 w-60"></div>
          <div className="skeleton h-4 w-64"></div>
        </div>
      </div>
      <div className="skeleton h-64"></div>
      <div className="skeleton h-64"></div>
      <div className="skeleton h-64"></div>
      <div className="skeleton h-64"></div>
    </div>
  )
}
