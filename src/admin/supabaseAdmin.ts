import { supabase } from "../supabase";

export type User = {
  id: number;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
  attempts: number;
  bonus_attempts?: number;
  gift: string | null;
  business_id?: number;
};

export type Gift = {
  id: number;
  name: string;
  chance: number;
  active: boolean;
  quantity: number;
  created_at: string;
  business_id?: number;
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

export async function getUsers(businessId: number): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("business_id", businessId)
    .order("id", { ascending: false });

  if (error) {
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

export async function getGifts(businessId: number): Promise<Gift[]> {
  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .eq("business_id", businessId)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data as Gift[]) || [];
}

export async function createGift(
  gift: { name: string; chance: number; quantity: number; active: boolean },
  businessId: number
) {
  if (gift.chance < 0) {
    throw new Error("Шанс не может быть меньше 0");
  }
  if (gift.quantity < 0) {
    throw new Error("Количество не может быть меньше 0");
  }

  const { data, error } = await supabase
    .from("gifts")
    .insert({ ...gift, business_id: businessId })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Gift;
}

export async function updateGift(id: number, updates: GiftUpdate, businessId: number) {
  const { data, error } = await supabase
    .from("gifts")
    .update(updates)
    .eq("id", id)
    .eq("business_id", businessId) // защита: нельзя случайно/специально задеть чужой приз по id
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Gift;
}

export async function deleteGift(id: number, businessId: number) {
  const { error } = await supabase.from("gifts").delete().eq("id", id).eq("business_id", businessId);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}

export async function toggleGift(id: number, active: boolean, businessId: number) {
  return updateGift(id, { active }, businessId);
}
