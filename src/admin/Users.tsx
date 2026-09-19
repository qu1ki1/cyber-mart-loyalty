import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getUsers,
  type User
} from "./supabaseAdmin";



export default function Users(){


const [users,setUsers]=
useState<User[]>([]);


const [loading,setLoading]=
useState(true);




useEffect(()=>{


getUsers()

.then(setUsers)

.finally(()=>setLoading(false));


},[]);





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
👥 Пользователи
</h1>


<p
style={{
color:"var(--muted)"
}}
>
Список участников CYBER MART
</p>





{
loading

?

<div className="admin-card">

Загрузка...

</div>


:


<div className="users-grid">


{

users.map(
(user,index)=>(


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


<div className="user-head">


<div className="avatar">

👤

</div>


<div>


<h3>

{
user.first_name
||
"Без имени"
}

</h3>


<span>

@{user.username || "username"}

</span>


</div>


</div>





<div className="user-info">


<div>

<p>ID</p>

<strong>
{user.telegram_id}
</strong>

</div>



<div>

<p>Попытки</p>

<strong>
{user.attempts || 0}
</strong>

</div>


</div>






{
user.gift &&


<div className="gift-result">


🎁 {user.gift}


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


gap:18px;


}




.user-card{


transition:.25s;


}



.user-card:hover{


transform:

translateY(-5px);



}




.user-head{


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


font-size:25px;


background:

rgba(57,255,138,.1);


border:

1px solid var(--line);


}




.user-head h3{


margin:0;


font-family:Rajdhani;


font-size:22px;


}



.user-head span{


color:var(--muted);


font-size:13px;


}





.user-info{


display:flex;


justify-content:space-between;


margin-top:25px;


}



.user-info p{


color:var(--muted);


font-size:12px;


margin:0;


}



.user-info strong{


font-family:Rajdhani;


font-size:24px;


color:var(--neon);


}





.gift-result{


margin-top:20px;


padding:12px;


border-radius:14px;


background:

rgba(57,255,138,.08);


border:

1px solid var(--line);


color:var(--neon);


}




@media(max-width:600px){


.users-grid{


grid-template-columns:1fr;


}


}


`}</style>



</motion.div>


</div>


)

}