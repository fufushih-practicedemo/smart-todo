import SignOutButton from "@/components/SignOutButton";
import Todo from "@/components/dashboard/Todo";
import { getUser } from "@/lib/lucia"
import Image from "next/image";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  // const user = await getUser();
  // if(!user) {
  //   redirect('/auth');
  // }
  return (
    <main className="flex flex-col gap-2 max-w-full mx-auto">
      <Todo />
    </main>
  )
}

export default DashboardPage
