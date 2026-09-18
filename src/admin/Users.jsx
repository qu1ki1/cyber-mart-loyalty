import {useEffect,useState} from "react";
import {supabase} from "../supabase";


export default function Users(){


const [users,setUsers]=useState([]);



useEffect(()=>{

load();

},[]);



async function load(){

const {data}=await supabase
.from("users")
.select("*")
.order("id",{ascending:false});


setUsers(data || []);

}



return (

<div>

<h1>
👥 Пользователи
</h1>


{
users.map(user=>(

<div key={user.id}
style={{
border:"1px solid #444",
padding:15,
margin:10,
borderRadius:10
}}
>

<b>
{user.first_name}
</b>

<br/>

@{user.username}

<br/>

Попыток:
{user.attempts}


</div>


))
}


</div>

)

}