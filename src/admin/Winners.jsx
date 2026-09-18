import {useEffect,useState} from "react"
import {supabase} from "../supabase"


export default function Winners(){


const [winners,setWinners]=useState([])



async function load(){


const {data,error}=await supabase
.from("winners")
.select("*")
.order("id",{ascending:false})


if(error){
console.log(error)
return
}


setWinners(data)


}



useEffect(()=>{

load()

},[])



return (

<div>

<h1>
🏆 История побед
</h1>


{

winners.map(w=>(


<div
key={w.id}
style={{
border:"1px solid #444",
padding:15,
margin:10,
borderRadius:10
}}
>


<p>
👤 @{w.username}
</p>


<p>
🎁 {w.gift_name}
</p>


<p>
📅 {w.created_at}
</p>


</div>


))

}


</div>

)


}