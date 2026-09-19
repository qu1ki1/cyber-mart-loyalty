import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase";


type Winner = {

id:number;

telegram_id:number;

gift_name:string;

created_at:string;

};




export default function Winners(){


const [winners,setWinners]=
useState<Winner[]>([]);


const [loading,setLoading]=
useState(true);





useEffect(()=>{


load();


},[]);




async function load(){


const {data,error}=

await supabase

.from("winners")

.select("*")

.order(
"created_at",
{
ascending:false
}
);



if(error){

console.error(error);

return;

}



setWinners(data || []);

setLoading(false);


}





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
🏆 Победы
</h1>


<p
style={{
color:"var(--muted)"
}}
>
История открытий кейсов
</p>





{
loading

?

<div className="admin-card">

Загрузка...

</div>


:


<div className="winner-grid">


{
winners.map(
(winner,index)=>(


<motion.div

key={winner.id}

className="admin-card winner-card"


initial={{
opacity:0,
x:-20
}}

animate={{
opacity:1,
x:0
}}

transition={{
delay:index*.05
}}

>



<div className="winner-icon">

🏆

</div>




<h2>

{winner.gift_name}

</h2>



<div className="winner-info">


<p>

Telegram ID

</p>


<strong>

{winner.telegram_id}

</strong>


</div>





<div className="date">


🕒


{
new Date(
winner.created_at
)
.toLocaleString(
"ru-RU"
)
}


</div>



</motion.div>


))
}



</div>


}




<style>{`

.winner-grid{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(260px,1fr)
);


gap:18px;


}



.winner-card{


border-color:

rgba(255,215,80,.25);



}



.winner-card:hover{


transform:

translateY(-5px);



box-shadow:

0 0 40px rgba(255,215,80,.15);



}



.winner-icon{


font-size:42px;


}



.winner-card h2{


font-family:Rajdhani;


font-size:26px;


margin:15px 0;


}



.winner-info p{


color:var(--muted);


font-size:12px;


margin:0;


}



.winner-info strong{


color:var(--cyan);


font-size:18px;


}



.date{


margin-top:18px;


color:var(--muted);


font-size:13px;


}




@media(max-width:600px){


.winner-grid{


grid-template-columns:1fr;


}


}



`}</style>



</motion.div>


</div>


)

}