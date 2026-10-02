import React from 'react';

export function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-slate-200 border-2 border-black rounded-xl animate-pulse shadow-brutal-sm ${className}`} />
  );
}

export function SkeletonCard({ height = 'h-32', className = '' }) {
  return (
    <div className={`p-5 rounded-2xl bg-white border-3 border-black shadow-brutal space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-6 w-1/3" />
        <SkeletonBox className="h-5 w-16" />
      </div>
      <SkeletonBox className={`w-full ${height}`} />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBox className="h-8 w-48" />
        <SkeletonBox className="h-4 w-72" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-3">
        <SkeletonBox className="h-12 flex-1 rounded-xl" />
        <SkeletonBox className="h-12 flex-1 rounded-xl" />
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard height="h-40" />
        <SkeletonCard height="h-40" />
      </div>

      {/* Bottom Card */}
      <SkeletonCard height="h-28" />
    </div>
  );
}
