export function createSkeleton(count = 6) {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="news-card skeleton-card" aria-hidden="true">
        <div class="img-wrapper skeleton-shimmer"></div>
        <div class="news-content">
          <div class="skeleton-shimmer" style="height: 14px; width: 35%; margin-bottom: 0.75rem; border-radius: 4px;"></div>
          <div class="skeleton-shimmer" style="height: 22px; width: 90%; margin-bottom: 0.5rem; border-radius: 4px;"></div>
          <div class="skeleton-shimmer" style="height: 22px; width: 70%; margin-bottom: 1rem; border-radius: 4px;"></div>
          <div class="skeleton-shimmer" style="height: 14px; width: 100%; margin-bottom: 0.5rem; border-radius: 4px;"></div>
          <div class="skeleton-shimmer" style="height: 14px; width: 80%; margin-bottom: 1.5rem; border-radius: 4px;"></div>
          <div class="news-footer" style="border: none;">
            <div class="skeleton-shimmer" style="height: 12px; width: 30%; border-radius: 4px;"></div>
            <div class="skeleton-shimmer" style="height: 12px; width: 20%; border-radius: 4px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  return skeletons;
}

export function createSidebarSkeleton(count = 5) {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="compact-card skeleton-compact" aria-hidden="true">
        <div class="compact-img skeleton-shimmer"></div>
        <div class="compact-info">
          <div class="skeleton-shimmer" style="height: 14px; width: 90%; margin-bottom: 6px; border-radius: 3px;"></div>
          <div class="skeleton-shimmer" style="height: 14px; width: 60%; margin-bottom: 6px; border-radius: 3px;"></div>
          <div class="skeleton-shimmer" style="height: 10px; width: 40%; border-radius: 3px;"></div>
        </div>
      </div>
    `;
  }
  return skeletons;
}
