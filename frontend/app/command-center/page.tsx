"use client";

/* ── Palantir-Class Regional Command Center ──
   Full-screen 6-zone CSS grid layout with Command Snapshot overlay:
   ┌─────────────────────────────────────────────┐
   │                 TopCommandBar                │
   ├─────────────────────────────────────────────┤
   │           ImpactSummaryStrip (playback)      │
   ├──────────┬──────────────────┬────────────────┤
   │  Left    │   Center Globe   │   Right        │
   │ Situation│  + Snapshot      │  Decision      │
   │  Rail    │    Overlay       │   Rail         │
   ├──────────┴──────────────────┴────────────────┤
   │           BottomExecutionTimeline            │
   └─────────────────────────────────────────────-┘ */

import { ControlRoomProvider } from "@/lib/state/controlRoomStore";
import { TopCommandBar } from "@/components/control-room/TopCommandBar";
import { LeftSituationRail } from "@/components/control-room/LeftSituationRail";
import { CenterGlobeStage } from "@/components/control-room/CenterGlobeStage";
import { RightDecisionRail } from "@/components/control-room/RightDecisionRail";
import { BottomExecutionTimeline } from "@/components/control-room/BottomExecutionTimeline";
import { ImpactSummaryStrip } from "@/components/control-room/ImpactSummaryStrip";
// CommandSnapshotOverlay is rendered inside CenterGlobeStage

export default function CommandCenterPage() {
  return (
    <ControlRoomProvider>
      <div
        className="relative h-screen w-screen overflow-hidden bg-[#060810] text-white antialiased"
        style={{
          display: "grid",
          gridTemplateAreas: `
            "cmdbar   cmdbar   cmdbar"
            "strip    strip    strip"
            "left     globe    right"
            "timeline timeline timeline"
          `,
          gridTemplateColumns: "280px 1fr 320px",
          gridTemplateRows: "48px auto 1fr 160px",
        }}
      >
        <TopCommandBar />
        <ImpactSummaryStrip />
        <LeftSituationRail />
        <CenterGlobeStage />
        <RightDecisionRail />
        <BottomExecutionTimeline />
      </div>
    </ControlRoomProvider>
  );
}
