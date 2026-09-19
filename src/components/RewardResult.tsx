export default function RewardResult({

gift,
code

}:{

gift:string;

code:string;

}){


return (

<div

className="cyber-card"

style={{

textAlign:"center"

}}

>


<div

style={{

fontSize:50,

marginBottom:20

}}

>

★


</div>



<h1>

Поздравляем

</h1>



<h2

style={{

color:"var(--neon)",

fontFamily:"Rajdhani",

fontSize:32

}}

>

{gift}

</h2>



<div

style={{

marginTop:20,

padding:15,

borderRadius:14,

background:"rgba(57,255,138,.08)"

}}

>


Код бонуса


<br/>


<strong

style={{

fontSize:28,

color:"#39ff8a"

}}

>

{code}

</strong>


</div>



</div>


)

}