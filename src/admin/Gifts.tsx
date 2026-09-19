import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getGifts,
  createGift,
  toggleGift,
  deleteGift,
  type Gift
} from "./supabaseAdmin";
import { ADMIN_BUSINESS_ID_KEY } from "./AdminGate";



export default function Gifts(){

const businessId = Number(sessionStorage.getItem(ADMIN_BUSINESS_ID_KEY));


const [gifts,setGifts]=useState<Gift[]>([]);

const [loading,setLoading]=useState(true);


const [form,setForm]=useState({

name:"",
chance:0,
quantity:0

});



async function load(){

const data = await getGifts(businessId);

setGifts(data);

setLoading(false);

}



useEffect(()=>{

load();

},[]);





async function addGift(){


if(!form.name.trim()) return;



await createGift({

name:form.name,

chance:form.chance,

quantity:form.quantity,

active:true

}, businessId);



setForm({

name:"",
chance:0,
quantity:0

});


load();


}







return (

<div className="admin-page">


<motion.div

initial={{opacity:0,y:20}}

animate={{opacity:1,y:0}}

>


<h1>

PRIZES

</h1>


<p style={{color:"var(--muted)"}}>

Управление подарками

</p>




<div className="admin-card">


<input

className="cyber-input"

placeholder="Название"

value={form.name}

onChange={e=>

setForm({

...form,

name:e.target.value

})

}


/>



<input

className="cyber-input"

type="number"

placeholder="Шанс"

value={form.chance}

onChange={e=>

setForm({

...form,

chance:Number(e.target.value)

})

}


/>



<input

className="cyber-input"

type="number"

placeholder="Количество"

value={form.quantity}

onChange={e=>

setForm({

...form,

quantity:Number(e.target.value)

})

}


/>



<button

className="cyber-button"

onClick={addGift}

>

ADD

</button>


</div>






{

loading

?

<div className="admin-card">

Loading...

</div>



:


<div className="gift-grid">


{

gifts.map((gift,index)=>(


<motion.div

key={gift.id}

className="admin-card"

initial={{opacity:0,scale:.9}}

animate={{opacity:1,scale:1}}

transition={{

delay:index*0.05

}}

>


<div className="gift-svg">


<svg

viewBox="0 0 24 24"

fill="none"

>

<path

d="M20 12H4M12 4v16"

stroke="currentColor"

strokeWidth="1.5"

/>

<rect

x="4"

y="7"

width="16"

height="14"

stroke="currentColor"

strokeWidth="1.5"

/>


</svg>

</div>




<h2>

{gift.name}

</h2>



<div className="gift-stats">


<div>

<span>
Шанс
</span>

<strong>
{gift.chance}%
</strong>

</div>



<div>

<span>
Осталось
</span>

<strong>
{gift.quantity}
</strong>

</div>


</div>




<button

className="cyber-button"

onClick={async()=>{


await toggleGift(

gift.id,

!gift.active,

businessId

);


load();


}}

>

{

gift.active

?

"ACTIVE"

:

"OFF"

}


</button>



<button

className="delete-btn"

onClick={async()=>{


await deleteGift(gift.id, businessId);

load();


}}

>

DELETE

</button>



</motion.div>


))

}


</div>


}





<style>{`

.gift-grid{

display:grid;

grid-template-columns:

repeat(auto-fit,minmax(260px,1fr));

gap:20px;

}



.gift-svg svg{

width:60px;

height:60px;

stroke:var(--neon);

}



.gift-stats{

display:flex;

justify-content:space-around;

margin:20px 0;

}



.gift-stats span{

display:block;

color:var(--muted);

font-size:12px;

}



.gift-stats strong{

font-size:28px;

color:var(--cyan);

}



.cyber-input{

width:100%;

padding:14px;

margin-bottom:12px;

background:#050505;

border:1px solid var(--line);

border-radius:12px;

color:white;

}



.delete-btn{

margin-top:12px;

background:none;

border:1px solid #ff5555;

color:#ff5555;

padding:10px 20px;

border-radius:12px;

}



`}</style>



</motion.div>


</div>


)

}