import { getTodos } from "@/actions/todo";
import SignOutButton from "@/components/SignOutButton";
import TodoDashboard from "@/components/dashboard/TodoDashboard";
import { getUser } from "@/lib/lucia"
import Image from "next/image";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const user = await getUser();
  if(!user) {
    redirect('/auth');
  }

  const res = await getTodos();

  return (
    <main className="flex flex-col gap-2 max-w-screen-2xl mx-auto">
      <TodoDashboard todos={res.data} />
    </main>
  )
}

export default DashboardPage
