import { motion } from "framer-motion";
import WebApp from "@twa-dev/sdk";


export default function Settings(){


return (

<div className="admin-page">


<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

>



<h1>
⚙️ Настройки
</h1>


<p
style={{
color:"var(--muted)"
}}
>
Конфигурация Cyber Mart Mini App
</p>





<div className="settings-grid">



<div className="admin-card">


<div className="setting-icon">
🤖
</div>


<h2>
Telegram Mini App
</h2>



<p>
Статус подключения
</p>



<div className="status">

<span></span>

Подключено

</div>


</div>







<div className="admin-card">


<div className="setting-icon">
🗄️
</div>


<h2>
Supabase
</h2>



<p>
База данных
</p>



<div className="status">

<span></span>

Работает

</div>


</div>







<div className="admin-card">


<div className="setting-icon">
🚀
</div>


<h2>
Версия

</h2>


<p>
Текущая сборка приложения
</p>



<strong className="version">

v1.0.0

</strong>


</div>








<div className="admin-card">


<div className="setting-icon">
📱
</div>


<h2>
Telegram данные
</h2>



<p>
Проверка WebApp окружения
</p>



<button

className="cyber-button"

onClick={()=>{

if(WebApp){

WebApp.showAlert(
"Telegram WebApp работает"
);

}

}}

>

Проверить

</button>



</div>





</div>





<style>{`

.settings-grid{


display:grid;


grid-template-columns:

repeat(
auto-fit,
minmax(260px,1fr)
);


gap:20px;


}





.setting-icon{


font-size:40px;


margin-bottom:15px;


}



.settings-grid h2{


font-family:Rajdhani;


font-size:25px;


}



.settings-grid p{


color:var(--muted);


}




.status{


margin-top:15px;


display:flex;


align-items:center;


gap:10px;


color:var(--neon);


}



.status span{


width:10px;


height:10px;


background:var(--neon);


border-radius:50%;


box-shadow:

0 0 15px var(--neon);


}



.version{


font-family:Rajdhani;


font-size:35px;


color:var(--cyan);


}





@media(max-width:600px){


.settings-grid{


grid-template-columns:1fr;


}


}


`}</style>



</motion.div>


</div>


)

}