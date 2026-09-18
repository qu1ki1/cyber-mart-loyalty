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

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data as User[]) || [];
}

export async function getGifts(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data as Gift[]) || [];
}