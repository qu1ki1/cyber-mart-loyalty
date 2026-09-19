import { useState } from "react";
import { supabase } from "../supabase";
import { getTelegramUser } from "../telegram";


export default function Case(){


const [loading,setLoading]=useState(false);

const [result,setResult]=useState("");



async function openCase(){


if(loading)return;


const user=getTelegramUser();



if(!user){

alert(
"Откройте приложение через Telegram"
);

return;

}



setLoading(true);



try{


// получаем подарки

const {data:gifts,error}=await supabase
.from("gifts")
.select("*")
.eq("active",true)
.gt("quantity",0);



if(error)
throw error;



if(!gifts || gifts.length===0){

throw new Error(
"Нет доступных подарков"
);

}



// проверяем последний выигрыш

const {data:last}=await supabase
.from("winners")
.select("*")
.eq(
"telegram_id",
user.id
)
.order(
"created_at",
{
ascending:false
}
)
.limit(1)
.maybeSingle();



if(last){


const lastDate =
new Date(last.created_at);


const now =
new Date();



const diff =
now.getTime()
-
lastDate.getTime();



if(diff < 86400000){


const hours =
Math.ceil(
(86400000-diff)
/3600000
);



setResult(
`Попробуйте через ${hours} ч.`
);


return;

}


}




// считаем шанс


const total =
gifts.reduce(
(sum,g)=>sum+g.chance,
0
);



let random =
Math.random()*total;



let winner =
gifts[0];



for(const gift of gifts){


random -= gift.chance;


if(random<=0){

winner=gift;

break;

}

}




// уменьшаем количество


await supabase
.from("gifts")
.update({

quantity:
winner.quantity-1

})
.eq(
"id",
winner.id
);




// записываем победу


await supabase
.from("winners")
.insert({

telegram_id:user.id,

gift_id:winner.id,

gift_name:winner.name

});



setResult(
`🎁 Вы выиграли: ${winner.name}`
);



}

catch(e:any){

console.error(e);

setResult(
"Ошибка открытия кейса"
);


}

finally{

setLoading(false);

}



}





return (

<div
style={{
textAlign:"center",
padding:30
}}
>


<h1>
🎁 CYBER MART CASE
</h1>



<button

onClick={openCase}

disabled={loading}

style={{

padding:"18px 40px",

fontSize:18,

borderRadius:14,

cursor:"pointer"

}}

>

{
loading
?
"Открываем..."
:
"Открыть кейс"
}


</button>



{

result &&

<h2
style={{
marginTop:30
}}
>
{result}
</h2>

}



</div>

);


}