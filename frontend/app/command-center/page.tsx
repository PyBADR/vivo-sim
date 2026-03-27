"use client";

/* ── Palantir-Class Regional Command Center ──
   Full-screen 5-zone CSS grid layout:
   ┌─────────────────────────────────────────────┐
   │                 TopCommandBar                │
   ├──────────┬──────────────────┬────────────────┤
   │  Left    │   Center Globe   │   Right        │
   │ Situation│     Stage        │  Decision      │
   │  Rail    │                  │   Rail         │
   ├──────────┴──────────────────┴────────────────┤
   │           BottomExecutionTimeline            │
   └─────────────────────────────────────────────-┘ */

import { ControlRoomProvider } from "@/lib/state/controlRoomStore";
import { TopCommandBar } from "@/components/control-room/TopCommandBar";
import { LeftSituationRail } from "@/components/control-room/LeftSituationRail";
import { CenterGlobeStage } from "@/components/control-room/CenterGlobeStage";
import { RightDecisionRail } from "@/components/control-room/RightDecisionRail";
import { BottomExecutionTimeline } from "@/components/control-room/BottomExecutionTimeline";

export default function CommandCenterPage() {
  return (
    <ControlRoomProvider>
      <div
        className="h-screen w-screen overflow-hidden bg-[#060810] text-white antialiased"
        style={{
          display: "grid",
          gridTemplateAreas: `
            "cmdbar   cmdbar   cmdbar"
            "left     globe    right"
            "timeline timeline timeline"
          `,
          gridTemplateColumns: "280px 1fr 320px",
          gridTemplateRows: "48px 1fr 160px",
        }}
      >
        <TopCommandBar />
        <LeftSituationRail />
        <CenterGlobeStage />
        <RightDecisionRail />
        <BottomExecutionTimeline />
      </div>
    </ControlRoomProvider>
  );
}
