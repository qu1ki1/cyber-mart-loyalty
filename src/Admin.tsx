import { AnimatePresence, motion } from "framer-motion";

import AdminMenu from "./admin/AdminMenu";

import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Winners from "./admin/Winners";
import Settings from "./admin/Settings";



export default function Admin(){


const path = window.location.pathname;



let content = <Dashboard/>;


if(path === "/admin/users")
content = <Users/>;


if(path === "/admin/gifts")
content = <Gifts/>;


if(path === "/admin/winners")
content = <Winners/>;


if(path === "/admin/settings")
content = <Settings/>;





return (

<div className="admin-app">


<div className="cyber-bg"></div>

<div className="cyber-glow"></div>



<AdminMenu />



<AnimatePresence mode="wait">


<motion.main

key={path}

className="admin-content"


initial={{

opacity:0,

y:20

}}


animate={{

opacity:1,

y:0

}}


exit={{

opacity:0,

y:-15

}}


transition={{

duration:.25

}}

>


{content}


</motion.main>


</AnimatePresence>





<style>{`

.admin-app{


position:relative;

min-height:100dvh;

overflow:hidden;

background:var(--bg);

color:var(--ink);

}



.admin-content{


position:relative;

z-index:2;


width:100%;


max-width:520px;


margin:0 auto;


padding:20px;


}



@media(max-width:600px){


.admin-content{

padding:15px;

}



}



`}</style>



</div>

)

}