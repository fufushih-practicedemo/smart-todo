import SignOutButton from "@/components/SignOutButton";
import TodoDashboard from "@/components/dashboard/TodoDashboard";
import { getUser } from "@/lib/lucia"
import Image from "next/image";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  // const user = await getUser();
  // if(!user) {
  //   redirect('/auth');
  // }
  return (
    <main className="flex flex-col gap-2 max-w-screen-2xl mx-auto">
      <TodoDashboard />
    </main>
  )
}

export default DashboardPage
