import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function ExternalProject({ url, title }) {
    const [loadError, setLoadError] = useState(false);

    const handleOpenExternal = () => {
        window.open(url, '_blank');
    };

    const handleRefresh = () => {
        setLoadError(false);
        const iframe = document.getElementById(`iframe-${url}`);
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-dark-800 rounded-full text-xs text-dark-400 font-mono border border-dark-700">
                        {url}
                    </span>
                    <button
                        onClick={handleRefresh}
                        className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-gray-400 transition-colors"
                        title="Refresh Embedded Node"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleOpenExternal}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Restore Ext
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-dark-900 rounded-xl border border-dark-700 overflow-hidden relative shadow-2xl flex flex-col"
            >
                <div className="absolute inset-0 bg-dark-800 flex items-center justify-center -z-10 animate-pulse">
                    <span className="text-dark-500 font-mono">Loading node data...</span>
                </div>

                {loadError && (
                    <div className="absolute inset-0 bg-dark-900/90 z-20 flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Connection Refused (CORS or HTTP setup)</h3>
                        <p className="text-dark-300 max-w-md text-sm mb-6">
                            Browser security policies prevented {title} from loading within an iframe.
                            This commonly happens if the target server restricts iframe embedding (X-Frame-Options) or is running on HTTP while this app is HTTPS.
                        </p>
                        <button
                            onClick={handleOpenExternal}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Open securely in a new tab instead
                        </button>
                    </div>
                )}

                <iframe
                    id={`iframe-${url}`}
                    src={url}
                    onError={() => setLoadError(true)}
                    // Set a timeout to check if iframe fails silently (many CORS errors don't trigger onError for security reasons)
                    onLoad={(e) => {
                        // Cross-origin checks to detect frame load errors are limited, 
                        // but we reset the error state just in case it recovered
                        try {
                            // Usually accessing contentDocument of cross-origin iframe throws error
                            // We just let it render. If it's a white screen, user can use "Open in Ext" button.
                        } catch (err) {
                            console.warn("Iframe loaded standard cross-origin", err);
                        }
                    }}
                    className="w-full h-full border-none z-10 relative bg-transparent"
                    title={title}
                    allow="clipboard-read; clipboard-write; microphone; camera; display-capture"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </motion.div>
        </div>
    );
}
