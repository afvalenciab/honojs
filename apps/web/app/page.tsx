import { hc } from "hono/client";
import type { AppType } from "@repo/api";

const client = hc<AppType>("http://localhost:8787");

export default async function Home() {
  // 1. Login
  const authRes = await client.auth.login.$post({
    json: { email: "andres@gmail.com", password: "123" },
  });

  if (!authRes.ok) {
    const err = await authRes.json();
    console.log(err.error);
    return <main className="p-8">Login falló</main>;
  }

  const { token } = await authRes.json();
  console.log("token", token);

  //2. Create a task con token
  const createTaskRes = await client.tasks.$post(
    {
      json: { name: "Integrando Hono en Web", completed: false },
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (createTaskRes.ok) {
    console.log("Tarea creada");
  } else {
    const err = await createTaskRes.json();
    console.log("Error creando la tarjeta: ", err.error);
    console.log("Tarea no creada");
  }

  // 3. Listar tareas
  const tasksRes = await client.tasks.$get(
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!tasksRes.ok) {
    return <main className="p-8">No authorizado</main>;
  }

  const tasksList = await tasksRes.json();
  console.log({ tasksList });

  // 4. Update task
  const taskItem = tasksList[0];
  if (taskItem) {
    const updateTaskRes = await client.tasks[":id"].$patch(
      {
        param: { id: taskItem.id },
        json: { completed: true },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (updateTaskRes.ok) {
      console.log("Tarea actualizada");
    } else {
      const err = await updateTaskRes.json();
      console.log("Error al actualizar la tarea: ", err.error);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Hono RPC</h1>
      <ul>
        {tasksList.map((item) => (
          <li key={item.id}>{`${item.name} -> ${item.completed}`}</li>
        ))}
      </ul>
    </main>
  );
}
