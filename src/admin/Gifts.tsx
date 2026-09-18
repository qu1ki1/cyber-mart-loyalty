import { useEffect,useState } from "react";
import { supabase } from "../supabase";


type Gift = {
 id:number;
 name:string;
 chance:number;
 quantity:number;
 active:boolean;
};



export default function Gifts(){


const [gifts,setGifts] = useState<Gift[]>([]);


const [name,setName]=useState("");
const [chance,setChance]=useState(0);
const [quantity,setQuantity]=useState(0);



async function load(){

const {data}=await supabase
.from("gifts")
.select("*")
.order("id");


setGifts((data || []) as Gift[]);

}



useEffect(()=>{

load();

},[]);



async function addGift(){


await supabase
.from("gifts")
.insert({

name,
chance,
quantity,
active:true

});


setName("");
setChance(0);
setQuantity(0);


load();


}



async function remove(id:number){


await supabase
.from("gifts")
.delete()
.eq("id",id);


load();


}



return (

<div>


<h1>
🎁 Подарки
</h1>


<input
placeholder="Название"
value={name}
onChange={e=>setName(e.target.value)}
/>


<input
type="number"
placeholder="Шанс"
value={chance}
onChange={e=>setChance(Number(e.target.value))}
 />


<input
type="number"
placeholder="Количество"
value={quantity}
onChange={e=>setQuantity(Number(e.target.value))}
 />


<button onClick={addGift}>
Добавить
</button>



<h2>
Список
</h2>



{
gifts.map(g=>(

<div key={g.id}>

<b>{g.name}</b>

<p>
Шанс: {g.chance}%
</p>

<p>
Количество: {g.quantity}
</p>


<button onClick={()=>remove(g.id)}>
Удалить
</button>


</div>


))
}



</div>

)


}