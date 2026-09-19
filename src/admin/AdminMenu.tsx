export default function AdminMenu(){


const path=window.location.pathname;



const item=(url:string,text:string)=>(
<a
href={url}
className={
path===url
?
"active"
:
""
}
>
{text}
</a>
)



return (

<header className="top">


<div className="title">

CYBER <span>MART</span>

</div>



<nav>


{item("/admin","📊")}

{item("/admin/users","👥")}

{item("/admin/gifts","🎁")}

{item("/admin/winners","🏆")}

{item("/admin/settings","⚙️")}


</nav>



<style>{`

.top{


height:90px;

background:#080808;

border-bottom:1px solid #123;

display:flex;

align-items:center;

justify-content:space-between;

padding:0 20px;

}



.title{

font-size:20px;

font-weight:800;

letter-spacing:3px;

}


.title span{

color:#39ff88;

}



nav{

display:flex;

gap:8px;

}



nav a{


width:45px;

height:45px;

display:flex;

align-items:center;

justify-content:center;


border-radius:12px;


text-decoration:none;

font-size:22px;


color:#778;


}



nav a.active{


background:#073019;

border:1px solid #39ff88;

color:#39ff88;


}




@media(max-width:600px){


.top{

height:80px;

flex-direction:column;

padding:10px;

gap:8px;

}



.title{

font-size:16px;

}



nav{

width:100%;

justify-content:space-around;

}



nav a{

width:50px;

height:40px;

}



}



`}</style>


</header>


)

}