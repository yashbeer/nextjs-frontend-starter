'use client';

import React, { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/user-context';
import { useRouter } from 'next/navigation';

const CreateTeamCard = () => {
    const router = useRouter();
    const { setTeams,setActiveTeam } = useUserContext();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Team name cannot be empty.');
      return;
    }

    setLoading(true);
    console.log(localStorage.getItem('accessToken'));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
        method: 'POST',
        
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName}),
      });

      const result = await response.json();

      if (response.ok) {
        // Store data in local storage
        toast.success(`Team "${teamName}" created successfully!`);
        setTeamName('');
        const formattedTeams = {
            name: result.teamName,
            role: "owner",
            id: result.id,
            plan: 'Free',
        };
        setTeams([formattedTeams]);
        setActiveTeam(formattedTeams);
        router.push('/workspace/home');
      } else {
        throw new Error(result.message || 'Failed to create team');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Toaster position="top-center" />
      <Card className="w-96 shadow-lg">
        <CardHeader>
          <CardTitle>Create a Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={loading}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleCreateTeam}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateTeamCard;
