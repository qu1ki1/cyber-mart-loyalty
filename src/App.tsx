import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { supabase } from "./supabase";

import CaseBox from "./components/CaseBox";
import Reel from "./components/Reel";
import RewardResult from "./components/RewardResult";

import "./App.css";



type Gift = {

  id:number;

  name:string;

  chance:number;

  quantity:number;

  rarity?:
  "common"
  |
  "rare"
  |
  "epic"
  |
  "legendary";

};



type Screen =
"open"
|
"roll"
|
"result";






function generateCode(){

  return (

    "CM-" +

    Math.floor(
      1000 +
      Math.random() * 9000
    )

  );

}







function pickGift(gifts:Gift[]){


  const total = gifts.reduce(

    (sum,item)=>
      sum + item.chance,

    0

  );



  let random =
  Math.random()*total;



  for(const gift of gifts){


    random -= gift.chance;



    if(random <= 0){

      return gift;

    }


  }



  return gifts[0];

}









export default function App(){



const [screen,setScreen]=

useState<Screen>("open");



const [gift,setGift]=

useState<Gift|null>(null);



const [code,setCode]=

useState("");



const [user,setUser]=

useState<any>(null);



const opening=

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



if(opening.current)
return;



opening.current=true;



setScreen("roll");





try{


const {data,error}=

await supabase

.from("gifts")

.select("*")

.eq(
"active",
true
)

.gt(
"quantity",
0
);





if(error)
throw error;



if(!data || data.length===0)

throw new Error(
"No gifts"
);





const winner=

pickGift(data);







setTimeout(async()=>{



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

user?.id || null,


gift_id:

winner.id,


gift_name:

winner.name

});






setGift(winner);



setCode(
generateCode()
);



setScreen("result");





window.Telegram?.WebApp

?.HapticFeedback

?.notificationOccurred(
"success"
);




opening.current=false;



},3500);





}

catch(error){


console.log(error);



setScreen("open");

opening.current=false;



}



}









return (

<div className="app">



<div className="bg-grid"/>

<div className="bg-glow"/>





<header>


<div className="wordmark">

CYBER

<span>

MART

</span>


</div>



<div className="biz-pill">

LOYALTY

</div>


</header>






<main>


<AnimatePresence mode="wait">





{

screen==="open" &&


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

exit={{

opacity:0

}}

>


<CaseBox

opening={false}

/>





<h1>

Твой подарок

за визит

</h1>





<div className="status-pill ready">

AVAILABLE

</div>







<button

className="cta"

onClick={openCase}

>

ОТКРЫТЬ КЕЙС

</button>



</motion.div>


}









{

screen==="roll" &&


<motion.div

key="roll"

className="cyber-card"

initial={{

opacity:0

}}

animate={{

opacity:1

}}

>



<h1>

OPENING...

</h1>





<CaseBox

opening={true}

/>





<Reel/>





</motion.div>


}









{

screen==="result"

&&

gift

&&


<RewardResult

gift={gift.name}

code={code}

rarity={

gift.rarity || "rare"

}

onClose={()=>{


setGift(null);

setCode("");

setScreen("open");


}}


/>


}




</AnimatePresence>


</main>






<footer>

CYBER MART LOYALTY

</footer>





</div>

)

}