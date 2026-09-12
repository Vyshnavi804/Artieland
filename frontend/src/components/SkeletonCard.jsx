const SkeletonCard = () => (
  <div className="bg-surface p-3 pb-4 shadow-sm border border-ink/10 rounded-sm">
    <div className="border-[3px] border-ink/10 p-1">
      <div className="skeleton aspect-square w-full" />
    </div>
    <div className="pt-3 px-1 space-y-2">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  </div>
);

export default SkeletonCard;
