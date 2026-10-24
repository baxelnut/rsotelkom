// Style
import "./UserIdentity.css";
// Components
import { Avatar } from "@/components";
// Hooks
import type { UserRow } from "@/hooks";

interface UserIdentityProps {
  row: UserRow;
}

export function UserIdentity({ row }: UserIdentityProps) {
  return (
    <div className="user-identity stack row middle nowrap gap-3">
      <Avatar src={null} name={row.name} size="md" />
      <div className="user-identity__text stack col gap-1">
        <span className="text sm semibold ink">{row.name}</span>
        <span className="text sm muted">{row.email}</span>
      </div>
    </div>
  );
}
