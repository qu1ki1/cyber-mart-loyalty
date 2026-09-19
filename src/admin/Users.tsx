import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getUsers,
  type User
} from "./supabaseAdmin";
import { ADMIN_BUSINESS_ID_KEY } from "./AdminGate";



export default function Users(){


const [users,setUsers]=
useState<User[]>([]);


const [loading,setLoading]=
useState(true);




useEffect(()=>{


load();


},[]);





async function load(){


const businessId = Number(sessionStorage.getItem(ADMIN_BUSINESS_ID_KEY));
const data =
await getUsers(businessId);


setUsers(data);


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
USERS
</h1>


<p
style={{
color:"var(--muted)"
}}
>
Участники программы лояльности
</p>






{

loading

?


<div className="admin-card">

Loading...

</div>



:


<div className="users-grid">


{

users.map((user,index)=>(


<motion.div

key={user.id}

className="admin-card user-card"


initial={{
opacity:0,
scale:.9
}}


animate={{
opacity:1,
scale:1
}}


transition={{

delay:index*.04

}}

>


<div className="user-top">


<div className="avatar">


<svg

viewBox="0 0 24 24"

fill="none"

>


<circle

cx="12"

cy="8"

r="4"

stroke="currentColor"

/>


<path

d="M4 21c0-4 3-7 8-7s8 3 8 7"

stroke="currentColor"

/>


</svg>


</div>





<div>


<h2>

{
user.first_name
||
"Unknown"
}

</h2>



<span>

@

{
user.username
||
"user"
}

</span>


</div>


</div>







<div className="user-stats">


<div>


<label>
Telegram
</label>


<strong>

{user.telegram_id}

</strong>


</div>




<div>


<label>
Attempts
</label>


<strong>

{user.attempts || 0}

</strong>


</div>



</div>







{

user.gift &&


<div className="user-gift">


WIN:

<br/>


<strong>

{user.gift}

</strong>


</div>


}





</motion.div>


))


}



</div>


}





<style>{`

.users-grid{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(260px,1fr)
);


gap:20px;


}




.user-top{


display:flex;


align-items:center;


gap:15px;


}



.avatar{


width:55px;


height:55px;


border-radius:50%;


display:flex;


align-items:center;


justify-content:center;



background:

rgba(57,255,138,.08);



color:var(--neon);



}



.avatar svg{


width:30px;


height:30px;


}




.user-card h2{


font-family:Rajdhani;


margin:0;


font-size:25px;


}



.user-card span{


color:var(--muted);


font-size:13px;


}




.user-stats{


display:flex;


justify-content:space-between;


margin-top:25px;


}




.user-stats label{


display:block;


font-size:11px;


color:var(--muted);


}



.user-stats strong{


font-size:18px;


color:var(--cyan);


}




.user-gift{


margin-top:20px;


padding:15px;


border-radius:14px;



background:

rgba(57,255,138,.08);



border:

1px solid rgba(57,255,138,.2);



color:var(--neon);


}



`}</style>



</motion.div>


</div>


)

}