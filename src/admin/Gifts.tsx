import { useEffect, useState } from "react";
import {
  getGifts,
  createGift,
  updateGift,
  deleteGift,
  toggleGift,
  type Gift,
} from "./supabaseAdmin";


export default function Gifts() {

  const [gifts,setGifts] = useState<Gift[]>([]);
  const [loading,setLoading] = useState(true);


  const [showForm,setShowForm] = useState(false);


  const [form,setForm] = useState({
    name:"",
    chance:0,
    quantity:0,
    active:true
  });



  async function load(){

    setLoading(true);

    const data = await getGifts();

    setGifts(data);

    setLoading(false);
  }



  useEffect(()=>{

    load();

  },[]);





  async function addGift(){


    if(!form.name){
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





  async function removeGift(id:number){

    const ok = confirm(
      "Удалить подарок?"
    );


    if(!ok)return;


    await deleteGift(id);

    load();

  }





  async function changeActive(
    gift:Gift
  ){

    await toggleGift(
      gift.id,
      !gift.active
    );


    load();

  }





  async function editChance(
    gift:Gift
  ){

    const value = prompt(
      "Новый шанс (%)",
      String(gift.chance)
    );


    if(!value)return;


    await updateGift(
      gift.id,
      {
        chance:Number(value)
      }
    );


    load();

  }




return (

<div style={{
padding:"32px 40px",
maxWidth:1100
}}>


<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:28
}}>


<div>

<h1
style={{
fontFamily:"'Rajdhani',sans-serif",
fontSize:28,
color:"var(--ink)"
}}
>
🎁 Подарки
</h1>


<p style={{
color:"var(--muted)"
}}>
Управление призами и шансами
</p>


</div>



<button
onClick={()=>setShowForm(!showForm)}
style={buttonStyle}
>
+
Добавить
</button>



</div>





{
showForm && (

<div style={cardStyle}>


<input
placeholder="Название подарка"
value={form.name}
onChange={
e=>setForm({
...form,
name:e.target.value
})
}
/>


<input
type="number"
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
type="number"
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
onClick={addGift}
style={buttonStyle}
>
Сохранить
</button>



</div>

)

}




{
loading ?

<div>Загрузка...</div>


:

<div style={cardStyle}>


<table
style={{
width:"100%",
borderCollapse:"collapse"
}}
>


<thead>

<tr>

<th style={th}>ID</th>
<th style={th}>Название</th>
<th style={th}>Шанс</th>
<th style={th}>Количество</th>
<th style={th}>Статус</th>
<th style={th}>Действия</th>

</tr>


</thead>



<tbody>


{
gifts.map(gift=>(


<tr key={gift.id}>


<td style={td}>
{gift.id}
</td>


<td style={td}>
{gift.name}
</td>



<td
style={{
...td,
cursor:"pointer"
}}
onClick={()=>editChance(gift)}
>

<span style={{
color:"var(--neon)"
}}>
{gift.chance}%
</span>

</td>



<td style={td}>
{gift.quantity}
</td>




<td style={td}>


<button
onClick={()=>changeActive(gift)}
style={{
...statusStyle,
color:
gift.active
?
"var(--neon)"
:
"#ff6b6b"
}}
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




<td style={td}>


<button
onClick={()=>removeGift(gift.id)}
style={{
...dangerButton
}}
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







const th:React.CSSProperties={
padding:"14px",
textAlign:"left",
color:"var(--muted)"
};



const td:React.CSSProperties={
padding:"14px",
borderBottom:"1px solid var(--line-dim)"
};



const cardStyle:React.CSSProperties={

background:"var(--panel)",

border:"1px solid var(--line-dim)",

borderRadius:16,

padding:20,

marginBottom:20

};



const buttonStyle:React.CSSProperties={

background:"var(--neon)",

border:"none",

padding:"10px 18px",

borderRadius:10,

cursor:"pointer",

fontWeight:600

};



const dangerButton:React.CSSProperties={

background:"rgba(255,80,80,.15)",

border:"1px solid rgba(255,80,80,.3)",

color:"#ff6b6b",

padding:"6px 12px",

borderRadius:8,

cursor:"pointer"

};



const statusStyle:React.CSSProperties={

background:"transparent",

border:"none",

cursor:"pointer",

fontWeight:600

};