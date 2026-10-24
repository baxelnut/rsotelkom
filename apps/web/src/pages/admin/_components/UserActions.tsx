// Style
import "./UserActions.css";
// Components
import { Button } from "@/components";
import type { UserRowHandlers } from "./types";
// Hooks
import type { UserRow } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";

interface UserActionsProps {
  row: UserRow;
  handlers: UserRowHandlers;
  align?: "start" | "end";
}

export function UserActions({
  row,
  handlers,
  align = "end",
}: UserActionsProps) {
  const { busyId } = handlers;
  const busy = busyId !== null;
  const layout = cx("stack row nowrap gap-2", align);

  if (row.isPending) {
    return (
      <div className={layout}>
        <Button
          text="Approve"
          size="sm"
          iconName="check"
          loading={busyId === row.id}
          disabled={busy}
          onClick={() => handlers.onApprove(row)}
        />
        <Button
          text="Decline"
          size="sm"
          variant="outline"
          iconName="xLg"
          disabled={busy}
          onClick={() => handlers.onDecline(row)}
        />
      </div>
    );
  }

  return (
    <div className={layout}>
      <Button
        variant="ghost"
        size="sm"
        iconName="pencilSquare"
        title="Edit"
        aria-label={`Edit ${row.name}`}
        disabled={busy}
        onClick={() => handlers.onEdit(row)}
      />
      {!row.isSelf && (
        <>
          <Button
            variant="ghost"
            size="sm"
            iconName={row.isActive ? "personDashFill" : "personFillAdd"}
            title={row.isActive ? "Deactivate" : "Reactivate"}
            aria-label={`${row.isActive ? "Deactivate" : "Reactivate"} ${row.name}`}
            disabled={busy}
            onClick={() => handlers.onToggleActive(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="trash"
            title="Delete"
            aria-label={`Delete ${row.name}`}
            disabled={busy}
            onClick={() => handlers.onDelete(row)}
          />
        </>
      )}
    </div>
  );
}
