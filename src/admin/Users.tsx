import { useEffect, useState } from "react";
import { getUsers } from "./supabaseAdmin";
import type { User } from "./supabaseAdmin";


export default function Users(){

  const [users,setUsers] = useState<User[]>([]);


  useEffect(()=>{

    getUsers().then(setUsers);

  },[]);



  return (

    <div>

      <h1>
        👥 Пользователи
      </h1>


      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Username</th>
            <th>Попытки</th>
            <th>Подарок</th>
          </tr>
        </thead>


        <tbody>

        {
          users.map((user)=>(
            
            <tr key={user.id}>

              <td>
                {user.telegram_id}
              </td>

              <td>
                {user.first_name || "-"}
              </td>

              <td>
                {user.username ? "@" + user.username : "-"}
              </td>

              <td>
                {user.attempts}
              </td>

              <td>
                {user.gift || "-"}
              </td>

            </tr>

          ))
        }

        </tbody>

      </table>

    </div>

  );

}