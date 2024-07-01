import SignOutButton from "@/components/SignOutButton";
import { getUser } from "@/lib/lucia"
import Image from "next/image";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const user = await getUser();
  if(!user) {
    redirect('/auth');
  }
  return (
    <main className="flex flex-col gap-2 max-w-[70%] mx-auto">
      <section className="flex flex-row ">
        {user.picture && <Image
          src={user.picture}
          alt="Hero Image"
          width={50}
          height={50}
        />}
        <div>
          <div>You are login: {user.email}</div>
          {user.name}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
