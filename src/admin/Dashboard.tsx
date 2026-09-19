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




const totalUsers =
users.length;


const totalGifts =
users.filter(
u=>u.gift
).length;



const totalAttempts =
users.reduce(
(sum,u)=>
sum+(u.attempts||0),
0
);




const cards=[

{
title:"Пользователей",
value:totalUsers,
icon:"👥",
color:"var(--neon)"
},

{
title:"Выдано подарков",
value:totalGifts,
icon:"🎁",
color:"var(--cyan)"
},

{
title:"Всего попыток",
value:totalAttempts,
icon:"🎯",
color:"#ffb84d"
}

];





return (

<div className="dashboard">



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


<h1 className="title">

📊 Дашборд

</h1>


<p className="subtitle">

Статистика CYBER MART Loyalty

</p>



{
loading

?

<div className="loading">

Загрузка...

</div>


:

<div className="stats">


{
cards.map((card,index)=>(


<motion.div

key={card.title}


className="stat-card"


initial={{
opacity:0,
scale:.9
}}


animate={{
opacity:1,
scale:1
}}


transition={{
delay:index*.08
}}


>


<div className="icon">

{card.icon}

</div>



<div className="label">

{card.title}

</div>



<div

className="value"

style={{
color:card.color
}}

>

{card.value}

</div>



</motion.div>


))
}


</div>


}



</motion.div>





<style>{`

.dashboard{

width:100%;

}



.title{


font-family:Rajdhani;

font-size:32px;

margin:0 0 6px;


}



.subtitle{

color:var(--muted);

margin-bottom:30px;

font-size:14px;

}





.stats{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(220px,1fr)
);


gap:18px;


}





.stat-card{


background:

rgba(255,255,255,.035);


border:

1px solid var(--line-dim);


border-radius:20px;


padding:24px;



backdrop-filter:

blur(16px);



box-shadow:


0 0 40px rgba(57,255,138,.06);


transition:.25s;


}



.stat-card:hover{


transform:

translateY(-4px);


border-color:

var(--line);


}




.icon{

font-size:32px;

margin-bottom:18px;

}



.label{

font-size:13px;

color:var(--muted);

margin-bottom:8px;

}



.value{


font-family:Rajdhani;


font-size:42px;


font-weight:800;


}





@media(max-width:600px){


.title{

font-size:26px;

}


.stats{


grid-template-columns:

1fr;


}



.stat-card{

padding:20px;

}



}



`}</style>



</div>

)

}