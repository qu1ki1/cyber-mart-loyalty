import { supabase } from './supabase'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Admin from './Admin'
import './App.css'


type IconKey = 'clock' | 'clockBig' | 'cup' | 'percent' | 'star'


type Reward = {
  id: string
  name: string
  weight: number
  icon: IconKey
  prefix: string
}


const REWARDS: Reward[] = [
  { id: 'r30', name: '+30 минут игры', weight: 40, icon: 'clock', prefix: 'CM30' },
  { id: 'r60', name: '+1 час игры', weight: 20, icon: 'clockBig', prefix: 'CM60' },
  { id: 'drink', name: 'Бесплатный напиток', weight: 20, icon: 'cup', prefix: 'CMDR' },
  { id: 'discount', name: 'Скидка 10%', weight: 15, icon: 'percent', prefix: 'CMDS' },
  { id: 'jackpot', name: 'Джекпот: 3 часа игры', weight: 5, icon: 'star', prefix: 'CMJP' },
]


type WinEntry = {
  rewardId: string
  code: string
  shown: boolean
  ts: number
}



function pickReward(): Reward {

  const total = REWARDS.reduce(
    (s, r) => s + r.weight,
    0
  )

  let x = Math.random() * total


  for (const r of REWARDS) {

    if (x < r.weight) return r

    x -= r.weight
  }


  return REWARDS[0]

}



function genCode(prefix:string){

  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`

}



function Icon({
  icon,
  className
}:{
  icon:IconKey;
  className?:string
}) {


switch(icon){

case 'clock':
return (
<svg viewBox="0 0 24 24" fill="none" className={className}>
<path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth={1.6}/>
<path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth={1.6}/>
</svg>
)


case 'clockBig':
return (
<svg viewBox="0 0 24 24" fill="none" className={className}>
<path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth={1.6}/>
<path d="M12 6.5v5.5l4 2.5" stroke="currentColor" strokeWidth={2}/>
</svg>
)


case 'cup':
return (
<svg viewBox="0 0 24 24" fill="none" className={className}>
<path d="M7 4h10l-1.7 13.6a3 3 0 01-3 2.4h-.6a3 3 0 01-3-2.4L7 4z" stroke="currentColor" strokeWidth={1.6}/>
</svg>
)


case 'percent':
return (
<svg viewBox="0 0 24 24" fill="none" className={className}>
<circle cx="7.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth={1.6}/>
<circle cx="16.5" cy="16.5" r="2.2" stroke="currentColor" strokeWidth={1.6}/>
<path d="M17 6L6 18" stroke="currentColor" strokeWidth={1.6}/>
</svg>
)


case 'star':
return (
<svg viewBox="0 0 24 24" fill="none" className={className}>
<path d="M12 2.5l2.6 6.1 6.4.6-4.9 4.3 1.5 6.3L12 16.6 6.4 19.8l1.5-6.3-4.9-4.3 6.4-.6L12 2.5z" stroke="currentColor"/>
</svg>
)

}

}



const CONFETTI =
Array.from({length:16},(_,i)=>({
x:Math.cos(i)*80,
y:Math.sin(i)*80,
delay:i*0.02
}))



export default function App(){


const path = window.location.pathname;


// АДМИНКА

if(path.startsWith("/admin")){

return <Admin />

}



// ОСНОВНОЕ ПРИЛОЖЕНИЕ


const [screen,setScreen] =
useState<'idle'|'result'>('idle')


const [entry,setEntry] =
useState<WinEntry|null>(null)


const [loading,setLoading]=
useState(false)


const [telegramId,setTelegramId]=
useState<number|null>(null)


const [firstName,setFirstName]=
useState<string|null>(null)



const busy =
useRef(false)



useEffect(()=>{


const tg =
window.Telegram?.WebApp


if(!tg)return


tg.ready()

tg.expand()


const user =
tg.initDataUnsafe?.user


if(user){

setTelegramId(user.id)

setFirstName(user.first_name)



supabase
.from("users")
.upsert({

telegram_id:user.id,

first_name:user.first_name,

username:user.username

})

}


},[])




async function openCase(){


if(busy.current)return


busy.current=true

setLoading(true)



const reward =
pickReward()


const code =
genCode(reward.prefix)



await supabase
.from("winners")
.insert({

telegram_id:telegramId,

gift_id:reward.id,

gift_name:reward.name

})



setEntry({

rewardId:reward.id,

code,

shown:false,

ts:Date.now()

})


setScreen("result")


setLoading(false)

busy.current=false


}




return (

<div className="app">


<header>

<div className="wordmark">
LOYAL<span>TY</span>
</div>


<div>
{firstName}
</div>


</header>



<main>


<AnimatePresence>


{screen==="idle" &&

<motion.section>

<h1>
Твой подарок за визит
</h1>


<button
className="cta"
onClick={openCase}
disabled={loading}
>

{loading
?"Открываем..."
:"Открыть кейс"}

</button>


</motion.section>

}



{screen==="result" &&

<motion.section>


<h1>
🎁 {REWARDS.find(r=>r.id===entry?.rewardId)?.name}
</h1>


<p>
Код: {entry?.code}
</p>


<button
className="ghost"
onClick={()=>setScreen("idle")}
>
Назад
</button>


</motion.section>

}



</AnimatePresence>


</main>



<footer>
CYBER MART LOYALTY
</footer>


</div>

)

}