// Style
import "./UserToolbar.css";
// Components
import { Button, InputField } from "@/components";
// Hooks
import type { UserDirectoryApi } from "@/hooks";
// Types
import type { UserTab } from "@/data/users";

interface UserToolbarProps extends Pick<
  UserDirectoryApi,
  "tabs" | "tab" | "search" | "total"
> {
  onTabChange: (tab: UserTab) => void;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function UserToolbar({
  tabs,
  tab,
  search,
  total,
  onTabChange,
  onSearchChange,
  onCreate,
}: UserToolbarProps) {
  return (
    <div className="user-toolbar">
      <div className="stack row between middle nowrap">
        <div className="stack col gap-1 flex-1">
          <h6>User management</h6>
          <p className="text sm muted">
            {total} {total === 1 ? "user" : "users"} shown
          </p>
        </div>
        <Button text="Add user" iconName="personFillPlus" onClick={onCreate} />
      </div>

      <div className="user-toolbar__filters">
        <div
          className="user-toolbar__tabs"
          role="tablist"
          aria-label="Filter by role"
        >
          {tabs.map((item) => (
            <Button
              key={item.value}
              size="sm"
              pill
              role="tab"
              aria-selected={tab === item.value}
              variant={
                tab === item.value
                  ? "primary"
                  : item.alert
                    ? "secondary"
                    : "outline"
              }
              onClick={() => onTabChange(item.value)}
            >
              {item.label}
              <span className="user-toolbar__count">{item.count}</span>
            </Button>
          ))}
        </div>

        <div className="user-toolbar__search">
          <InputField
            name="search"
            type="search"
            placeholder="Search name or email"
            aria-label="Search users"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
