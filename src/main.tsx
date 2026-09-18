import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'
import Admin from './Admin.jsx'

import Dashboard from './admin/Dashboard.jsx'
import Users from './admin/Users.jsx'
import Gifts from './admin/Gifts.jsx'
import Winners from './admin/Winners.jsx'
import Settings from './admin/Settings.jsx'

import WebApp from '@twa-dev/sdk'


if(WebApp && typeof WebApp.ready==="function"){
  WebApp.ready()
}


if(WebApp && typeof WebApp.expand==="function"){
  WebApp.expand()
}



const path = window.location.pathname



function Router(){


if(path === "/admin"){
  return <Admin/>
}


if(path === "/admin/users"){
  return <Users/>
}


if(path === "/admin/gifts"){
  return <Gifts/>
}


if(path === "/admin/winners"){
  return <Winners/>
}


if(path === "/admin/settings"){
  return <Settings/>
}


return <App/>


}



createRoot(document.getElementById('root')!).render(

<StrictMode>

<Router/>

</StrictMode>

)