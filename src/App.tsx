import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { supabase } from "./supabase";



type Gift = {

id:number;

name:string;

chance:number;

quantity:number;

};





function randomGift(gifts:Gift[]){


const total =
gifts.reduce(
(sum,g)=>sum+g.chance,
0
);



let value =
Math.random()*total;



for(const gift of gifts){


value-=gift.chance;


if(value<=0)
return gift;


}



return gifts[0];

}





function generateCode(){

return (

"CM-" +

Math.floor(
1000+
Math.random()*9000
)

);

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

telegram_id:tgUser.id,

first_name:tgUser.first_name,

username:tgUser.username

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



if(!data?.length)
throw new Error();




const win =
randomGift(data);



await supabase

.from("gifts")

.update({

quantity:
win.quantity-1

})

.eq(
"id",
win.id
);




await supabase

.from("winners")

.insert({

telegram_id:user?.id,

gift_id:win.id,

gift_name:win.name

});





setTimeout(()=>{


setGift(win);

setCode(generateCode());

setOpening(false);


},2000);



}

catch(e){

console.log(e);

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
padding:"30px 20px"
}}

>


<div

className="logo"

style={{
fontSize:32,
fontWeight:800,
letterSpacing:4
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

!gift &&


<motion.div

key="case"

className="cyber-card"

initial={{
opacity:0,
scale:.9
}}

animate={{
opacity:1,
scale:1
}}



>


<h1
style={{
textAlign:"center",
fontFamily:"Rajdhani"
}}
>

Твой подарок за визит

</h1>





<motion.div

animate={

opening

?

{

rotate:[0,-5,5,-5,0],

scale:[1,1.05,1]

}

:

{

y:[0,-10,0]

}

}

transition={{

duration:1,

repeat:opening?Infinity:0

}}

style={{

fontSize:120,

textAlign:"center",

margin:"40px 0"

}}

>

🎁

</motion.div>





<button

className="cyber-button"

onClick={openCase}

disabled={opening}

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

gift &&


<motion.div

key="win"

className="cyber-card"


initial={{

scale:.5,

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

🎉 Поздравляем!

</h1>



<div

style={{

fontSize:70,

textAlign:"center"

}}

>

🎁

</div>



<h2

style={{

textAlign:"center",

fontFamily:"Rajdhani"

}}

>

{gift.name}

</h2>



<div

style={{

textAlign:"center",

padding:15,

borderRadius:14,

background:"rgba(57,255,138,.08)"

}}

>

Ваш код:

<br/>

<strong

style={{

fontSize:28,

color:"var(--neon)"

}}

>

{code}

</strong>


</div>



<button

className="cyber-button"

style={{
marginTop:20
}}

onClick={()=>setGift(null)}

>

Назад

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
padding:30,
color:"var(--muted)"
}}

>

CYBER MART LOYALTY

</footer>



</div>


)

}