import { useEffect } from "react";
import { motion } from "framer-motion";


type Props = {

gift:string;

code:string;

rarity?:
"common"
|
"rare"
|
"epic"
|
"legendary";

onClose:()=>void;

};





const colors = {

common:"#9aa8b0",

rare:"#39ff8a",

epic:"#c86bff",

legendary:"#ffd15c"

};







export default function RewardResult({

gift,

code,

rarity="rare",

onClose

}:Props){



useEffect(()=>{


const tg =
window.Telegram?.WebApp;



if(tg?.HapticFeedback){

tg.HapticFeedback
.notificationOccurred(
"success"
);

}



},[]);








return (

<motion.div

className="reward-result"

initial={{

opacity:0,

scale:.7

}}

animate={{

opacity:1,

scale:1

}}

transition={{

type:"spring",

duration:.7

}}

>





<div className="particles">


{

Array.from({

length:20

}).map((_,i)=>(


<span

key={i}

style={{

transform:

`rotate(${i*18}deg) translateY(-120px)`

}}

/>


))


}



</div>







<div

className="reward-circle"

style={{

"--reward":

colors[rarity]

} as React.CSSProperties}

>


<div className="reward-star">

★

</div>



</div>






<div

className="rarity"

style={{

color:

colors[rarity],

borderColor:

colors[rarity]

}}

>

{rarity.toUpperCase()}

</div>







<h1>

CONGRATULATIONS

</h1>







<div className="reward-title">

{gift}

</div>








<div className="ticket">


<div>

BONUS CODE

</div>



<strong>

{code}

</strong>


</div>








<button

className="cta"

onClick={onClose}

>

CONTINUE

</button>








<style>{`

.reward-result{


position:relative;


text-align:center;


padding:30px;


overflow:hidden;


}





.reward-circle{


width:150px;


height:150px;


margin:auto;



border-radius:50%;



display:flex;


align-items:center;


justify-content:center;



border:

2px solid var(--reward);



box-shadow:

0 0 60px var(--reward);



background:

radial-gradient(

circle,

rgba(255,255,255,.15),

transparent 65%

);



}




.reward-star{


font-size:75px;


color:var(--reward);


filter:

drop-shadow(

0 0 15px var(--reward)

);


}





.rarity{


display:inline-block;


margin-top:25px;


padding:

7px 20px;


border-radius:50px;


border:

1px solid;


font-size:12px;


letter-spacing:.2em;


}





.reward-result h1{


font-family:Rajdhani;


font-size:30px;


margin-top:25px;


}





.reward-title{


font-family:Rajdhani;


font-size:38px;


font-weight:700;


color:var(--neon);


margin:20px 0;


}





.ticket{


background:

rgba(255,255,255,.04);



border:

1px dashed var(--line);



border-radius:18px;



padding:20px;


margin:25px auto;


max-width:320px;


}





.ticket strong{


display:block;


font-family:Rajdhani;


font-size:34px;


margin-top:10px;


color:white;


}





.particles span{


position:absolute;


left:50%;


top:50%;



width:8px;


height:20px;



background:var(--neon);


animation:

particle 2s forwards;



}





@keyframes particle{


to{


opacity:0;


transform:

translateY(150px)
rotate(360deg);


}


}



`}</style>





</motion.div>


)

}