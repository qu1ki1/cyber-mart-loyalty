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
rotate:[0,-8,8,-5,0],
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
duration:.7,
repeat:Infinity
}

:

{
duration:4,
repeat:Infinity
}

}

style={{

width:160,
height:160,
borderRadius:20,

background:
"linear-gradient(160deg,#15251b,#050807)",

border:
"1px solid rgba(57,255,138,.35)",

display:"flex",

alignItems:"center",

justifyContent:"center",

position:"relative",

boxShadow:
"0 0 50px rgba(57,255,138,.25)"

}}

>


<svg

width="70"

height="70"

viewBox="0 0 24 24"

fill="none"

>

<path

d="M12 2L21 7V17L12 22L3 17V7L12 2Z"

stroke="#39ff8a"

strokeWidth="1.6"

/>


<path

d="M12 2V22M3 7L12 12L21 7"

stroke="#39ff8a"

strokeWidth="1.6"

/>


</svg>




<div

style={{

position:"absolute",

inset:0,

borderRadius:20,

background:

"linear-gradient(120deg,transparent,rgba(255,255,255,.15),transparent)",

animation:"shine 3s infinite"

}}

/>


<style>{`

@keyframes shine{

0%{

transform:translateX(-100%);

}

100%{

transform:translateX(100%);

}

}

`}</style>


</motion.div>


)

}