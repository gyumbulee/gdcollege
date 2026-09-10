import type { ReactNode } from "react";
import CountdownPage from "./CountdownPage";
import { countdownConfig } from "../config/countdown.config";

interface CountdownGateProps {
  /** The real public homepage, rendered once the gate is disabled. */
  children: ReactNode;
}

/**
 * Wraps the public root route. This is the ONLY place that decides whether
 * visitors see the temporary countdown or the real institutional homepage.
 *
 * Removing the countdown later is a one-line change: delete the
 * <CountdownGate> wrapper in app/page.tsx (or just leave it — once
 * countdownConfig.enabled is false, it's a harmless passthrough forever).
 * Nothing in CountdownPage, useCountdown, or countdown.config touches the
 * real homepage, and nothing in the real homepage touches these files.
 */
export default function CountdownGate({ children }: CountdownGateProps) {
  if (countdownConfig.enabled) {
    return <CountdownPage />;
  }
  return <>{children}</>;
}
