import { Todo, getTodos, getTodosWithSubTodos } from "@/actions/todo"
import TodoDisplay from "@/components/dashboard/TodoDisplay"

interface DashboardIndexPageProps {}

const DashboardIndexPage = async ({}: DashboardIndexPageProps) => {
  
  const Subres = await getTodosWithSubTodos();

  const mergedTodos = (todos: Todo[]): Todo[] => {
    return todos.map((todo) => ({
      ...todo,
      subTodos: todo.subTodos ? mergedTodos(todo.subTodos) : []
    }))
  }

  const processedTodos = mergedTodos(Subres.data ?? []);

  
  return (
    <div>
      <TodoDisplay 
        todos={processedTodos}    
      />
    </div>
  )
}

export default DashboardIndexPage
