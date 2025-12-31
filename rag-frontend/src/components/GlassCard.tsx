import { ReactNode } from "react";


export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
return (
  <div
    className={
      "rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl " +
      "shadow-[0_20px_60px_rgba(0,0,0,0.45)] " +
      className
    }
  >
    {children}
  </div>
);
}

