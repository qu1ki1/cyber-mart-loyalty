import { supabase } from "../supabase";


export type User = {
  id: number;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
  attempts: number;
  gift: string | null;
};


export type Gift = {
  id: number;
  name: string;
  chance: number;
  active: boolean;
  quantity: number;
  created_at: string;
};


export type GiftUpdate = {
  name?: string;
  chance?: number;
  quantity?: number;
  active?: boolean;
};



/*
=================
USERS
=================
*/


export async function getUsers(): Promise<User[]> {

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending:false });


  if(error){
    console.error(error);
    return [];
  }


  return (data as User[]) || [];

}



/*
=================
GIFTS
=================
*/


export async function getGifts(): Promise<Gift[]> {

  const {data,error}=await supabase
    .from("gifts")
    .select("*")
    .order("id",{ascending:true});


  if(error){
    console.error(error);
    return [];
  }


  return (data as Gift[]) || [];

}




export async function createGift(
  gift:{
    name:string;
    chance:number;
    quantity:number;
    active:boolean;
  }
){


  if(gift.chance < 0){
    throw new Error(
      "Шанс не может быть меньше 0"
    );
  }


  if(gift.quantity < 0){
    throw new Error(
      "Количество не может быть меньше 0"
    );
  }



  const {data,error}=await supabase
    .from("gifts")
    .insert(gift)
    .select()
    .single();



  if(error){
    console.error(error);
    throw error;
  }


  return data as Gift;

}





export async function updateGift(
  id:number,
  updates:GiftUpdate
){


  const {data,error}=await supabase
    .from("gifts")
    .update(updates)
    .eq("id",id)
    .select()
    .single();



  if(error){
    console.error(error);
    throw error;
  }


  return data as Gift;

}





export async function deleteGift(
  id:number
){


  const {error}=await supabase
    .from("gifts")
    .delete()
    .eq("id",id);



  if(error){
    console.error(error);
    throw error;
  }


  return true;

}





export async function toggleGift(
  id:number,
  active:boolean
){


  return updateGift(
    id,
    {
      active
    }
  );

}