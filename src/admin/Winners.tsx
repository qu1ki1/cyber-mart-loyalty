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

console.log(error);

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
WINNERS
</h1>



<p
style={{
color:"var(--muted)"
}}
>

История выигрышей

</p>






{

loading


?


<div className="admin-card">

Loading...

</div>



:


<div className="winner-grid">



{

winners.map((win,index)=>(


<motion.div

key={win.id}

className="admin-card winner-card"


initial={{

opacity:0,

x:-30

}}

animate={{

opacity:1,

x:0

}}

transition={{

delay:index*.05

}}

>



<div className="trophy">


<svg

viewBox="0 0 24 24"

fill="none"

>


<path

d="M8 4h8v6a4 4 0 01-8 0V4"

stroke="currentColor"

strokeWidth="1.5"

/>


<path

d="M6 4H3v2a5 5 0 005 5"

stroke="currentColor"

strokeWidth="1.5"

/>


<path

d="M18 4h3v2a5 5 0 01-5 5"

stroke="currentColor"

strokeWidth="1.5"

/>


</svg>


</div>





<h2>

{win.gift_name}

</h2>






<div className="winner-data">


<div>

<span>
USER ID
</span>


<strong>

{win.telegram_id}

</strong>


</div>




<div>

<span>
DATE
</span>


<strong>

{
new Date(
win.created_at
)
.toLocaleDateString(
"ru-RU"
)
}

</strong>


</div>


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


gap:20px;


}



.winner-card{


border-color:

rgba(255,215,80,.25);



}



.winner-card:hover{


box-shadow:

0 0 40px rgba(255,215,80,.15);



transform:

translateY(-5px);



}




.trophy{


width:60px;


height:60px;


display:flex;


align-items:center;


justify-content:center;



color:#ffd85a;


background:

rgba(255,215,80,.08);



border-radius:18px;



}



.trophy svg{


width:35px;


height:35px;


}



.winner-card h2{


font-family:Rajdhani;


font-size:26px;


margin-top:20px;


}




.winner-data{


margin-top:20px;


display:flex;


justify-content:space-between;


}



.winner-data span{


display:block;


font-size:11px;


color:var(--muted);


}



.winner-data strong{


color:var(--cyan);


}



`}</style>



</motion.div>


</div>


)

}