import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { supabase } from "./supabase";

import CaseBox from "./components/CaseBox";
import Reel from "./components/Reel";
import RewardResult from "./components/RewardResult";



type Gift = {

id:number;

name:string;

chance:number;

quantity:number;

active:boolean;

};



function generateCode(){

return (

"CM-" +

Math.floor(
1000 + Math.random()*9000
)

);

}



function chooseGift(gifts:Gift[]){


const total =
gifts.reduce(
(sum,g)=>sum+g.chance,
0
);



let random =
Math.random()*total;



for(const gift of gifts){


random -= gift.chance;


if(random<=0){

return gift;

}


}



return gifts[0];

}





export default function App(){



const [user,setUser]=
useState<any>(null);



const [opening,setOpening]=
useState(false);



const [gift,setGift]=
useState<Gift|null>(null);



const [code,setCode]=
useState("");



const lock =
useRef(false);






useEffect(()=>{


const tg =
window.Telegram?.WebApp;


if(!tg)
return;



tg.ready();

tg.expand();



const tgUser =
tg.initDataUnsafe?.user;



if(tgUser){


setUser(tgUser);



supabase

.from("users")

.upsert({

telegram_id:
tgUser.id,

first_name:
tgUser.first_name,

username:
tgUser.username

});


}



},[]);







async function openCase(){



if(lock.current)
return;



lock.current=true;



setOpening(true);

setGift(null);




try{


const {data,error}=

await supabase

.from("gifts")

.select("*")

.eq("active",true)

.gt("quantity",0);



if(error)
throw error;



if(!data || data.length===0)
throw new Error();



const winner =
chooseGift(data);




await supabase

.from("gifts")

.update({

quantity:
winner.quantity-1

})

.eq(
"id",
winner.id
);




await supabase

.from("winners")

.insert({

telegram_id:
user?.id,

gift_id:
winner.id,

gift_name:
winner.name

});





setTimeout(()=>{


setGift(winner);

setCode(
generateCode()
);


setOpening(false);


},3000);



}

catch(e){

console.error(e);

setOpening(false);

}



lock.current=false;



}







return (

<div className="app">


<div className="cyber-bg"/>

<div className="cyber-glow"/>




<header

style={{

position:"relative",

zIndex:2,

textAlign:"center",

padding:"35px 20px"

}}

>


<div

style={{

fontFamily:"Rajdhani",

fontSize:34,

fontWeight:900,

letterSpacing:6

}}

>

CYBER

<span

style={{

color:"var(--neon)"

}}

>

 MART

</span>


</div>



<div

style={{

color:"var(--muted)",

marginTop:10

}}

>

{user?.first_name || "PLAYER"}

</div>



</header>







<main

style={{

position:"relative",

zIndex:2,

padding:"0 20px"

}}

>



<AnimatePresence mode="wait">



{

!gift &&

<motion.div

key="open"

className="cyber-card"

initial={{

opacity:0,

y:30

}}

animate={{

opacity:1,

y:0

}}

>



<h1

style={{

textAlign:"center",

fontFamily:"Rajdhani",

fontSize:32

}}

>

Твой подарок за визит

</h1>




<div

style={{

display:"flex",

justifyContent:"center",

margin:"35px 0"

}}

>


<CaseBox

opening={opening}

/>


</div>





{

opening &&

<Reel/>

}





<button

className="cyber-button"

style={{

width:"100%",

marginTop:25

}}

disabled={opening}

onClick={openCase}

>

{

opening

?

"ОТКРЫТИЕ..."

:

"ОТКРЫТЬ КЕЙС"

}


</button>



</motion.div>

}




{

gift &&


<motion.div

key="result"

initial={{

opacity:0,

scale:.8

}}

animate={{

opacity:1,

scale:1

}}

>


<RewardResult

gift={gift.name}

code={code}

/>



</motion.div>


}





</AnimatePresence>



</main>




<footer

style={{

position:"relative",

zIndex:2,

textAlign:"center",

padding:30,

color:"var(--muted)"

}}

>

CYBER MART LOYALTY

</footer>



</div>

)

}