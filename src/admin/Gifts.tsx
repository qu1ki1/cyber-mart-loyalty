import { useEffect, useState } from "react"
import { supabase } from "../supabase"


export default function Gifts(){


const [gifts,setGifts]=useState([])

const [name,setName]=useState("")
const [chance,setChance]=useState("")
const [quantity,setQuantity]=useState("")



async function load(){

const {data,error}=await supabase
.from("gifts")
.select("*")
.order("id")


if(error){
console.log(error)
return
}


setGifts(data)

}




async function addGift(){


const {error}=await supabase
.from("gifts")
.insert({

name,
chance:Number(chance),
quantity:Number(quantity),
active:true

})


if(error){

console.log(error)
alert(error.message)
return

}


setName("")
setChance("")
setQuantity("")

load()

}




async function toggleGift(id,status){


await supabase
.from("gifts")
.update({
active:!status
})
.eq("id",id)


load()

}




async function removeGift(id){


await supabase
.from("gifts")
.delete()
.eq("id",id)


load()

}




useEffect(()=>{

load()

},[])




return (

<div>


<h1>
🎁 Управление подарками
</h1>



<div style={{
background:"#111",
padding:25,
borderRadius:15,
marginBottom:30
}}>


<h2>
Добавить подарок
</h2>


<input
placeholder="Название"
value={name}
onChange={e=>setName(e.target.value)}
/>


<input
placeholder="Шанс %"
type="number"
value={chance}
onChange={e=>setChance(e.target.value)}
/>


<input
placeholder="Количество"
type="number"
value={quantity}
onChange={e=>setQuantity(e.target.value)}
/>



<button onClick={addGift}>
➕ Добавить
</button>


</div>




<h2>
Список подарков
</h2>



<div style={{
display:"grid",
gap:20
}}>


{

gifts.map(g=>(


<div
key={g.id}
style={{
border:"1px solid #444",
padding:20,
borderRadius:15
}}
>


<h2>
🎁 {g.name}
</h2>


<p>
🎯 Шанс: {g.chance}%
</p>


<p>
📦 Осталось: {g.quantity}
</p>


<p>
{
g.active
?
"🟢 Активен"
:
"🔴 Выключен"
}
</p>



<button
onClick={()=>toggleGift(g.id,g.active)}
>

{
g.active
?
"Выключить"
:
"Включить"
}

</button>



<button
style={{
marginLeft:10
}}
onClick={()=>removeGift(g.id)}
>

🗑 Удалить

</button>



</div>


))

}


</div>



</div>


)

}