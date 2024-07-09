import TodoDashboard from "@/components/dashboard/TodoDashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-col gap-2 max-w-screen-2xl mx-auto">
      <TodoDashboard>
        {children}
      </TodoDashboard>
    </main>
  )
}
