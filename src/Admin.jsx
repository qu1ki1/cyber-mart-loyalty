import {useState} from "react";

import AdminMenu from "./admin/AdminMenu";

import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Settings from "./admin/Settings";



export default function Admin(){


const [page,setPage]=useState("dashboard");



function renderPage(){


if(page==="users") return <Users/>;

if(page==="gifts") return <Gifts/>;

if(page==="settings") return <Settings/>;


return <Dashboard/>;


}



return (

<div style={{
display:"flex",
background:"#000",
color:"#fff",
minHeight:"100vh"
}}>


<AdminMenu setPage={setPage}/>


<div style={{
padding:30,
flex:1
}}>


{renderPage()}


</div>


</div>

)


}