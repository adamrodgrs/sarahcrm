"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserPlusIcon, HomeModernIcon, HomeIcon } from "@heroicons/react/24/outline";

const NavBar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && !session?.user?.email) {
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    signOut({ callbackUrl: window.location.origin });
  };

  if (!session || !session.user.email) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 pattern p-2.5">
      <nav className="z-20 flex flex-col justify-around gap-4 border-t border-gray-200 bg-white/50 p-2.5 shadow-lg backdrop-blur-lg dark:border-slate-600/60 dark:bg-slate-800/50 min-h-[auto] rounded-lg border">
        <UserProfile user={session.user} />
        <NavLink href="/auth/signin" icon={<HomeIcon className="w-6 h-6 shrink-0" />} label="Home" />
        <NavLink href="/auth/addlead" icon={<UserPlusIcon className="w-6 h-6 shrink-0" />} label="Add Lead" />
        <hr className="dark:border-gray-700/60" />
        <button onClick={handleSignOut} className="flex h-16 w-16 flex-col items-center justify-center gap-1 text-fuchsia-900 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600">
          <HomeModernIcon className="w-6 h-6" />
          <small className="text-xs font-medium">Sign Out</small>
        </button>
      </nav>
    </div>
  );
};

const UserProfile = ({ user }) => (
  <div className="flex aspect-square min-h-[32px] w-16 flex-col items-center justify-center gap-1 rounded-md p-1.5 bg-indigo-50 text-indigo-600 dark:bg-sky-900 dark:text-sky-50">
    <Image src={user.image} alt={user.name} width={24} height={24} className="w-6 h-6 mx-auto rounded-full mb-2" />
    <small className="text-center text-xs font-medium">{user.name.split(" ")[0]}</small>
  </div>
);

const NavLink = ({ href, icon, label }) => (
  <Link
    href={href}
    className="flex aspect-square min-h-[32px] w-16 flex-col items-center justify-center gap-1 rounded-md p-1.5 text-gray-700 hover:bg-gray-600 dark:text-gray-400 dark:hover:bg-slate-600"
  >
    {icon}
    <small className="text-center text-xs font-medium">{label}</small>
  </Link>
);

export default NavBar;
