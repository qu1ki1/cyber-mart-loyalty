import { useEffect } from "react";


export function useTelegram(){

useEffect(()=>{


const tg = window.Telegram?.WebApp;


if(!tg){
return;
}


tg.ready();

tg.expand();


tg.setBackgroundColor("#050505");


},[]);


return window.Telegram?.WebApp;

}