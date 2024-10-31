import mermaid from 'mermaid';
import { useEffect } from 'react';

const ClickSystemExplainer = () => {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: { curve: 'basis' },
            themeVariables: {
                darkMode: true,
                background: '#1F2937',
                primaryColor: '#3B82F6',
                primaryTextColor: '#fff',
                secondaryColor: '#4B5563',
                tertiaryColor: '#6B7280',
            }
        });
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-gray-700">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-center text-white">
                        System Architecture
                    </h2>
                    <p className="text-gray-400 text-center mt-2">
                        How the distributed counter system works
                    </p>
                </div>
                <div className="space-y-8">
                    {/* Mermaid Diagram */}
                    <div className="flex justify-center bg-gray-900/50 p-6 rounded-lg shadow-inner w-full">
                        <div className="w-full ml-12"> {/* This is a hack, don't actually do this */}
                            <pre className="mermaid text-lg w-full">
                                {`sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Click Button
    Frontend->>Backend: Send Click

    alt Rate Limit OK
        Backend->>Frontend: Success
        Frontend->>User: Update Count
    else Rate Limited
        Backend->>Frontend: Error
        Frontend->>User: Show Message
    end`}
                            </pre>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/30 p-6 rounded-lg">
                            <h3 className="font-semibold text-blue-400 mb-2">Rate Limiting</h3>
                            <p className="text-gray-300">
                                Users are limited to 10 clicks every 10 seconds, simulating real world rate limiting.
                            </p>
                        </div>
                        <div className="bg-gray-900/30 p-6 rounded-lg">
                            <h3 className="font-semibold text-blue-400 mb-2">Queue Processing</h3>
                            <p className="text-gray-300">
                                Clicks are processed asynchronously through Redis queues.
                            </p>
                        </div>
                        <div className="bg-gray-900/30 p-6 rounded-lg">
                            <h3 className="font-semibold text-blue-400 mb-2">Real-time Updates</h3>
                            <p className="text-gray-300">
                                Counter updates are broadcasted in real-time to all connected client.
                            </p>
                        </div>
                        <div className="bg-gray-900/30 p-6 rounded-lg">
                            <h3 className="font-semibold text-blue-400 mb-2">Error Handling</h3>
                            <p className="text-gray-300">
                                Comprehensive error handling ensures users receive clear feedback when rate limits are exceeded.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClickSystemExplainer;