import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "default" | "tool";
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}
