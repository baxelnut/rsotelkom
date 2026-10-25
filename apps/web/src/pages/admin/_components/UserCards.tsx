// Style
import "./UserCards.css";
// Components
import { CardContent, CustomPagination, EmptyMessage } from "@/components";
import { UserActions, UserBadges, UserIdentity } from ".";
import type { UserListProps } from "./types";
// Utils
import { cx } from "@/utils/cx";

const SKELETON_CARDS = 3;
const META_LABELS = ["Telegram ID", "Last login", "Joined"] as const;

function SkeletonBar({ className }: { className?: string }) {
  return <span className={cx("user-skeleton", className)} />;
}

function UserCardsSkeleton() {
  return (
    <ul className="user-cards" aria-hidden="true">
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <li key={index} className="card flat user-card stack col gap-5">
          <div className="user-card-skeleton__identity">
            <SkeletonBar className="user-skeleton--avatar" />
            <div className="stack col gap-2">
              <SkeletonBar className="user-skeleton--name" />
              <SkeletonBar className="user-skeleton--sub" />
            </div>
          </div>
          <div className="user-card-skeleton__badges">
            <SkeletonBar className="user-skeleton--badge" />
            <SkeletonBar className="user-skeleton--badge" />
          </div>
          <dl className="user-card__meta">
            {META_LABELS.map((label) => (
              <div key={label}>
                <dt className="text caption">{label}</dt>
                <dd>
                  <SkeletonBar className="user-skeleton--meta" />
                </dd>
              </div>
            ))}
          </dl>
          <div className="user-card-skeleton__actions">
            <SkeletonBar className="user-skeleton--action" />
            <SkeletonBar className="user-skeleton--action" />
          </div>
        </li>
      ))}
    </ul>
  );
}

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
    // isLoading is deliberately passed as false: CardContent would render the
    // spinner instead of the skeleton. Errors still go through it.
    <CardContent isLoading={false} error={error} onRetry={retry}>
      {isLoading ? (
        <UserCardsSkeleton />
      ) : rows.length === 0 ? (
        <EmptyMessage title={emptyTitle} message={emptyMessage} />
      ) : (
        <ul className="user-cards">
          {rows.map((row) => (
            <li key={row.id} className="card flat user-card stack col gap-5">
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
              <UserActions row={row} handlers={handlers} align="center" />
            </li>
          ))}
        </ul>
      )}
      {!isLoading && (
        <CustomPagination
          pageCount={Math.ceil(pagination.total / pagination.pageSize)}
          forcePage={pagination.page}
          onPageChange={pagination.onPageChange}
        />
      )}
    </CardContent>
  );
}
