import React, { useState, useEffect } from "react"
import { Ghost, ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Toaster, toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserContext } from "@/context/user-context"


export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar()
  // State for active team and new team info
  const { setTeams, activeTeam, setActiveTeam } = useUserContext();
  const [newTeamName, setNewTeamName] = useState("")
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  // Effect hook to set the first team when teams are loaded
  useEffect(() => {
        if (teams.length > 0 && !activeTeam) {
            setActiveTeam(teams[0])
        }
    }, [teams, activeTeam])

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
        toast.error('Team name cannot be empty.');
        return;
    }
    setLoading(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teamName: newTeamName }),
        });

        const result = await response.json();

        if (response.ok) {
            // Successful creation
            toast.success(`Team "${newTeamName}" created successfully!`);

            // Update team context
            const newTeam = {
                name: result.teamName,
                role: "owner",
                id: result.id,
                plan: "Free",
            };
            
            setTeams((prevTeams) => [...prevTeams, newTeam]);
            setActiveTeam(newTeam)  // Set the newly added team as the active team
            setNewTeamName("")
            setDialogOpen(false);  // Close the create team dialog
            setDropdownOpen(false);  // Close the team switcher dropdown

        } else {
            throw new Error(result.message || 'Failed to create team');
        }
    } catch (error) {
        toast.error(error.message || 'Something went wrong.');
    } finally {
        setLoading(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Ghost className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTeam?.name || "...loading"}</span>
                <span className="truncate text-xs">{activeTeam?.plan || "...loading"}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem key={team?.id || index} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Ghost className="size-4 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground cursor-pointer">Add team</div>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                <Button onClick={handleAddTeam} disabled={!newTeamName || loading}>
                    {loading ? "Creating..." : "Create Team"}
                </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
