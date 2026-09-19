import { useState } from "react";

import AdminMenu from "./admin/AdminMenu";
import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Winners from "./admin/Winners";
import Settings from "./admin/Settings";


export default function Admin() {

  const path = window.location.pathname;

  const [menuOpen,setMenuOpen] = useState(false);


  let content = <Dashboard />;


  if(path === "/admin/users")
    content = <Users />;


  if(path === "/admin/gifts")
    content = <Gifts />;


  if(path === "/admin/winners")
    content = <Winners />;


  if(path === "/admin/settings")
    content = <Settings />;



  return (

    <div
      style={{
        display:"flex",
        minHeight:"100vh",
        background:"var(--bg)",
        color:"var(--ink)",
        position:"relative"
      }}
    >


      <AdminMenu
        open={menuOpen}
        close={()=>setMenuOpen(false)}
      />



      <main
        style={{
          flex:1,
          overflow:"auto",
          width:"100%"
        }}
      >


        <button
          onClick={()=>setMenuOpen(true)}
          style={{
            display:"none",
            position:"fixed",
            top:15,
            left:15,
            zIndex:1000,
            background:"var(--neon)",
            border:0,
            borderRadius:10,
            padding:"10px 14px",
            fontSize:20
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>


        {content}


      </main>


    </div>

  );

}