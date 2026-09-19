import { motion } from "framer-motion";


export default function CaseBox({

opening

}:{

opening:boolean

}){


return (

<motion.div


animate={

opening

?

{

rotate:[0,-7,7,-4,0],

scale:[1,1.08,1]

}

:

{

y:[0,-10,0]

}

}


transition={

opening

?

{

duration:.8,

repeat:Infinity

}

:

{

duration:4,

repeat:Infinity,

ease:"easeInOut"

}

}



className="case-thumb"

>



<div className="case-top"/>



<div className="case-front">



<svg

viewBox="0 0 100 100"

fill="none"

>


<path

d="M20 35L50 18L80 35V70L50 86L20 70V35Z"

stroke="currentColor"

strokeWidth="3"

/>



<path

d="M50 18V86"

stroke="currentColor"

strokeWidth="3"

/>



<path

d="M20 35L50 52L80 35"

stroke="currentColor"

strokeWidth="3"

/>



<rect

x="42"

y="42"

width="16"

height="18"

rx="3"

stroke="currentColor"

strokeWidth="3"

/>



</svg>



</div>





<div className="case-light"/>





<style>{`

.case-thumb{


position:relative;


width:160px;


height:160px;


perspective:700px;


}





.case-top{


position:absolute;


inset:0;


border-radius:22px;


background:


linear-gradient(

145deg,

rgba(57,255,138,.25),

transparent

);



filter:blur(20px);


}





.case-front{


position:absolute;


inset:0;


display:flex;


align-items:center;


justify-content:center;



background:


linear-gradient(

145deg,

#17231c,

#050807

);



border:

1px solid rgba(57,255,138,.5);



border-radius:22px;



box-shadow:


inset 0 0 40px rgba(57,255,138,.12),


0 0 50px rgba(57,255,138,.25);



overflow:hidden;


}





.case-front svg{


width:85px;


height:85px;


color:var(--neon);


filter:

drop-shadow(

0 0 15px var(--neon)

);


}





.case-light{


position:absolute;


left:10%;


right:10%;


bottom:-10px;


height:15px;


background:

var(--neon);



filter:

blur(18px);



opacity:.7;


}





`}</style>



</motion.div>

)

}