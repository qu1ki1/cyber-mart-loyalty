import { supabase } from "../supabase"

export async function getUsers(){

const {data,error}=await supabase
.from("users")
.select("*")
.order("created_at",{ascending:false})

if(error){
console.log(error)
return []
}

return data

}