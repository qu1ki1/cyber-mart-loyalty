import { supabase } from "../supabase";


export async function getUsers(){

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending:false });


  if(error){
    console.error(error);
    return [];
  }


  return data || [];

}