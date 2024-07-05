import { getUser } from "@/lib/lucia"
import Image from "next/image";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const user = await getUser();
  if(!user) {
    redirect('/auth');
  }

  return (
    <section>
      dashboard
    </section>
  )
}

export default DashboardPage
