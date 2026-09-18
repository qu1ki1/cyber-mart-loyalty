import { useEffect, useState } from "react";
import { supabase } from "../supabase";


type Gift = {
  id: number;
  name: string;
  chance: number;
  quantity: number;
  active: boolean;
};


export default function Gifts() {

  const [gifts, setGifts] = useState<Gift[]>([]);

  const [name, setName] = useState("");
  const [chance, setChance] = useState(0);
  const [quantity, setQuantity] = useState(0);


  async function loadGifts(){

    const { data, error } = await supabase
      .from("gifts")
      .select("*")
      .order("id");


    if(!error && data){
      setGifts(data as Gift[]);
    }

  }



  useEffect(()=>{
    loadGifts();
  },[]);



  async function addGift(){

    if(!name) return;


    await supabase
      .from("gifts")
      .insert({
        name,
        chance,
        quantity,
        active:true
      });


    setName("");
    setChance(0);
    setQuantity(0);

    loadGifts();

  }



  async function deleteGift(id:number){

    await supabase
      .from("gifts")
      .delete()
      .eq("id",id);


    loadGifts();

  }



  return (

    <div>

      <h1>🎁 Управление подарками</h1>


      <div>

        <input
          placeholder="Название"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />


        <input
          type="number"
          placeholder="Шанс"
          value={chance}
          onChange={(e)=>setChance(Number(e.target.value))}
        />


        <input
          type="number"
          placeholder="Количество"
          value={quantity}
          onChange={(e)=>setQuantity(Number(e.target.value))}
        />


        <button onClick={addGift}>
          Добавить
        </button>

      </div>



      <h2>Список подарков</h2>


      {

        gifts.map((gift)=>(

          <div key={gift.id}>

            <b>{gift.name}</b>

            <p>
              Шанс: {gift.chance}%
            </p>

            <p>
              Осталось: {gift.quantity}
            </p>


            <button
              onClick={()=>deleteGift(gift.id)}
            >
              Удалить
            </button>


          </div>

        ))

      }


    </div>

  )

}