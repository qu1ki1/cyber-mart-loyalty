import { useEffect, useState } from "react";
import { getUsers } from "./supabaseAdmin";
import type { User } from "./supabaseAdmin";


export default function Users() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);



  async function loadUsers() {

    setLoading(true);

    const data = await getUsers();

    setUsers(data);

    setLoading(false);
  }



  useEffect(() => {

    loadUsers();

  }, []);





  return (

    <div
      style={{
        padding: "32px 40px",
        maxWidth: 1100
      }}
    >


      <div style={{ marginBottom: 28 }}>

        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--ink)"
          }}
        >
          👥 Пользователи
        </h1>


        <p
          style={{
            color: "var(--muted)",
            fontSize: 14
          }}
        >
          Список пользователей системы лояльности
        </p>


      </div>





      {
        loading ? (

          <div
            style={{
              color: "var(--muted)"
            }}
          >
            Загрузка...
          </div>

        ) : users.length === 0 ? (

          <div
            style={{
              color: "var(--muted)"
            }}
          >
            Пользователей пока нет
          </div>

        ) : (


          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line-dim)",
              borderRadius: 16,
              overflow: "hidden"
            }}
          >


            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >


              <thead>

                <tr
                  style={{
                    borderBottom:
                      "1px solid var(--line-dim)",
                    background:
                      "rgba(0,0,0,0.25)"
                  }}
                >

                  <th style={thStyle}>
                    ID
                  </th>

                  <th style={thStyle}>
                    Telegram ID
                  </th>

                  <th style={thStyle}>
                    Имя
                  </th>

                  <th style={thStyle}>
                    Username
                  </th>

                  <th style={thStyle}>
                    Попытки
                  </th>

                  <th style={thStyle}>
                    Подарок
                  </th>


                </tr>

              </thead>




              <tbody>


                {
                  users.map((user) => (

                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          "1px solid var(--line-dim)"
                      }}
                    >


                      <td style={tdStyle}>
                        {user.id}
                      </td>


                      <td style={tdStyle}>
                        {user.telegram_id}
                      </td>


                      <td style={tdStyle}>
                        {user.first_name || "-"}
                      </td>


                      <td style={tdStyle}>
                        {
                          user.username
                            ? `@${user.username}`
                            : "-"
                        }
                      </td>


                      <td style={tdStyle}>

                        <span
                          style={{
                            color: "var(--neon)",
                            fontWeight: 600
                          }}
                        >
                          {user.attempts}
                        </span>

                      </td>



                      <td style={tdStyle}>

                        {
                          user.gift || "Нет"
                        }

                      </td>


                    </tr>


                  ))
                }


              </tbody>


            </table>


          </div>


        )
      }


    </div>

  );

}





const thStyle: React.CSSProperties = {

  textAlign: "left",

  padding: "14px 18px",

  fontSize: 13,

  fontWeight: 500,

  color: "var(--muted)",

  letterSpacing: "0.03em"

};




const tdStyle: React.CSSProperties = {

  padding: "16px 18px",

  fontSize: 14,

  color: "var(--ink)"

};