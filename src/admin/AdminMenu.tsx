export default function AdminMenu(){


const path = window.location.pathname;



const items = [

{
url:"/admin",
icon:"📊",
title:"Главная"
},

{
url:"/admin/users",
icon:"👥",
title:"Люди"
},

{
url:"/admin/gifts",
icon:"🎁",
title:"Призы"
},

{
url:"/admin/winners",
icon:"🏆",
title:"Победы"
},

{
url:"/admin/settings",
icon:"⚙️",
title:"Настройки"
}

];





return (

<header className="admin-top">


<div className="admin-brand">

CYBER <span>MART</span>

<small>
ADMIN PANEL
</small>

</div>




<nav>


{
items.map(item=>(


<a

key={item.url}

href={item.url}

className={
path===item.url
?
"active"
:
""
}

>


<div className="icon">

{item.icon}

</div>


<div className="label">

{item.title}

</div>


</a>


))

}



</nav>





<style>{`

.admin-top{


position:relative;

z-index:10;


display:flex;


align-items:center;


justify-content:space-between;



padding:14px 20px;



background:

rgba(255,255,255,.035);



border-bottom:

1px solid var(--line-dim);



backdrop-filter:

blur(18px);



}



.admin-brand{


font-family:Rajdhani,sans-serif;


font-size:22px;


font-weight:800;


letter-spacing:.12em;



}



.admin-brand span{


color:var(--neon);


}



.admin-brand small{


display:block;


font-family:Inter,sans-serif;


font-size:10px;


letter-spacing:.3em;


color:var(--muted);


margin-top:3px;


}




.admin-top nav{


display:flex;


gap:8px;


}




.admin-top nav a{


width:62px;


height:58px;



display:flex;


flex-direction:column;


align-items:center;


justify-content:center;



border-radius:16px;



text-decoration:none;



color:var(--muted);



border:

1px solid transparent;



transition:.25s;



}



.admin-top nav a:hover{


transform:translateY(-2px);


}




.admin-top nav a.active{


color:var(--neon);



background:

rgba(57,255,138,.08);



border-color:

var(--line);



box-shadow:

0 0 25px rgba(57,255,138,.18);



}



.icon{


font-size:22px;


line-height:22px;


}



.label{


font-size:10px;


margin-top:5px;


}





@media(max-width:600px){



.admin-top{


flex-direction:column;


gap:12px;


padding:12px 10px;


}




.admin-brand{


font-size:18px;


}



.admin-top nav{


width:100%;


justify-content:space-around;


gap:3px;


}



.admin-top nav a{


width:54px;


height:50px;


}



.label{


font-size:9px;


}



}




`}</style>



</header>

)

}