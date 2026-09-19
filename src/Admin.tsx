import AdminMenu from "./admin/AdminMenu";
import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Winners from "./admin/Winners";
import Settings from "./admin/Settings";


export default function Admin(){


const path = window.location.pathname;



let content=<Dashboard/>;


if(path==="/admin/users")
content=<Users/>;


if(path==="/admin/gifts")
content=<Gifts/>;


if(path==="/admin/winners")
content=<Winners/>;


if(path==="/admin/settings")
content=<Settings/>;



return (

<div className="admin">


<AdminMenu/>


<section className="content">

{content}

</section>



<style>{`

.admin{

min-height:100dvh;

background:#050505;

color:white;

display:flex;

flex-direction:column;

}



.content{

flex:1;

padding:20px;

overflow:auto;

}



`}</style>


</div>

)

}