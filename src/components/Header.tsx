import { getUser } from '@/lib/lucia';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SignOutButton from './SignOutButton';
import MobileNav from './dashboard/MobileNav';

const Header = async () => {
  const user = await getUser();
  
  return (
    <header className="z-10 sticky top-0 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MobileNav />
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">SmartTodo</span>
          </a>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user !== null ? (
            <SignOutButton>
              Sign out
            </SignOutButton>
          ) : (
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
