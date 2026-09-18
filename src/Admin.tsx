import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Winners from "./admin/Winners";
import Settings from "./admin/Settings";

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