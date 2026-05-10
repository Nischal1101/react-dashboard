import React from "react";

export default function TemporaryCatchAllRoute() {
  return (
    <div className="space-y-4">
      <div className="bg-background flex h-[calc(100vh-var(--dashboard-header-height)-12rem)] items-center justify-center rounded-lg border p-4">
        <div className="space-y-4 text-center">
          <div className="text-6xl">🚧</div>
          <h2 className="text-foreground font-heading text-3xl font-semibold">
            Coming Soon
          </h2>
          <p className="text-muted-foreground text-base">
            This feature is currently unavailable
          </p>
        </div>
      </div>
    </div>
  );
}
