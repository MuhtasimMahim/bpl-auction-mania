import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayerSelectionTableProps } from "@/types/auction";

export const PlayerSelectionTable = ({
  players,
  selectedPlayerId,
  onPlayerSelect,
  isMyTurn,
}: PlayerSelectionTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Select</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Nationality</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players?.map((player) => (
          <TableRow key={player.id}>
            <TableCell>
              <RadioGroup
                value={selectedPlayerId || ""}
                onValueChange={onPlayerSelect}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={player.id}
                    id={`player-${player.id}`}
                    disabled={!isMyTurn || player.status !== "Available"}
                  />
                </div>
              </RadioGroup>
            </TableCell>
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell>{player.nationality}</TableCell>
            <TableCell>{player.role}</TableCell>
            <TableCell>{player.age}</TableCell>
            <TableCell>{player.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};