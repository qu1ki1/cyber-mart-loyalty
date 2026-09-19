import { motion } from "framer-motion";


export default function Reel(){

const items=[
"30 MIN",
"DRINK",
"1 HOUR",
"10%",
"JACKPOT",
"30 MIN",
"DRINK"
];


return (

<div

style={{

width:"100%",
overflow:"hidden",

border:

"1px solid rgba(57,255,138,.2)",

borderRadius:18,

height:100,

background:
"rgba(255,255,255,.03)"

}}

>


<motion.div

animate={{

x:[0,-900]

}}

transition={{

duration:3,

ease:"easeOut"

}}

style={{

display:"flex",

gap:12,

padding:6

}}

>


{
items.map((x,i)=>(


<div

key={i}

style={{

minWidth:85,

height:85,

borderRadius:14,

display:"flex",

alignItems:"center",

justifyContent:"center",

fontFamily:"Rajdhani",

fontSize:14,


border:

"1px solid rgba(57,255,138,.3)",


color:"#39ff8a"


}}

>

{x}

</div>


))
}



</motion.div>


</div>


)

}