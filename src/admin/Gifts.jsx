import {useEffect,useState} from "react"
import {supabase} from "../supabase"


export default function Gifts(){

const [gifts,setGifts]=useState([])

const [name,setName]=useState("")
const [chance,setChance]=useState("")


async function load(){

const {data}=await supabase
.from("gifts")
.select("*")
.order("id")

setGifts(data || [])

}


useEffect(()=>{

load()

},[])



async function addGift(){

if(!name)return


await supabase
.from("gifts")
.insert({
name,
chance:Number(chance)
})


setName("")
setChance("")

load()

}



return (

<div>


<h1>
🎁 Управление подарками
</h1>


<div style={{
padding:20,
border:"1px solid #333",
borderRadius:15
}}>


<h3>
Добавить подарок
</h3>


<input
placeholder="Название"
value={name}
onChange={e=>setName(e.target.value)}
/>


<input
placeholder="Шанс %"
value={chance}
onChange={e=>setChance(e.target.value)}
/>


<button onClick={addGift}>
Добавить
</button>


</div>



<h2>
Список подарков
</h2>



{
gifts.map(g=>(

<div
key={g.id}
style={{
padding:15,
margin:10,
border:"1px solid #555",
borderRadius:10
}}
>


🎁 {g.name}

<br/>

Шанс:
{g.chance}%


<br/>

{
g.active 
?"✅ Активен"
:"❌ Выключен"
}


</div>

))
}



</div>

)

}