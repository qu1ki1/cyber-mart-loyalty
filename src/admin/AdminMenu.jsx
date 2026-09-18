export default function AdminMenu(){

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


<a href="/admin">
📊 Дашборд
</a>

<br/><br/>


<a href="/admin/users">
👥 Пользователи
</a>


<br/><br/>


<a href="/admin/gifts">
🎁 Подарки
</a>


<br/><br/>


<a href="/admin/winners">
🏆 Победы
</a>


<br/><br/>


<a href="/admin/settings">
⚙️ Настройки
</a>



</div>

)

}