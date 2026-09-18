import Dashboard from "./Dashboard";
import Users from "./Users";
import Gifts from "./Gifts";
import Winners from "./Winners";
import Settings from "./Settings";

export default function Admin() {
  const path = window.location.pathname;

  if (path === "/admin/users") {
    return <Users />;
  }

  if (path === "/admin/gifts") {
    return <Gifts />;
  }

  if (path === "/admin/winners") {
    return <Winners />;
  }

  if (path === "/admin/settings") {
    return <Settings />;
  }

  return <Dashboard />;
}