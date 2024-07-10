import { getTodos } from '@/actions/todo';
import DashboardDisplay from '@/components/dashboard/DashboardDisplay';

const DashboardPage = async () => {
  const response = await getTodos();
  
  if (response.status === "error") {
    return <div>Error: {response.message}</div>;
  }
  const todos = response.data;

  return (
    <section className="w-full min-h-screen flex flex-col space-y-2 p-2">
      <DashboardDisplay todos={todos} />
    </section>
  )
};

export default DashboardPage;
