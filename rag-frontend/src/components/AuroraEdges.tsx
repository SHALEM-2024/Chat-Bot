import React from "react";

/**
 * AuroraEdges
 * - ABSOLUTE overlay (not fixed)
 * - Stretches to the full height of the page because its parent (.aurora-stage) is position: relative
 * - Does not block clicks (pointer-events: none in CSS)
 *
 * IMPORTANT:
 * Your outermost wrapper must have className="aurora-stage ..."
 * and your actual content must be above it (z-10 / relative z-10), which you already do.
 */
export function AuroraEdges() {
  return (
    <div className="aurora-edges" aria-hidden="true">
      {/* Corner caps (prevents seams / breaks where edges meet) */}
      <div className="aurora-corner tl" />
      <div className="aurora-corner tr" />
      <div className="aurora-corner bl" />
      <div className="aurora-corner br" />

      {/* Top edge */}
      <div className="aurora-edge top">
        <span className="aurora-glow" />
        <span className="aurora-stroke" />
      </div>

      {/* Right edge */}
      <div className="aurora-edge right">
        <span className="aurora-glow" />
        <span className="aurora-stroke" />
      </div>

      {/* Bottom edge */}
      <div className="aurora-edge bottom">
        <span className="aurora-glow" />
        <span className="aurora-stroke" />
      </div>

      {/* Left edge */}
      <div className="aurora-edge left">
        <span className="aurora-glow" />
        <span className="aurora-stroke" />
      </div>
    </div>
  );
}
