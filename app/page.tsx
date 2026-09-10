import CountdownGate from "../components/CountdownGate";
// import RealHomepage from "./RealHomepage"; // the eventual public homepage (Phase 3)

/**
 * Public root route ("/").
 *
 * While countdownConfig.enabled is true, visitors only ever see the
 * temporary countdown — CountdownGate short-circuits before the real
 * homepage renders, so no unfinished dashboards, portals, or APIs are
 * reachable from "/".
 *
 * When the full platform is ready to launch, set
 * NEXT_PUBLIC_COUNTDOWN_ENABLED=false and this route starts rendering the
 * real homepage automatically — no structural change needed here.
 */
export default function RootPage() {
  return (
    <CountdownGate>
      {/* <RealHomepage /> */}
      <div>{/* Real public homepage renders here once Phase 3 is built. */}</div>
    </CountdownGate>
  );
}
