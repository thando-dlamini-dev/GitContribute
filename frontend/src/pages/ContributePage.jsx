import React from 'react';
import useAuthStore from '../stores/authStore';

const ContributePage = () => {
  const { getUserProfile, user, isLoading, userProfile, error } = useAuthStore();

  const handleFetchProfile = () => {
    if (user?.id) {
      console.log("Fetching profile for user:", user.id);
      getUserProfile(user.id);
    }
  };

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen mt-20'>
      <h1>Contribute Page</h1>
      
      <div>
        <button 
          onClick={handleFetchProfile} 
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px 0',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : 'Fetch User Profile'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {userProfile ? (
        <div>
          <h2>User Profile:</h2>
          <pre>{JSON.stringify(userProfile, null, 2)}</pre>
        </div>
      ) : (
        <div>Click the button to load profile data</div>
      )}
    </div>
  );
};

export default ContributePage;