// Style
import "./AdminPage.css";
// Components
import { ConfirmDialog, Seo } from "@/components";
import { UserCards, UserFormModal } from "./_components";
import { UserTable, UserToolbar } from "./_components";
import type { UserRowHandlers } from "./_components";
// Contexts & Hooks
import { useAuth } from "@/contexts/auth";
import { useIsDesktop } from "@/hooks";
import { useUserActions, useUserDirectory, useUserEditor } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";

export default function AdminPage() {
  const { profile } = useAuth();
  const meId = profile?.id;
  const isDesktop = useIsDesktop();
  const directory = useUserDirectory(meId);
  const actions = useUserActions(meId);
  const editor = useUserEditor({ meId, onSaved: actions.announce });

  const handlers: UserRowHandlers = {
    busyId: actions.busyId,
    onApprove: (row) => actions.approve(row.user),
    onDecline: (row) => actions.request("decline", row.user),
    onEdit: (row) => editor.openEdit(row.user),
    onToggleActive: (row) =>
      row.isActive
        ? actions.request("deactivate", row.user)
        : actions.activate(row.user),
    onDelete: (row) => actions.request("delete", row.user),
  };

  const List = isDesktop ? UserTable : UserCards;

  return (
    <div className="page admin-page">
      <Seo page="admin" />

      <div className="card stack col gap-4">
        <UserToolbar
          tabs={directory.tabs}
          tab={directory.tab}
          search={directory.search}
          total={directory.total}
          onTabChange={directory.setTab}
          onSearchChange={directory.setSearch}
          onCreate={editor.openCreate}
        />

        {actions.notice && (
          <p
            className={cx("card flat text sm", actions.notice.tone)}
            role="status"
          >
            {actions.notice.message}
          </p>
        )}

        <List
          rows={directory.rows}
          isLoading={directory.isLoading}
          error={directory.error}
          retry={directory.retry}
          pagination={directory.pagination}
          emptyTitle={directory.emptyTitle}
          emptyMessage={directory.emptyMessage}
          handlers={handlers}
        />
      </div>

      <UserFormModal {...editor} />

      {actions.dialog && (
        <ConfirmDialog
          {...actions.dialog}
          loading={actions.isBusy}
          onConfirm={actions.confirmAction}
          onCancel={actions.cancelConfirm}
        />
      )}
    </div>
  );
}
