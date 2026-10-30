export type NavSection = "overview" | "orders" | "ledger" | "operator";

const ITEMS: readonly { value: NavSection; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "orders", label: "Orders" },
  { value: "ledger", label: "Ledger" },
  { value: "operator", label: "Operator" },
];

/** Section navigation: a sidebar on wide screens, a top bar on narrow screens and in stage mode. */
export function DashboardNav(props: {
  current: NavSection;
  stage: boolean;
  onSelect: (section: NavSection) => void;
}) {
  // Stage mode is for the room: no operator tools there (same as before the redesign).
  const items = props.stage ? ITEMS.filter((i) => i.value !== "operator") : ITEMS;
  return (
    <nav className="dnav" aria-label="Dashboard sections">
      <ul className="dnav-list">
        {items.map((item) => {
          const current = props.current === item.value;
          return (
            <li key={item.value}>
              <button
                type="button"
                className={`dnav-item${current ? " selected" : ""}`}
                aria-current={current ? "page" : undefined}
                onClick={() => props.onSelect(item.value)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
