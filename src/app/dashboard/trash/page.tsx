import { getDeletedTodos, restoreTodo } from "@/actions/todo"
import TrashTodoDisplay from "@/components/dashboard/TrashTodoDisplay";
import { Button } from "@/components/ui/button";

interface DashboardTrashPageProps {}

const DashboardTrashPage = async ({}: DashboardTrashPageProps) => {
  const response = await getDeletedTodos();
  
  if (response.status === "error") {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">回收桶</h1>
        <p className="text-red-500">{response.message}</p>
      </div>
    )
  }

  const deletedTodos = response.data;

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      <h1 className="text-2xl font-bold mb-4">Trash</h1>
      {deletedTodos.length === 0 ? (
        <p>The trash is empty</p>
      ) : (
        <TrashTodoDisplay deletedTodos={deletedTodos} />
      )}
    </section>
  )
}

export default DashboardTrashPage;
