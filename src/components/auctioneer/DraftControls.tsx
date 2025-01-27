import { Button } from "@/components/ui/button";
import { DraftControlsProps } from "@/types/auction";

export const DraftControls = ({
  status,
  onStart,
  onPause,
  onNext,
  onEnd,
}: DraftControlsProps) => {
  return (
    <div className="space-x-4">
      {status === "not_started" && (
        <Button onClick={onStart}>Start Draft</Button>
      )}
      {(status === "in_progress" || status === "paused") && (
        <>
          <Button onClick={onPause}>
            {status === "paused" ? "Resume Draft" : "Pause Draft"}
          </Button>
          <Button onClick={onNext}>Next Team</Button>
          <Button variant="destructive" onClick={onEnd}>
            End Draft
          </Button>
        </>
      )}
    </div>
  );
};