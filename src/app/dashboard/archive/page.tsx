import { getTodos } from "@/actions/todo"
import ArchivedTodoDisplay from "@/components/dashboard/ArchivedTodoDisplay";

interface DashboardArchivedPageProps {}

const DashboardArchivedPage = async ({}: DashboardArchivedPageProps) => {
  const response = await getTodos();
  
  if (response.status === "error") {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">已完成項目</h1>
        <p className="text-red-500">{response.message}</p>
      </div>
    )
  }

  const completedTodos = response.data.filter(todo => todo.isDone);

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      <h1 className="text-2xl font-bold mb-4">已完成項目</h1>
      {completedTodos.length === 0 ? (
        <p>沒有已完成的項目</p>
      ) : (
        <ArchivedTodoDisplay completedTodos={completedTodos} />
      )}
    </section>
  )
}

export default DashboardArchivedPage;
