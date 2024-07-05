import { Todo, getTodos } from "@/actions/todo"
import TodoDisplay from "@/components/dashboard/TodoDisplay"

interface DashboardIndexPageProps {}

const DashboardIndexPage = async ({}: DashboardIndexPageProps) => {
  
  const res = await getTodos();
  
  return (
    <div>
      <TodoDisplay 
        todos={res.data ?? []}    
      />
    </div>
  )
}

export default DashboardIndexPage
