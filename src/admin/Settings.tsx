import { motion } from "framer-motion";
import { useState } from "react";



export default function Settings(){



const [adminId,setAdminId]=
useState(
localStorage.getItem("admin_id") || ""
);



function save(){


localStorage.setItem(
"admin_id",
adminId
);


alert(
"Настройки сохранены"
);


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

SETTINGS

</h1>


<p
style={{
color:"var(--muted)"
}}
>

CYBER MART CONTROL

</p>





<div className="admin-card">


<h2>

ADMIN ACCESS

</h2>



<p

style={{

color:"var(--muted)"

}}

>

Telegram ID администратора

</p>




<input

className="cyber-input"

placeholder="Telegram ID"

value={adminId}

onChange={e=>

setAdminId(
e.target.value
)

}

/>



<button

className="cta"

onClick={save}

>

SAVE

</button>



</div>








<div className="admin-card"


style={{

marginTop:20

}}

>


<h2>

SYSTEM

</h2>




<div className="setting-row">

<span>
Telegram WebApp
</span>


<strong>
ONLINE
</strong>

</div>



<div className="setting-row">

<span>
Database
</span>


<strong>
CONNECTED
</strong>

</div>



<div className="setting-row">

<span>
Version
</span>


<strong>
1.0.0
</strong>

</div>



</div>








<style>{`

.cyber-input{


width:100%;


margin:15px 0;


padding:15px;


border-radius:14px;


border:

1px solid var(--line);



background:

rgba(0,0,0,.3);



color:white;


}





.setting-row{


display:flex;


justify-content:space-between;


padding:15px 0;


border-bottom:

1px solid var(--line-dim);


}




.setting-row strong{


color:var(--neon);


}



`}</style>





</motion.div>


</div>


)

}