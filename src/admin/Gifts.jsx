import {useEffect,useState} from "react"
import {supabase} from "../supabase"


export default function Gifts(){

const [gifts,setGifts]=useState([])

const [name,setName]=useState("")
const [chance,setChance]=useState("")
const [quantity,setQuantity]=useState("")


async function loadGifts(){

const {data,error}=await supabase
.from("gifts")
.select("*")
.order("id")


if(!error){
setGifts(data)
}

}



useEffect(()=>{

loadGifts()

},[])




async function addGift(){

if(!name) return


await supabase
.from("gifts")
.insert({

name:name,

chance:Number(chance),

quantity:Number(quantity)

})


setName("")
setChance("")
setQuantity("")


loadGifts()

}





async function deleteGift(id){

await supabase
.from("gifts")
.delete()
.eq("id",id)


loadGifts()

}




async function toggleGift(id,status){

await supabase
.from("gifts")
.update({

active:!status

})
.eq("id",id)


loadGifts()

}





return (

<div>


<h1>
🎁 Управление подарками
</h1>



<div style={{
padding:20,
border:"1px solid #333",
borderRadius:15,
marginBottom:30
}}>


<h2>
➕ Добавить подарок
</h2>


<input

placeholder="Название"

value={name}

onChange={
e=>setName(e.target.value)
}

/>


<input

placeholder="Шанс %"

value={chance}

onChange={
e=>setChance(e.target.value)
}

/>


<input

placeholder="Количество"

value={quantity}

onChange={
e=>setQuantity(e.target.value)
}

/>



<button onClick={addGift}>

Добавить

</button>


</div>





<h2>
Все подарки
</h2>



<div style={{
display:"grid",
gap:15
}}>


{

gifts.map(g=>(


<div

key={g.id}

style={{

border:"1px solid #444",

borderRadius:15,

padding:20

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

onClick={()=>
toggleGift(g.id,g.active)
}

>

Изменить статус

</button>



<button

onClick={()=>
deleteGift(g.id)
}

>

Удалить

</button>



</div>


))


}


</div>



</div>


)


}