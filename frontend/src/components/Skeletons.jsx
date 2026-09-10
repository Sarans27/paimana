// src/components/Skeletons.jsx
// Layout-matched loading skeletons. Each mirrors the geometry of its
// real content (cards, panels, map shell) so swapping data in causes
// no layout jump. Decorative: aria-hidden with a screen-reader status.

export function CardSkeleton() {
  return (
    <div className="card project-card skel-card" aria-hidden="true">
      <div className="skel skel--title" />
      <div className="skel skel--line" />
      <div className="skel skel--badges" />
      <div className="skel skel--bar" />
      <div className="skel skel--line skel--short" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card stat" aria-hidden="true">
      <div className="skel skel--line" />
      <div className="skel skel--stat-value" />
      <div className="skel skel--line skel--short" />
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="card card__pad" aria-hidden="true">
      <div className="skel skel--title" />
      <div className="skel skel--line" />
      <div className="skel skel--line" />
      <div className="skel skel--line skel--short" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="grid grid--stats">
        {[0, 1, 2, 3].map((i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid--cards">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid--2col" style={{ marginTop: 20 }}>
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skel skel--crumbs" />
      <div className="skel skel--page-title" />
      <div className="skel skel--line" style={{ marginBottom: 20 }} />
      <div className="grid grid--2col">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
      <div className="grid grid--2col">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="map-shell" aria-hidden="true">
      <div className="map-panel__head">
        <div className="skel skel--title" style={{ width: "32%" }} />
      </div>
      <div className="skel skel--map" />
      <div className="map-legend">
        <div className="skel skel--line" style={{ width: 90 }} />
        <div className="skel skel--line" style={{ width: 110 }} />
        <div className="skel skel--line" style={{ width: 90 }} />
      </div>
    </div>
  );
}
