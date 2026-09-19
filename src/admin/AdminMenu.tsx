export default function AdminMenu(){


const path =
window.location.pathname;



const tabs=[

{
url:"/admin",
icon:"📊",
name:"Главная"
},

{
url:"/admin/users",
icon:"👥",
name:"Люди"
},

{
url:"/admin/gifts",
icon:"🎁",
name:"Призы"
},

{
url:"/admin/winners",
icon:"🏆",
name:"Победы"
},

{
url:"/admin/settings",
icon:"⚙️",
name:"Настройки"
}

];




return (

<header

className="admin-top"

>


<div className="admin-logo">


CYBER

<span>
MART
</span>


<small>
ADMIN
</small>


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


<div className="tab-name">

{tab.name}

</div>


</a>


))
}


</nav>



<style>{`

.admin-top{


display:flex;

align-items:center;

justify-content:space-between;


padding:15px 20px;


background:

rgba(255,255,255,.035);


border:

1px solid var(--line-dim);


border-radius:22px;


backdrop-filter:

blur(20px);


margin-bottom:20px;


}



.admin-logo{


font-family:Rajdhani;


font-size:24px;


font-weight:800;


letter-spacing:.12em;


}



.admin-logo span{


color:var(--neon);


}



.admin-logo small{


display:block;


font-family:Inter;


font-size:10px;


letter-spacing:.4em;


color:var(--muted);


}




.admin-top nav{


display:flex;


gap:8px;


}



.admin-top a{


width:65px;


height:60px;


display:flex;


flex-direction:column;


justify-content:center;


align-items:center;


text-decoration:none;


border-radius:16px;


color:var(--muted);


transition:.25s;


border:

1px solid transparent;


}



.admin-top a:hover{


transform:translateY(-3px);


}



.admin-top a.active{


color:var(--cyan);


background:

rgba(57,217,255,.08);


border-color:

rgba(57,217,255,.35);


box-shadow:

0 0 25px rgba(57,217,255,.18);


}




.tab-icon{

font-size:23px;

}



.tab-name{

font-size:9px;

margin-top:4px;

}




@media(max-width:700px){


.admin-top{


flex-direction:column;


gap:15px;


}


.admin-logo{


font-size:20px;


}


.admin-top nav{


width:100%;


justify-content:space-around;


}



.admin-top a{


width:55px;


height:50px;


}


}


`}</style>


</header>

)

}