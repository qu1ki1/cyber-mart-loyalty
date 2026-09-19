import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getUsers,
  type User
} from "./supabaseAdmin";



function Counter({

value

}:{

value:number

}){


const [count,setCount]=useState(0);



useEffect(()=>{


let start=0;


const step =
Math.ceil(value/30);



const timer=setInterval(()=>{


start += step;



if(start>=value){

setCount(value);

clearInterval(timer);

}

else{

setCount(start);

}



},30);



return()=>clearInterval(timer);


},[value]);



return <>{count}</>;

}







export default function Dashboard(){


const [users,setUsers]=
useState<User[]>([]);



const [loading,setLoading]=
useState(true);






useEffect(()=>{


getUsers()

.then(setUsers)

.finally(()=>setLoading(false));


},[]);






const stats=[


{

title:"TOTAL USERS",

value:users.length,

type:"users"

},


{

title:"REWARDS",

value:

users.filter(
u=>u.gift
).length,

type:"rewards"

},



{

title:"ATTEMPTS",

value:

users.reduce(

(sum,u)=>

sum+(u.attempts||0),

0

),

type:"attempts"

}


];








return (

<div className="admin-page">


<motion.div

initial={{

opacity:0,

y:20

}}

animate={{

opacity:1,

y:0

}}

>


<h1>

DASHBOARD

</h1>


<p

style={{

color:"var(--muted)"

}}

>

CYBER MART CONTROL CENTER

</p>





{

loading


?

<div className="admin-card">

Loading...

</div>



:


<div className="dashboard-grid">





{

stats.map((item,index)=>(


<motion.div

key={item.title}

className="admin-card stat-box"


initial={{

opacity:0,

scale:.85

}}

animate={{

opacity:1,

scale:1

}}

transition={{

delay:index*.12

}}

>



<div className="stat-line">

</div>



<p>

{item.title}

</p>



<strong>


<Counter

value={item.value}

/>


</strong>




</motion.div>


))


}





</div>


}






<div className="admin-card activity">


<h2>

SYSTEM STATUS

</h2>



<div className="status-row">


<div>

DATABASE

</div>


<span>

ONLINE

</span>


</div>




<div className="status-row">


<div>

TELEGRAM API

</div>


<span>

ONLINE

</span>


</div>



<div className="status-row">


<div>

MINI APP

</div>


<span>

ACTIVE

</span>


</div>



</div>






<style>{`

.dashboard-grid{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(240px,1fr)
);


gap:20px;


}





.stat-box{


position:relative;


overflow:hidden;


}



.stat-line{


height:3px;


width:100%;


background:

linear-gradient(
90deg,
transparent,
var(--neon),
transparent
);


margin-bottom:20px;


}



.stat-box p{


color:var(--muted);


font-size:13px;


letter-spacing:.15em;


}



.stat-box strong{


font-family:Rajdhani;


font-size:60px;


color:var(--neon);


}




.activity{


margin-top:25px;


}



.activity h2{


font-family:Rajdhani;


}



.status-row{


display:flex;


justify-content:space-between;


padding:15px 0;


border-bottom:

1px solid var(--line-dim);


color:var(--muted);


}



.status-row span{


color:var(--neon);


font-weight:700;


}





@media(max-width:600px){


.stat-box strong{


font-size:48px;


}


}



`}</style>




</motion.div>


</div>


)

}