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





const items=[


{
url:"/admin",
name:"HOME",
icon:<LayoutDashboard/>
},


{
url:"/admin/users",
name:"USERS",
icon:<Users/>
},


{
url:"/admin/gifts",
name:"GIFTS",
icon:<Gift/>
},


{
url:"/admin/winners",
name:"WINS",
icon:<Trophy/>
},


{
url:"/admin/settings",
name:"SETTINGS",
icon:<Settings/>
}


];






return (

<div className="admin-header">





<div className="admin-logo">


CYBER

<span>
MART
</span>


<div>

ADMIN

</div>


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



{item.icon}


<span>

{item.name}

</span>


</a>


))

}


</nav>








<style>{`

.admin-header{


display:flex;


align-items:center;


justify-content:space-between;


padding:16px;


background:

rgba(255,255,255,.03);



border:

1px solid var(--line);



border-radius:20px;



backdrop-filter:

blur(20px);



}



.admin-logo{


font-family:Rajdhani;


font-size:25px;


font-weight:800;


letter-spacing:.15em;


}



.admin-logo span{


color:var(--neon);


}



.admin-logo div{


font-family:Inter;


font-size:10px;


letter-spacing:.3em;


color:var(--muted);


margin-top:5px;


}





nav{


display:flex;


gap:8px;


}



nav a{


width:80px;


height:65px;



display:flex;


flex-direction:column;


align-items:center;


justify-content:center;



gap:6px;



border-radius:14px;



color:var(--muted);



text-decoration:none;



border:

1px solid transparent;



transition:.25s;


}



nav svg{


width:20px;


height:20px;


}




nav span{


font-size:10px;


letter-spacing:.1em;


}





nav a:hover{


transform:

translateY(-3px);


color:white;


}




nav a.active{


color:var(--neon);



background:

rgba(57,255,138,.08);



border-color:

var(--line);



box-shadow:


0 0 25px rgba(57,255,138,.25);


}





@media(max-width:700px){


.admin-header{


flex-direction:column;


gap:15px;


}



nav{


width:100%;


justify-content:space-between;


}



nav a{


width:55px;


height:55px;


}



nav span{


display:none;


}



}



`}</style>





</div>


)

}