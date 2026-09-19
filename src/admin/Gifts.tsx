import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  getGifts,
  createGift,
  updateGift,
  deleteGift,
  toggleGift,
  type Gift,
} from "./supabaseAdmin";


export default function Gifts(){


const [gifts,setGifts]=useState<Gift[]>([]);
const [loading,setLoading]=useState(true);

const [showForm,setShowForm]=useState(false);


const [form,setForm]=useState({

name:"",
chance:0,
quantity:0,
active:true

});



async function load(){

setLoading(true);

const data=await getGifts();

setGifts(data);

setLoading(false);

}



useEffect(()=>{

load();

},[]);





async function addGift(){


if(!form.name.trim()){

alert("Введите название");

return;

}


await createGift(form);


setForm({

name:"",
chance:0,
quantity:0,
active:true

});


setShowForm(false);

load();

}





async function editField(
gift:Gift,
field:"name"|"chance"|"quantity"
){


const value=prompt(
"Новое значение",
String(gift[field])
);


if(value===null)return;


await updateGift(
gift.id,
{

[field]:

field==="name"

?

value

:

Number(value)

}

);


load();


}





async function removeGift(id:number){


if(!confirm("Удалить подарок?"))
return;


await deleteGift(id);

load();

}





async function changeStatus(gift:Gift){


await toggleGift(
gift.id,
!gift.active
);


load();

}





return (

<div className="admin-page">


<div className="page-head">


<div>

<h1>
🎁 Подарки
</h1>

<p>
Управление призами и шансами
</p>

</div>


<button
className="cyber-button"
onClick={()=>setShowForm(!showForm)}
>

+ Добавить

</button>


</div>




{
showForm &&

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

Сохранить

</button>



</div>

}





{
loading

?

<div>
Загрузка...
</div>


:

<div className="gift-grid">


{
gifts.map((gift,index)=>(


<motion.div

key={gift.id}

className="admin-card"


initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*0.05
}}

>


<h2>
🎁 {gift.name}
</h2>


<p>
Шанс:
<b>
{gift.chance}%
</b>
</p>


<p>
Количество:
<b>
{gift.quantity}
</b>
</p>



<button

className={
gift.active
?
"status-on"
:
"status-off"
}

onClick={()=>changeStatus(gift)}

>

{
gift.active
?
"Активен"
:
"Выключен"
}

</button>




<button

className="edit-btn"

onClick={()=>editField(gift,"chance")}

>

Изменить шанс

</button>



<button

className="delete-btn"

onClick={()=>removeGift(gift.id)}

>

Удалить

</button>



</motion.div>


))
}


</div>

}



</div>

)

}