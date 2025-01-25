"use client"

import * as React from "react"
import {
  AlignStartVertical,
  BookOpen,
  Home,
  LifeBuoy,
  ListChecks,
  MessageSquare,
  User,
  Users,
} from "lucide-react"
import { TeamSwitcher } from "@/components/team-switcher"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useUserContext } from "@/context/user-context"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"


const data = {
  navMain: [
    {
      title: "Home",
      url: "/workspace/home",
      icon: Home,
    },
    {
      title: "Members",
      url: "/workspace/members",
      icon: Users,
    }

  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { user,teams } = useUserContext();
  const sidebarUser = {
    name: user?.name || "...loading",
    email: user?.email || "...loading",
    avatar: User,
  };

  return (
    (<Sidebar variant="inset" {...props}>
     <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>)
  );
}
