"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "./SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import { menuGroups } from "@/lib/menu";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.length > 2 ? segments[2] : "#";
  const [cookie, setCookie] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      const data = await response.json();
      const userCookie = data.cookie.value;
      setCookie(userCookie);
    };

    checkAuth();
  }, []);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={` absolute left-0 top-0 z-10 flex h-screen w-72 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0 duration-300 ease-linear"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6">
          <Link href={`/user/${cookie}`}>
            <Image
              width={200}
              height={32}
              src={"/images/logo.png"}
              alt="Logo"
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-1 px-4 lg:px-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {group.name}
                </h3>
                <ul className="mb-6 flex flex-col gap-2">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={lastSegment}
                      userid={cookie}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <footer className="absolute bottom-0 m-4">
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          <span className="block text-[0.8rem] text-gray-500 dark:text-gray-400 sm:text-center">
            © 2025 <Link href={`/user/${cookie}`}>CloudBlock™</Link>. All
            Rights Reserved.
          </span>
        </footer>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
