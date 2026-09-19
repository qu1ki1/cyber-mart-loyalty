type Props = {
  open:boolean;
  close:()=>void;
};


export default function AdminMenu({
  open,
  close
}:Props){


const path = window.location.pathname;



const linkStyle = (href:string)=>({

display:"flex",

alignItems:"center",

gap:10,

padding:"12px 16px",

borderRadius:10,

color:
path===href
?
"var(--neon)"
:
"var(--muted)",


background:
path===href
?
"rgba(57,255,138,.08)"
:
"transparent",


border:
path===href
?
"1px solid var(--line)"
:
"1px solid transparent",


textDecoration:"none",

fontWeight:500,

marginBottom:6

});




return (

<>


{
open &&

<div

onClick={close}

style={{

position:"fixed",

inset:0,

background:"rgba(0,0,0,.5)",

zIndex:900

}}

/>

}



<aside

style={{

width:240,

minHeight:"100vh",

padding:"24px 16px",

borderRight:"1px solid var(--line-dim)",

background:"rgba(0,0,0,.95)",

display:"flex",

flexDirection:"column",

position:"fixed",

left:0,

top:0,

zIndex:1000,


transform:

open

?

"translateX(0)"

:

"translateX(0)",


}}

className="admin-menu"

>



<div
style={{
marginBottom:32,
paddingLeft:8
}}
>

<div
style={{
fontSize:20,
fontWeight:700,
letterSpacing:".12em"
}}
>

CYBER 
<span style={{
color:"var(--neon)"
}}>
MART
</span>

</div>


<div
style={{
fontSize:12,
color:"var(--muted)"
}}
>
Admin Panel
</div>


</div>





<nav style={{flex:1}}>


<a href="/admin" style={linkStyle("/admin")}>
📊 Дашборд
</a>


<a href="/admin/users" style={linkStyle("/admin/users")}>
👥 Пользователи
</a>


<a href="/admin/gifts" style={linkStyle("/admin/gifts")}>
🎁 Подарки
</a>


<a href="/admin/winners" style={linkStyle("/admin/winners")}>
🏆 Победы
</a>


<a href="/admin/settings" style={linkStyle("/admin/settings")}>
⚙️ Настройки
</a>


</nav>



<div
style={{
fontSize:11,
color:"var(--muted)",
borderTop:"1px solid var(--line-dim)",
paddingTop:12
}}
>
v1.0 · Cyber Mart
</div>



</aside>



<style>{`

@media(max-width:600px){

.admin-menu{

width:260px!important;

}


main{

padding-left:0!important;

}


.mobile-menu-btn{

display:block!important;

}


}


`}</style>



</>

)

}