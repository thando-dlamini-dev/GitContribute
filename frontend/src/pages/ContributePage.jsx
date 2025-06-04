import React from 'react';
import useAuthStore from '../stores/authStore';

const ContributePage = () => {
  const { fetchUserTechStack, user, isLoading, techStack, error } = useAuthStore();

  const handleFetchStack = () => {
    if (user?.username) {
      console.log("Fetching techStack for user:", user.username);
      fetchUserTechStack(user.username);
    }
  };

  // Sort tech stack by usage/score (descending)
  const sortedTechStack = techStack 
    ? Object.entries(techStack)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20) // Show top 20 technologies
    : [];

  // Get color for tech badge based on score
  const getTechColor = (score) => {
    if (score >= 10) return 'bg-green-500';
    if (score >= 5) return 'bg-blue-500';
    if (score >= 2) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <div className="p-8 text-center bg-gray-100 rounded-lg">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-start min-h-screen p-6 mt-20'>
      <div className="w-full max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
          Find Your Perfect Repository
        </h1>
        
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome, {user.username}!
              </h2>
              <p className="text-gray-600">
                Let's analyze your tech stack to find the best repositories for you to contribute to.
              </p>
            </div>
            
            <button 
              onClick={handleFetchStack} 
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                  Analyzing...
                </span>
              ) : (
                'Analyze My Tech Stack'
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center">
                <div className="mr-2 text-red-600">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {techStack ? (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Your Tech Stack Analysis
            </h2>
            
            {techStack.length > 0 ? (
              <>
                <p className="mb-6 text-gray-600">
                  Based on your {Object.keys(techStack).length} technologies across your repositories:
                </p>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedTechStack.map(([tech, score]) => (
                    <div 
                      key={tech}
                      className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <span 
                          className={`inline-block w-3 h-3 rounded-full mr-3 ${getTechColor(score)}`}
                        ></span>
                        <span className="font-medium text-gray-800">{tech}</span>
                      </div>
                      <span className="px-2 py-1 text-sm text-gray-500 bg-white rounded">
                        {score}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 mt-6 rounded-lg bg-blue-50">
                  <h3 className="mb-2 font-semibold text-blue-800">Legend:</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 mr-2 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">Expert (10+)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-700">Proficient (5-10)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 mr-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-gray-700">Familiar (2-5)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 mr-2 bg-gray-500 rounded-full"></span>
                      <span className="text-gray-700">Beginner (&lt;2)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button 
                    className="px-8 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    onClick={() => {
                      // This would be your function to find repositories
                      console.log('Finding repositories based on tech stack:', techStack);
                    }}
                  >
                    Find Matching Repositories
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No technologies found in your repositories.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Ready to Discover?
            </h3>
            <p className="text-gray-600">
              Click "Analyze My Tech Stack" to get personalized repository recommendations
            </p>
          </div>
        )}

        {/* Debug information (remove in production) */}
        {techStack && process.env.NODE_ENV === 'development' && (
          <div className="p-4 mt-6 bg-gray-100 rounded-lg">
            <h3 className="mb-2 font-semibold text-gray-800">Debug Info:</h3>
            <pre className="overflow-auto text-xs text-gray-600">
              {JSON.stringify(techStack, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributePage;