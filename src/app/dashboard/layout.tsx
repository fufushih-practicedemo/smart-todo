import TodoDashboard from "@/components/dashboard/TodoDashboard";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser();
  if(!user) {
    redirect('/auth');
  }

  return (
    <main className="flex flex-col gap-2 max-w-screen-2xl mx-auto">
      <TodoDashboard>
        {children}
      </TodoDashboard>
    </main>
  )
}
