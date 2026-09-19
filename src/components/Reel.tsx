import { motion } from "framer-motion";


type ReelItem = {
  name:string;
  rarity:string;
};



const ITEMS:ReelItem[] = [

{
name:"+30 MIN",
rarity:"common"
},

{
name:"DRINK",
rarity:"rare"
},

{
name:"+1 HOUR",
rarity:"rare"
},

{
name:"10%",
rarity:"epic"
},

{
name:"JACKPOT",
rarity:"legendary"
},

{
name:"+30 MIN",
rarity:"common"
},

{
name:"BONUS",
rarity:"epic"
},

{
name:"3 HOURS",
rarity:"legendary"
},

{
name:"DRINK",
rarity:"rare"
}

];



export default function Reel(){


return (

<div className="reel-container">


<div className="reel-marker"/>


<div className="reel-fade left"/>

<div className="reel-fade right"/>



<motion.div

className="reel-track"

initial={{
x:0
}}

animate={{
x:-720
}}

transition={{

duration:3.5,

ease:[0.12,0.8,0.2,1]

}}

>


{

ITEMS.map((item,index)=>(


<div

key={index}

className={`reel-item ${item.rarity}`}

>

{item.name}

</div>


))

}



</motion.div>





<style>{`

.reel-container{


position:relative;

height:120px;

width:100%;


overflow:hidden;


border-radius:18px;


border:

1px solid rgba(57,255,138,.25);


background:

rgba(255,255,255,.03);



}



.reel-track{


height:100%;


display:flex;


align-items:center;


gap:12px;


padding-left:40px;


}



.reel-item{


min-width:100px;


height:90px;


display:flex;


align-items:center;


justify-content:center;



border-radius:16px;


font-family:Rajdhani;


font-size:18px;


font-weight:700;



background:

rgba(0,0,0,.45);



border:

1px solid currentColor;



}



.common{

color:#9aa;


}



.rare{


color:#39ff8a;


box-shadow:

0 0 25px rgba(57,255,138,.3);


}



.epic{


color:#c86bff;


}



.legendary{


color:#ffd15c;


box-shadow:

0 0 35px rgba(255,209,92,.4);


}




.reel-marker{


position:absolute;


z-index:5;


left:50%;


top:0;


bottom:0;


width:3px;


transform:translateX(-50%);



background:#3ce6ff;


box-shadow:

0 0 20px #3ce6ff;


}



.reel-fade{


position:absolute;


top:0;


bottom:0;


width:80px;


z-index:4;


}



.left{


left:0;


background:

linear-gradient(
90deg,
#050607,
transparent
);


}



.right{


right:0;


background:

linear-gradient(
270deg,
#050607,
transparent
);


}


`}</style>


</div>


)

}