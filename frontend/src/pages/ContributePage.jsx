import React, { useEffect } from 'react'
import useAuthStore from '../stores/authStore'

const ContributePage = () => {
    const { getUserProfile, user, isLoading, userProfile } = useAuthStore();

    useEffect(() => {
        // Only fetch if:
        // 1. User exists and has an ID
        // 2. We don't already have the profile
        // 3. We're not currently loading
        if (user?.id && !userProfile && !isLoading) {
            console.log("Fetching profile for user:", user.id);
            getUserProfile(user.id);
        }
    }, [user?.id, getUserProfile]); // Remove userProfile and isLoading from dependencies to prevent loops

    if (isLoading) {
        return <div>Loading user profile...</div>;
    }

    if (!user) {
        return <div>Please log in to view this page.</div>;
    }

    return (
        <div>
            <h1>Contribute Page</h1>
            {userProfile ? (
                <div>
                    <h2>User Profile:</h2>
                    <pre>{JSON.stringify(userProfile, null, 2)}</pre>
                </div>
            ) : (
                <div>No profile data available</div>
            )}
        </div>
    );
}

export default ContributePage;