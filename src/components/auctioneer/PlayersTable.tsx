import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayersTableProps } from "@/types/auction";

export const PlayersTable = ({ players }: PlayersTableProps) => {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Available Players</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>{player.nationality}</TableCell>
              <TableCell>{player.role}</TableCell>
              <TableCell>{player.age}</TableCell>
              <TableCell>{player.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};