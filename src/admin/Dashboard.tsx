import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getUsers,
  type User
} from "./supabaseAdmin";



export default function Dashboard(){


const [users,setUsers] =
useState<User[]>([]);


const [loading,setLoading] =
useState(true);




useEffect(()=>{


getUsers()

.then(setUsers)

.finally(()=>setLoading(false));


},[]);





const stats=[


{
title:"Пользователи",
value:users.length,
icon:"👥",
color:"var(--neon)"
},


{
title:"Выдано подарков",
value:
users.filter(
u=>u.gift
).length,
icon:"🎁",
color:"var(--cyan)"
},


{
title:"Попытки",
value:
users.reduce(
(sum,u)=>
sum+(u.attempts||0),
0
),
icon:"🎯",
color:"#ffd166"
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

📊 Дашборд

</h1>



<p
style={{
color:"var(--muted)"
}}
>

CYBER MART статистика

</p>





{
loading

?

<div className="admin-card">

Загрузка...

</div>


:


<div className="stats-grid">


{
stats.map(
(stat,index)=>(


<motion.div

key={stat.title}

className="admin-card"


initial={{
opacity:0,
scale:.8
}}


animate={{
opacity:1,
scale:1
}}


transition={{
delay:index*.1
}}

>


<div
style={{
fontSize:40
}}
>

{stat.icon}

</div>



<p
style={{
color:"var(--muted)"
}}
>

{stat.title}

</p>



<div

style={{

fontFamily:"Rajdhani",

fontSize:45,

fontWeight:800,

color:stat.color

}}

>

{stat.value}

</div>



</motion.div>


))
}



</div>


}



<style>{`

.admin-page h1{


font-family:Rajdhani;


font-size:34px;


margin-bottom:5px;


}



.stats-grid{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(240px,1fr)
);


gap:20px;


}



.admin-card{


background:

rgba(255,255,255,.04);



border:

1px solid rgba(57,255,138,.15);



border-radius:22px;



padding:25px;



backdrop-filter:

blur(20px);



transition:.25s;


}



.admin-card:hover{


transform:

translateY(-5px);


box-shadow:

0 0 40px rgba(57,255,138,.15);


}



@media(max-width:600px){


.stats-grid{


grid-template-columns:1fr;


}


}


`}</style>



</motion.div>


</div>

)

}