import {
  LayoutDashboard,
  Users,
  Gift,
  Trophy,
  Settings
} from "lucide-react";



export default function AdminMenu(){


const path =
window.location.pathname;



const tabs=[

{
url:"/admin",
title:"Главная",
icon:<LayoutDashboard size={20}/>
},


{
url:"/admin/users",
title:"Пользователи",
icon:<Users size={20}/>
},


{
url:"/admin/gifts",
title:"Призы",
icon:<Gift size={20}/>
},


{
url:"/admin/winners",
title:"Победы",
icon:<Trophy size={20}/>
},


{
url:"/admin/settings",
title:"Настройки",
icon:<Settings size={20}/>
}

];





return (

<header className="admin-menu">


<div className="admin-brand">


<div className="brand-main">

CYBER

<span>
MART
</span>

</div>


<div className="brand-sub">

ADMIN PANEL

</div>


</div>





<nav>


{
tabs.map(tab=>(


<a

key={tab.url}

href={tab.url}

className={

path===tab.url

?

"active"

:

""

}

>


<div className="tab-icon">

{tab.icon}

</div>



<div className="tab-title">

{tab.title}

</div>


</a>


))

}


</nav>






<style>{`

.admin-menu{


position:relative;


display:flex;


align-items:center;


justify-content:space-between;


padding:16px 22px;



background:

rgba(10,12,12,.75);



border:

1px solid var(--line-dim);



border-radius:24px;



backdrop-filter:

blur(20px);



margin-bottom:20px;


}




.brand-main{


font-family:Rajdhani;


font-weight:900;


font-size:26px;


letter-spacing:5px;


}



.brand-main span{


color:var(--neon);


}




.brand-sub{


font-size:10px;


letter-spacing:4px;


color:var(--muted);


margin-top:4px;


}




.admin-menu nav{


display:flex;


gap:8px;


}




.admin-menu a{


width:72px;


height:62px;



display:flex;


flex-direction:column;


justify-content:center;


align-items:center;



text-decoration:none;



color:var(--muted);



border-radius:16px;



border:

1px solid transparent;



transition:.25s;


}




.admin-menu a:hover{


transform:translateY(-3px);


color:white;


}




.admin-menu a.active{


color:var(--neon);



background:

rgba(57,255,138,.08);



border-color:

rgba(57,255,138,.35);



box-shadow:

0 0 30px rgba(57,255,138,.2);



}




.tab-title{


font-size:10px;


margin-top:5px;


text-align:center;


}





@media(max-width:700px){



.admin-menu{


flex-direction:column;


gap:15px;


padding:15px 10px;


}




.brand-main{


font-size:22px;


}




.admin-menu nav{


width:100%;


justify-content:space-around;


}



.admin-menu a{


width:58px;


height:55px;


}



.tab-title{


font-size:9px;


}



}



`}</style>



</header>

)

}