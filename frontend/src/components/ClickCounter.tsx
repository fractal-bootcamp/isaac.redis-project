import { useState, useEffect } from 'react';

const ClickCounter = () => {
    const [clicks, setClicks] = useState(0);
    const [queuedClicks, setQueuedClicks] = useState(0);
    const [error, setError] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchClicks = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clicks`);
            const data = await response.json();
            setClicks(data.totalClicks);
            setQueuedClicks(data.queuedClicks);
        } catch (error) {
            console.error('Error fetching clicks:', error);
        }
    };

    useEffect(() => {
        fetchClicks();
        const interval = setInterval(fetchClicks, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleClick = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/click`, {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 429) {
                    setTimeRemaining(data.timeRemaining);
                    throw new Error(`Rate limit exceeded. Try again in ${data.timeRemaining} seconds`);
                }
                throw new Error(data.message || 'Failed to register click');
            }
            await fetchClicks();
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Global Click Counter
                </h1>
                <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-4">
                        {clicks}
                    </div>
                    <p className="text-gray-600 mb-2">Total Clicks</p>
                    {queuedClicks > 0 && (
                        <p className="text-sm text-gray-500 mb-4">
                            ({queuedClicks} clicks in queue)
                        </p>
                    )}
                    <button
                        onClick={handleClick}
                        disabled={isLoading || (timeRemaining ?? 0) > 0}
                        className="px-6 py-3 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Click Me!'}
                    </button>
                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Limited to 10 clicks per 10 seconds
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClickCounter;