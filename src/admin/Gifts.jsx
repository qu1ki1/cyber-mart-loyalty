import { useEffect, useState } from "react"
import { supabase } from "../supabase"


export default function Gifts() {


  const [gifts,setGifts] = useState([])

  const [name,setName] = useState("")
  const [chance,setChance] = useState("")
  const [quantity,setQuantity] = useState("")


  async function loadGifts(){

    const {data,error} = await supabase
      .from("gifts")
      .select("*")
      .order("id")


    if(error){
      console.log(error)
      return
    }


    setGifts(data)

  }



  async function addGift(){


    if(!name || !chance){
      alert("Заполни название и шанс")
      return
    }


    const {error} = await supabase
      .from("gifts")
      .insert({

        name:name,
        chance:Number(chance),
        quantity:Number(quantity) || 0,
        active:true

      })


    if(error){

      console.log(error)
      alert("Ошибка добавления")
      return

    }


    setName("")
    setChance("")
    setQuantity("")


    loadGifts()


  }



  async function deleteGift(id){


    await supabase
      .from("gifts")
      .delete()
      .eq("id",id)


    loadGifts()

  }



  useEffect(()=>{

    loadGifts()

  },[])



  return (

    <div>


      <h1>
        🎁 Управление подарками
      </h1>



      <div style={{
        border:"1px solid #333",
        padding:20,
        borderRadius:15,
        marginBottom:30
      }}>


        <h2>
          Добавить подарок
        </h2>


        <input
        placeholder="Название"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        />


        <input
        placeholder="Шанс %"
        type="number"
        value={chance}
        onChange={(e)=>setChance(e.target.value)}
        />


        <input
        placeholder="Количество"
        type="number"
        value={quantity}
        onChange={(e)=>setQuantity(e.target.value)}
        />


        <button onClick={addGift}>
          Добавить
        </button>


      </div>




      <h2>
        Список подарков
      </h2>



      {

        gifts.map((gift)=>(

          <div
          key={gift.id}
          style={{
            border:"1px solid #555",
            padding:15,
            marginBottom:10,
            borderRadius:10
          }}
          >


            <h3>
              🎁 {gift.name}
            </h3>


            <p>
              Шанс: {gift.chance}%
            </p>


            <p>
              Количество: {gift.quantity}
            </p>


            <button
            onClick={()=>deleteGift(gift.id)}
            >
              🗑 Удалить
            </button>


          </div>


        ))

      }


    </div>

  )

}