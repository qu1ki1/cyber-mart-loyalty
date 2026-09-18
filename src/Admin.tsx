import AdminMenu from "./admin/AdminMenu";
import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Winners from "./admin/Winners";
import Settings from "./admin/Settings";

export default function Admin() {
  const path = window.location.pathname;

  let content = <Dashboard />;

  if (path === "/admin/users") content = <Users />;
  if (path === "/admin/gifts") content = <Gifts />;
  if (path === "/admin/winners") content = <Winners />;
  if (path === "/admin/settings") content = <Settings />;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
      }}
    >
      <AdminMenu />
      <main style={{ flex: 1, overflow: "auto" }}>{content}</main>
    </div>
  );
}