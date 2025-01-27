import { Button } from "@/components/ui/button";
import { TeamActionsProps } from "@/types/auction";

export const TeamActions = ({
  onSubmitSelection,
  onPassTurn,
  isSubmitting,
  isMyTurn,
  selectedPlayerId,
}: TeamActionsProps) => {
  return (
    <div className="space-x-4">
      <Button
        onClick={onSubmitSelection}
        disabled={!selectedPlayerId || isSubmitting || !isMyTurn}
      >
        {isSubmitting ? "Submitting..." : "Submit Selection"}
      </Button>
      <Button variant="outline" onClick={onPassTurn} disabled={!isMyTurn}>
        Pass Turn
      </Button>
    </div>
  );
};