export default function Admin() {

  return (
    <div style={{
      padding:40,
      fontFamily:"Arial"
    }}>

      <h1>
        🎮 CYBER MART ADMIN
      </h1>

      <h2>
        Панель управления
      </h2>


      <div style={{
        marginTop:30,
        padding:20,
        border:"1px solid #ddd",
        borderRadius:15
      }}>

        <h3>
          📊 Статистика
        </h3>

        <p>
          Пользователей: 0
        </p>

        <p>
          Выдано подарков: 0
        </p>

      </div>


      <div style={{
        marginTop:20,
        padding:20,
        border:"1px solid #ddd",
        borderRadius:15
      }}>

        <h3>
          🎁 Последние подарки
        </h3>

        Пока пусто

      </div>


    </div>
  )
}