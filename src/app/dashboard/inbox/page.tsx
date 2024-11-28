import { getTodosWithSubTodos } from "@/actions/todo";
import TodoDisplay from "@/components/dashboard/TodoDisplay";

const DashboardIndexPage = async () => {
  const response = await getTodosWithSubTodos();
  
  const mergedTodos = (todos: any[]): any[] => {
    return todos.map((todo) => ({
      ...todo,
      subTodos: todo.subTodos ? mergedTodos(todo.subTodos) : []
    }));
  };

  const processedTodos = mergedTodos(response.data ?? []);
  
  return <TodoDisplay todos={processedTodos} />;
};

export default DashboardIndexPage;
