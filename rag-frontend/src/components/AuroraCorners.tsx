export function AuroraCorners({ active }: { active: boolean }) {
  return (
    <div className={`aurora-layer ${active ? "on" : ""}`} aria-hidden="true">
      <div className="aurora-corner tl" />
      <div className="aurora-corner tr" />
      <div className="aurora-corner bl" />
      <div className="aurora-corner br" />
    </div>
  );
}
