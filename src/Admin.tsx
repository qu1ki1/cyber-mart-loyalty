import { AnimatePresence, motion } from "framer-motion";

import AdminMenu from "./admin/AdminMenu";

import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Gifts from "./admin/Gifts";
import Winners from "./admin/Winners";
import Settings from "./admin/Settings";



export default function Admin(){


const path =
window.location.pathname;



let page =
<Dashboard/>;



if(path==="/admin/users")
page=<Users/>;


if(path==="/admin/gifts")
page=<Gifts/>;


if(path==="/admin/winners")
page=<Winners/>;


if(path==="/admin/settings")
page=<Settings/>;




return (

<div className="admin-app">


<div className="cyber-bg"/>

<div className="cyber-glow"/>



<div
style={{
position:"relative",
zIndex:2
}}
>


<AdminMenu/>




<AnimatePresence mode="wait">


<motion.main

key={path}

initial={{
opacity:0,
y:25
}}

animate={{
opacity:1,
y:0
}}

exit={{
opacity:0,
y:-20
}}

transition={{
duration:.25
}}

style={{
padding:"20px",
maxWidth:1100,
margin:"0 auto"
}}

>


{page}


</motion.main>


</AnimatePresence>



</div>



</div>

)

}