import { supabase } from "./supabase";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Admin from "./Admin";
import "./App.css";


type IconKey =
  | "clock"
  | "clockBig"
  | "cup"
  | "percent"
  | "star";


type Reward = {
  id:string;
  name:string;
  weight:number;
  icon:IconKey;
  prefix:string;
};



const REWARDS:Reward[] = [

{
id:"r30",
name:"+30 минут игры",
weight:40,
icon:"clock",
prefix:"CM30"
},

{
id:"r60",
name:"+1 час игры",
weight:20,
icon:"clockBig",
prefix:"CM60"
},

{
id:"drink",
name:"Бесплатный напиток",
weight:20,
icon:"cup",
prefix:"CMDR"
},

{
id:"discount",
name:"Скидка 10%",
weight:15,
icon:"percent",
prefix:"CMDS"
},

{
id:"jackpot",
name:"Джекпот: 3 часа игры",
weight:5,
icon:"star",
prefix:"CMJP"
}

];



function pickReward(){

const total =
REWARDS.reduce(
(sum,r)=>sum+r.weight,
0
);


let random =
Math.random()*total;


for(const r of REWARDS){

if(random < r.weight)
return r;


random-=r.weight;

}


return REWARDS[0];

}



function genCode(prefix:string){

return `${prefix}-${Math.floor(
1000+Math.random()*9000
)}`;

}



export default function App(){



const path =
window.location.pathname;



const [screen,setScreen] =
useState<"idle"|"result">("idle");


const [result,setResult] =
useState<Reward|null>(null);


const [code,setCode] =
useState("");


const [loading,setLoading] =
useState(false);


const [telegramId,setTelegramId] =
useState<number|null>(null);


const [firstName,setFirstName] =
useState("");



const busy =
useRef(false);



useEffect(()=>{


const tg =
window.Telegram?.WebApp;


if(!tg)
return;



tg.ready();

tg.expand();



const user =
tg.initDataUnsafe?.user;



if(user){


setTelegramId(user.id);

setFirstName(user.first_name);



supabase
.from("users")
.upsert({

telegram_id:user.id,

first_name:user.first_name,

username:user.username ?? null

});

}


},[]);





async function openCase(){


if(busy.current)
return;



if(!telegramId){

alert(
"Откройте приложение через Telegram"
);

return;

}



busy.current=true;

setLoading(true);



try{


const reward =
pickReward();



const giftCode =
genCode(
reward.prefix
);



await supabase
.from("winners")
.insert({

telegram_id:telegramId,

gift_id:reward.id,

gift_name:reward.name,

code:giftCode

});



setResult(reward);

setCode(giftCode);

setScreen("result");



}
catch(e){

console.error(e);

alert(
"Ошибка открытия кейса"
);

}

finally{

setLoading(false);

busy.current=false;

}



}




// АДМИНКА

if(path.startsWith("/admin")){

return <Admin/>;

}





return (

<div className="app">


<header>

<div className="wordmark">

CYBER<span>MART</span>

</div>


<div>

{firstName}

</div>


</header>




<main>


<AnimatePresence mode="wait">


{
screen==="idle" &&

<motion.section
initial={{opacity:0}}
animate={{opacity:1}}
>


<h1>

Твой подарок за визит

</h1>



<button

className="cta"

onClick={openCase}

disabled={loading}

>

{

loading
?
"Открываем..."
:
"Открыть кейс"

}


</button>


</motion.section>

}




{
screen==="result" && result &&


<motion.section

initial={{
scale:.8,
opacity:0
}}

animate={{
scale:1,
opacity:1
}}

>


<h1>

🎁 {result.name}

</h1>


<p>

Твой код:

<br/>

<b>

{code}

</b>

</p>



<button

className="ghost"

onClick={()=>setScreen("idle")}

>

Назад

</button>



</motion.section>


}



</AnimatePresence>


</main>




<footer>

CYBER MART LOYALTY

</footer>



</div>


)

}