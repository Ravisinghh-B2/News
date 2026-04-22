export function createSkeleton(count = 6) {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="news-card skeleton-card" aria-hidden="true">
        <div class="img-wrapper skeleton-shimmer"></div>
        <div class="news-content">
          <div class="skeleton-shimmer skeleton-line short"></div>
          <div class="skeleton-shimmer skeleton-line long"></div>
          <div class="skeleton-shimmer skeleton-line medium"></div>
          <div class="skeleton-shimmer skeleton-line full"></div>
          <div class="skeleton-shimmer skeleton-line xlong"></div>
          <div class="news-footer no-border">
            <div class="skeleton-shimmer skeleton-line footer-small"></div>
            <div class="skeleton-shimmer skeleton-line footer-xsmall"></div>
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
          <div class="skeleton-shimmer skeleton-line sidebar-long"></div>
          <div class="skeleton-shimmer skeleton-line sidebar-medium"></div>
          <div class="skeleton-shimmer skeleton-line sidebar-small"></div>
        </div>
      </div>
    `;
  }
  return skeletons;
}
