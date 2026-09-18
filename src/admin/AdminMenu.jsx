export default function AdminMenu({setPage}) {


return (

<div style={{
width:220,
padding:20,
borderRight:"1px solid #333",
minHeight:"100vh"
}}>


<h2>
🎮 CYBER MART
</h2>


<button onClick={()=>setPage("dashboard")}>
📊 Дашборд
</button>

<br/><br/>


<button onClick={()=>setPage("users")}>
👥 Пользователи
</button>


<br/><br/>


<button onClick={()=>setPage("gifts")}>
🎁 Подарки
</button>


<br/><br/>


<button onClick={()=>setPage("settings")}>
⚙️ Настройки
</button>


</div>

)

}