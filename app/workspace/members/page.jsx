"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddMemberDialog from "@/components/add-member";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useUserContext } from "@/context/user-context"

export default function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useUserContext();

  useEffect(() => {
    if (invitations.length === 0) {
      setIsInvitationsOpen(false);
    }
  }, [invitations.length]);
  
  useEffect(() => {
    if (!activeTeam) return;
    setShow(activeTeam.role === 'owner');
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${activeTeam.id}/member`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch members for team ${activeTeam.name}`);
        }
        const data = await response.json();

        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]); // Clear members in case of an error
      } finally {
        setIsLoading(false);
      }
    };

    const fetchInvitations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${activeTeam.id}/invitation`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        if (!response.ok) {
          const data = await response.json();
          if (data.code === 403 && data.message === "You must be the team owner to perform this action") {
            setShow(false);
          }
          return
        }
        const data = await response.json();
        setInvitations(data);
      } catch (error) {
        setInvitations([]);
      }
    };

    fetchMembers();
    fetchInvitations();

  }, [activeTeam]);

  const handleAddMember = (newMember) => {
    setInvitations([...invitations, newMember]);
  };

  const handleDelete = async (memberId) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const handleRejectInvitation = async (invitationId) => {
    if (!activeTeam) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${activeTeam.id}/invitation/${invitationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to reject the invitation");
      }
      toast.success("Invitation canceled", {
        description: "You've canceled the invitation."
    });
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

  const getInvitationsHeight = () => {
    const baseRowHeight = 53;
    const headerHeight = 41;
    const maxHeight = 206;
    const contentHeight = (invitations.length * baseRowHeight) + headerHeight;
    return Math.min(contentHeight, maxHeight);
  };

  return (
      <SidebarInset>
      <header className="flex h-16 shrink-0 justify-between items-center gap-2">
        <div className="flex items-center px-4">
          <SidebarTrigger className="ml-1 h-8" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold text-gray-900 px-2">Team members</h1>
        </div>
        {show ? <div className="px-4">
          <AddMemberDialog onAddMember={ handleAddMember } activeTeam={activeTeam} />
        </div> : <></>}
        
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min space-y-6 p-4">

          {/* Pending Invitations Section */}
          {show ? <div className="bg-white rounded-lg shadow">
            <Collapsible
              open={isInvitationsOpen}
              onOpenChange={(open) => {
                if (invitations.length > 0) {
                  setIsInvitationsOpen(open);
                }
              }}
              className="w-full"
            >
              <CollapsibleTrigger 
                className={`flex w-full items-center justify-between p-4 ${
                  invitations.length > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                }`}
                disabled={invitations.length === 0}
              >
                <div className="flex items-center space-x-2">
                  {invitations.length > 0 && (
                    isInvitationsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
                  )}
                  <h2 className="text-lg font-medium">Pending Invitations</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                    invitations.length > 0 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {invitations.length}
                  </span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea 
                  className="transition-all duration-200 ease-in-out"
                  style={{ height: `${getInvitationsHeight()}px` }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-white">Email</TableHead>
                        <TableHead className="sticky top-0 bg-white">Sent At</TableHead>
                        <TableHead className="sticky top-0 bg-white w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(3)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                        ))
                      ) : invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>
                          {invitation.invitedAt ? format(new Date(invitation.invitedAt.replace(" ", "T")), "MMM d, yyyy") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => handleRejectInvitation(invitation.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div> : <></>}
          

          {/* Current Members Section */}
          <div className="bg-white rounded-lg shadow transition-all duration-200 ease-in-out">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Current Members</h2>
            </div>
            <Table>
              {show ? (<>
                <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : members.length > 0 ? (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>
                        {format(new Date(member.joinedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </>) : (<>
                <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : members.length > 0 ? (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>
                        {format(new Date(member.joinedAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </>)}
              
            </Table>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}