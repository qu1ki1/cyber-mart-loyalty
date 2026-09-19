import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { supabase } from "./supabase";

import "./styles/cyber.css";



type Gift = {

id:number;

name:string;

chance:number;

quantity:number;

active:boolean;

};



export default function App(){


const [user,setUser] =
useState<any>(null);



const [loading,setLoading]=
useState(false);



const [opening,setOpening]=
useState(false);



const [result,setResult]=
useState<Gift|null>(null);



const busy =
useRef(false);





useEffect(()=>{


const tg =
window.Telegram?.WebApp;



if(!tg)
return;



tg.ready();

tg.expand();



const telegramUser =
tg.initDataUnsafe?.user;



if(telegramUser){


setUser(telegramUser);



supabase
.from("users")
.upsert({

telegram_id:
telegramUser.id,


first_name:
telegramUser.first_name,


username:
telegramUser.username


});


}



},[]);







async function openCase(){


if(busy.current)
return;



busy.current=true;



setLoading(true);

setOpening(true);

setResult(null);



try{


const {data:gifts,error}=

await supabase
.from("gifts")
.select("*")
.eq("active",true)
.gt("quantity",0);



if(error)
throw error;



if(!gifts || gifts.length===0)
throw new Error("Нет подарков");




const total =
gifts.reduce(

(sum,g)=>
sum+g.chance,

0

);




let random =
Math.random()*total;



let winner =
gifts[0];



for(const gift of gifts){


random -= gift.chance;



if(random<=0){

winner=gift;

break;

}


}





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


setResult(winner);


setOpening(false);


},1800);



}


catch(e){

console.error(e);

setOpening(false);

alert("Ошибка открытия");


}


finally{

setLoading(false);

busy.current=false;

}


}







return (

<div className="app">


<div className="cyber-bg"/>

<div className="cyber-glow"/>



<header
style={{
position:"relative",
zIndex:2,
padding:"25px",
textAlign:"center"
}}
>


<div
className="logo"
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



<p
style={{
color:"var(--muted)"
}}
>

Привет, {user?.first_name || "Игрок"}

</p>


</header>





<main
style={{
position:"relative",
zIndex:2,
padding:20
}}
>



<AnimatePresence mode="wait">


{

!result &&

<motion.div

key="case"

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
textAlign:"center"
}}
>

🎁 Твой подарок за визит

</h1>




<motion.div

className={
opening
?
"shake"
:
"float"
}

style={{

height:220,

display:"flex",

alignItems:"center",

justifyContent:"center",

fontSize:100

}}

>

🎁

</motion.div>




<button

className="cyber-button"

disabled={loading}

onClick={openCase}

>


{
opening

?

"Открываем..."

:

"Открыть кейс"

}


</button>



</motion.div>


}






{

result &&


<motion.div

key="result"

className="cyber-card"

initial={{
scale:.8,
opacity:0
}}

animate={{
scale:1,
opacity:1
}}

>


<h1
style={{
textAlign:"center",
color:"var(--neon)"
}}
>

🎉 Победа!

</h1>



<div
style={{
textAlign:"center",
fontSize:30
}}
>

🎁

</div>



<h2
style={{
textAlign:"center"
}}
>

{result.name}

</h2>



<p
style={{
textAlign:"center",
color:"var(--muted)"
}}
>

Покажите этот экран администратору

</p>




<button

className="cyber-button"

onClick={()=>setResult(null)}

>

Открыть ещё раз

</button>



</motion.div>


}



</AnimatePresence>



</main>




<footer
style={{
position:"relative",
zIndex:2,
textAlign:"center",
padding:20,
color:"var(--muted)"
}}
>

CYBER MART LOYALTY

</footer>



</div>

)

}