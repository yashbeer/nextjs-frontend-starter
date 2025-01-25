import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';

export const useProtectedRoute = () => {
    const router = useRouter();
    const { user, loading } = useUserContext();

    useEffect(() => {
        if (!loading && !user) {
            // If not authenticated, redirect to login
            router.push('/');
        }
    }, [user, loading, router]);

    return { isAuthenticated: !!user, loading };
}; 