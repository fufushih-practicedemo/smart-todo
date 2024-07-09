import { getDeletedTodos, restoreTodo } from "@/actions/todo"
import TodoDisplay from "@/components/dashboard/TodoDisplay"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  
  const handleRestore = async (id: string) => {
    const response = await restoreTodo(id);
    if (response.status === "success") {
      
    } else {
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trash</h1>
      {deletedTodos.length === 0 ? (
        <p>The trash is</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deletedTodos.map((todo) => (
            <Card key={todo.id}>
              <CardHeader>
                <CardTitle>{todo.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="mt-2" 
                >
                  恢復
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardTrashPage;
