// Style
import "./UserCards.css";
// Components
import { CardContent, CustomPagination, EmptyMessage } from "@/components";
import { UserActions, UserBadges, UserIdentity } from ".";
import type { UserListProps } from "./types";

export function UserCards({
  rows,
  isLoading,
  error,
  retry,
  pagination,
  emptyTitle,
  emptyMessage,
  handlers,
}: UserListProps) {
  return (
    <CardContent isLoading={isLoading} error={error} onRetry={retry}>
      {rows.length === 0 ? (
        <EmptyMessage title={emptyTitle} message={emptyMessage} />
      ) : (
        <ul className="user-cards">
          {rows.map((row) => (
            <li key={row.id} className="card flat user-card stack col gap-3">
              <UserIdentity row={row} />
              <UserBadges row={row} />
              <dl className="user-card__meta">
                <div>
                  <dt className="text caption">Telegram ID</dt>
                  <dd className="text sm ink">{row.telegramId}</dd>
                </div>
                <div>
                  <dt className="text caption">Last login</dt>
                  <dd className="text sm ink">{row.lastLogin}</dd>
                </div>
                <div>
                  <dt className="text caption">Joined</dt>
                  <dd className="text sm ink">{row.created}</dd>
                </div>
              </dl>
              <UserActions row={row} handlers={handlers} align="start" />
            </li>
          ))}
        </ul>
      )}
      <CustomPagination
        pageCount={Math.ceil(pagination.total / pagination.pageSize)}
        forcePage={pagination.page}
        onPageChange={pagination.onPageChange}
      />
    </CardContent>
  );
}
