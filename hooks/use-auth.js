import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';
import { toast } from "sonner";

export const useAuth = () => {
    const router = useRouter();
    const { setUser, setTeams, setActiveTeam } = useUserContext();

    const handleLogout = () => {
        // Clear all local storage
        localStorage.clear();
        
        // Reset context
        setUser(null);
        setTeams([]);
        setActiveTeam(null);
        
        // Redirect to signin
        router.replace('/');
    };

    const handlePostAuth = async (loginData) => {
        try {
            // Store auth tokens and user data
            localStorage.setItem('accessToken', loginData.tokens.access.token);
            localStorage.setItem('refreshToken', loginData.tokens.refresh.token);
            const userData = { name: loginData.user.name, email: loginData.user.email };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Check for invitations
            const myInvitationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/myinvitation`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${loginData.tokens.access.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!myInvitationResponse.ok) {
                throw new Error('Failed to check invitations');
            }

            const myinvitationData = await myInvitationResponse.json();
            if (myinvitationData.length > 0) {
                router.push('/onboarding/invitation');
                return;
            }

            // If no invitations, check teams
            const teamsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${loginData.tokens.access.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!teamsResponse.ok) {
                throw new Error('Failed to fetch teams');
            }

            const teamsData = await teamsResponse.json();
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

            localStorage.setItem('teams', JSON.stringify(formattedTeams));
            setTeams(formattedTeams);
            setActiveTeam(formattedTeams[0]);
            router.push('/workspace/members');

        } catch (error) {
            toast.error('Authentication Error', {
                description: error.message || 'An unexpected error occurred',
                duration: 5000
            });
        }
    };

    return { handlePostAuth, handleLogout };
}; 