"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Users, User, Calendar, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { toast } from "sonner";
import { useUserContext } from '@/context/user-context';

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const { setTeams, setActiveTeam } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        const fetchInvitations = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/myinvitation`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch invitations');
                }

                const invitationData = await response.json();
                setInvitations(invitationData);
            } 
            catch (error) {
                toast.error("Error loading invitations", {
                    description: "There was a problem loading your invitations. Please refresh the page."
                });
            } 
            finally {
                setLoading(false);
            }
        };

        fetchInvitations();
    }, []);

    const handleAccept = async (invitation) => {
        try {
            setActionLoading(invitation.id);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/myinvitation/${invitation.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: "accept" }),
            });

            if (!response.ok) {
                throw new Error('Failed to accept invitation');
            }
            console.log(response, "accept");
            const updatedInvitations = invitations.filter(inv => inv.id !== invitation.id);
            setInvitations(updatedInvitations);
            toast.success("Invitation accepted", {
                description: "You've successfully joined the team."
            });
            // Fetch teams
            const teamsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (teamsResponse.ok) {
                const teamsData = await teamsResponse.json();
                
                // If teams array is empty, redirect to create team
                if (!teamsData || teamsData.length === 0) {
                    router.push('/onboarding/createteam');
                    return;
                }
                
                const formattedTeams = teamsData.map((team) => ({
                    name: team.teamName,
                    role: team.role,
                    id: team.id,
                    plan: 'Free',
                }));

                // Store data in local storage
                localStorage.setItem('teams', JSON.stringify(formattedTeams));
                setTeams(formattedTeams);
                setActiveTeam(formattedTeams[0])

                // Navigate to dashboard
                router.push('/workspace/members');
            }
            else {
                const errorData = await teamsResponse.json();
                toast.error("Login Failed", {
                    description: errorData.message || 'Unexpected error occurred.',
                    duration: 5000
                });
            }
        } 
        catch (error) {
            toast.error("Error accepting invitation", {
                description: "There was a problem accepting the invitation. Please try again."
            });
        } 
        finally {
            setActionLoading('');
        }
    };

        
    const handleReject = async (invitation) => {
        try {
            setActionLoading(invitation.id);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/myinvitation/${invitation.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: "reject" }),
            });
            if (!response.ok) {
                throw new Error('Failed to reject invitation');
            }
            console.log(response, "reject");
            const updatedInvitations = invitations.filter(inv => inv.id !== invitation.id);
            setInvitations(updatedInvitations);

            toast.success("Invitation declined", {
                description: "The invitation has been declined."
            });

            if (updatedInvitations.length === 0) {
                // Fetch teams
                const teamsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (teamsResponse.ok) {
                    const teamsData = await teamsResponse.json();
                
                    // If teams array is empty, redirect to create team
                    if (!teamsData || teamsData.length === 0) {
                        router.push('/onboarding/createteam');
                        return;
                    }
                
                    const formattedTeams = teamsData.map((team) => ({
                        name: team.teamName,
                        role: team.role,
                        id: team.id,
                        plan: 'Free',
                    }));

                    // Store data in local storage
                    localStorage.setItem('teams', JSON.stringify(formattedTeams));
                    setTeams(formattedTeams);
                    setActiveTeam(formattedTeams[0])

                    // Navigate to dashboard
                    router.push('/workspace/members');
                }
                else {
                    const errorData = await teamsResponse.json();
                    toast.error("Login Failed", {
                        description: errorData.message || 'Unexpected error occurred.',
                        duration: 5000
                    });
                    return;
                }
            }
        } 
        catch (error) {
            toast.error("Error declining invitation", {
            description: "There was a problem declining the invitation. Please try again."
            });
        } 
        finally {
            setActionLoading('');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-[400px] shadow-lg">
                <CardHeader className="text-center space-y-2">
                <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <CardTitle>Loading Invitations</CardTitle>
                <CardDescription>Please wait while we fetch your invitations.</CardDescription>
                </CardHeader>
            </Card>
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-[400px] shadow-lg">
                    <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>No Invitations</CardTitle>
                    <CardDescription>You don't have any pending invitations.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-[600px] shadow-lg border-0">
            <CardHeader className="space-y-3 pb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-semibold">Team Invitations</CardTitle>
                        <CardDescription className="text-base mt-1">
                            You have {invitations.length} pending invitation{invitations.length > 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {invitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="rounded-lg bg-card p-4 transition-all"
                            >
                                <div className="flex flex-col space-y-4">
                                    <div>
                                        <h3 className="font-medium text-lg mb-2">{invitation.teamName}</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span className="text-sm">Invited by {invitation.invitedByName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {format(new Date(invitation.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={() => handleAccept(invitation)}
                                            disabled={actionLoading === invitation.id}
                                            variant="default"
                                            className="flex-1"
                                        >
                                            {actionLoading === invitation.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Accept
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(invitation)}
                                            disabled={actionLoading === invitation.id}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            {actionLoading === invitation.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
    );
}