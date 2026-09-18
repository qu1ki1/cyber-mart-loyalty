export default async function handler(req,res){

try {

const body = req.body;

console.log(body);


if(body.message){

const chatId = body.message.chat.id;


await fetch(
`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

chat_id:chatId,

text:
"🎮 CYBER MART\n\nТвой подарок за визит 👇",

reply_markup:{
inline_keyboard:[
[
{
text:"🎁 Получить подарок",
web_app:{
url:"https://cyber-mart-loyalty.vercel.app"
}
}
]
]
}

})
}
);

}


return res.status(200).json({
ok:true
});


}catch(e){

console.log(e);

return res.status(500).json({
error:e.message
});

}

}
