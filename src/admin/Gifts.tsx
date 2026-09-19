import { useEffect, useState } from "react";

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



if(field==="name"){

await updateGift(
gift.id,
{
name:value
}
);

}


else{


await updateGift(
gift.id,
{
[field]:Number(value)
}
);


}



load();


}







async function removeGift(
id:number
){


if(!confirm("Удалить подарок?"))
return;


await deleteGift(id);

load();

}






async function changeStatus(
gift:Gift
){


await toggleGift(
gift.id,
!gift.active
);


load();


}






return (

<div className="admin-page">


<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:25
}}
>


<div>

<h1
style={{
fontFamily:"Rajdhani",
fontSize:30
}}
>
🎁 Подарки
</h1>


<p
style={{
color:"var(--muted)"
}}
>
Управление призами и шансами
</p>


</div>



<button
style={button}
onClick={()=>setShowForm(!showForm)}
>
+ Добавить
</button>


</div>






{
showForm &&

<div style={card}>


<input
style={input}
placeholder="Название"
value={form.name}
onChange={
e=>setForm({
...form,
name:e.target.value
})
}
/>



<input
style={input}
type="number"
min="0"
placeholder="Шанс"
value={form.chance}
onChange={
e=>setForm({
...form,
chance:Number(e.target.value)
})
}
/>




<input
style={input}
type="number"
min="0"
placeholder="Количество"
value={form.quantity}
onChange={
e=>setForm({
...form,
quantity:Number(e.target.value)
})
}
/>




<button
style={button}
onClick={addGift}
>
Сохранить
</button>



</div>

}






{
loading ?

<p>Загрузка...</p>


:


<div
style={{
...card,
overflowX:"auto"
}}
>


<table
style={{
width:"100%",
borderCollapse:"collapse"
}}
>


<thead>

<tr>

<th>ID</th>
<th>Название</th>
<th>Шанс</th>
<th>Количество</th>
<th>Статус</th>
<th>Действия</th>

</tr>


</thead>



<tbody>


{
gifts.map(gift=>(


<tr key={gift.id}>


<td>{gift.id}</td>



<td
onClick={()=>editField(gift,"name")}
style={cellClickable}
>
{gift.name}
</td>




<td
onClick={()=>editField(gift,"chance")}
style={cellClickable}
>
{gift.chance}%
</td>




<td
onClick={()=>editField(gift,"quantity")}
style={cellClickable}
>
{gift.quantity}
</td>




<td>

<button
style={{
background:"transparent",
border:0,
cursor:"pointer",
color:
gift.active
?
"var(--neon)"
:
"#ff6666"
}}
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

</td>




<td>


<button

style={deleteBtn}

onClick={()=>removeGift(gift.id)}

>

Удалить

</button>


</td>



</tr>


))
}


</tbody>


</table>


</div>


}



</div>

);


}




const card:React.CSSProperties={

background:"var(--panel)",
border:"1px solid var(--line-dim)",
borderRadius:16,
padding:20,
marginBottom:20

};



const input:React.CSSProperties={

display:"block",
width:"100%",
padding:12,
marginBottom:12,
borderRadius:10,
border:"1px solid var(--line-dim)",
background:"transparent",
color:"var(--ink)"

};



const button:React.CSSProperties={

background:"var(--neon)",
border:0,
padding:"10px 18px",
borderRadius:10,
cursor:"pointer",
fontWeight:700

};



const deleteBtn:React.CSSProperties={

background:"rgba(255,80,80,.15)",
border:"1px solid rgba(255,80,80,.3)",
color:"#ff6b6b",
padding:"7px 12px",
borderRadius:8,
cursor:"pointer"

};



const cellClickable:React.CSSProperties={

padding:14,
cursor:"pointer"

};