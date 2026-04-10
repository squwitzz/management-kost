'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState({
    hostname: '',
    apiUrl: '',
    envVar: '',
    canReachApi: false,
    error: '',
    isNgrok: false,
  });
  const [swInfo, setSwInfo] = useState({
    count: 0,
    caches: 0,
    details: '',
  });

  const checkApi = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const isNgrok = apiUrl.includes('ngrok');
    
    try {
      const response = await fetch(`${apiUrl}/test-auth`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const text = await response.text();
      const isNgrokWarning = text.includes('ngrok') && text.includes('Visit Site');
      
      setInfo({
        hostname: window.location.hostname,
        apiUrl: apiUrl,
        envVar: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
        canReachApi: response.ok && !isNgrokWarning,
        error: isNgrokWarning ? 'Ngrok warning page detected - click "Bypass Ngrok Warning" button below' : (response.ok ? '' : `Status: ${response.status}`),
        isNgrok,
      });
    } catch (err: any) {
      setInfo({
        hostname: window.location.hostname,
        apiUrl: apiUrl,
        envVar: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
        canReachApi: false,
        error: err.message,
        isNgrok,
      });
    }
  };

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const cacheNames = await caches.keys();
      
      setSwInfo({
        count: registrations.length,
        caches: cacheNames.length,
        details: registrations.map((r, i) => `${i + 1}. ${r.scope}`).join('\n'),
      });
    }
  };

  const clearServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
      alert('✅ Service Worker cleared! Reloading...');
      window.location.reload();
    }
  };

  useEffect(() => {
    checkApi();
    checkServiceWorker();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Info</h1>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4">
          <div>
            <p className="text-sm text-outline uppercase font-bold mb-1">Hostname</p>
            <p className="text-lg font-mono">{info.hostname || 'Loading...'}</p>
          </div>

          <div>
            <p className="text-sm text-outline uppercase font-bold mb-1">Environment Variable</p>
            <p className="text-lg font-mono break-all">{info.envVar}</p>
          </div>
          
          <div>
            <p className="text-sm text-outline uppercase font-bold mb-1">API URL (Used)</p>
            <p className="text-lg font-mono break-all">{info.apiUrl}</p>
          </div>
          
          <div>
            <p className="text-sm text-outline uppercase font-bold mb-1">Can Reach API</p>
            <p className={`text-lg font-bold ${info.canReachApi ? 'text-green-600' : 'text-red-600'}`}>
              {info.canReachApi ? '✅ YES' : '❌ NO'}
            </p>
          </div>
          
          {info.error && (
            <div>
              <p className="text-sm text-outline uppercase font-bold mb-1">Error</p>
              <p className="text-sm text-error font-mono break-all">{info.error}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-outline uppercase font-bold mb-1">Service Workers</p>
            <p className="text-lg">{swInfo.count} active</p>
            {swInfo.details && <pre className="text-xs mt-2 bg-surface-container p-2 rounded">{swInfo.details}</pre>}
          </div>

          <div>
            <p className="text-sm text-outline uppercase font-bold mb-1">Caches</p>
            <p className="text-lg">{swInfo.caches} cache(s)</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={clearServiceWorker}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            🗑️ Clear Service Worker
          </button>
          <button
            onClick={() => {
              checkApi();
              checkServiceWorker();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            🔄 Refresh Status
          </button>
        </div>

        {info.isNgrok && !info.canReachApi && (
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">⚠️ Ngrok Warning Page</h2>
            <p className="text-sm text-yellow-900 mb-4">
              Ngrok shows a warning page on first access. You must bypass it before the API will work.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.open(info.apiUrl.replace('/api', ''), '_blank')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold"
              >
                1. Open Ngrok URL & Click "Visit Site"
              </button>
              <button
                onClick={checkApi}
                className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold"
              >
                2. Test Again
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 bg-surface-container-low p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-bold mb-2">If using Ngrok (network access):</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Click "Open Ngrok URL" button above</li>
                <li>Click "Visit Site" on the ngrok warning page</li>
                <li>Come back here and click "Test Again"</li>
                <li>Make sure Laravel server is running: <code className="bg-surface-container px-2 py-1 rounded">php artisan serve</code></li>
              </ol>
            </div>
            
            <div>
              <p className="font-bold mb-2">If using localhost:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Make sure Laravel server is running on port 8000</li>
                <li>Check .env.local has correct URL</li>
                <li>Restart Next.js: <code className="bg-surface-container px-2 py-1 rounded">npm run dev</code></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-surface-container-low p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Access Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>From localhost: http://localhost:3000/debug</li>
            <li>From network: http://YOUR-IP:3000/debug</li>
            <li>Compare results to diagnose network issues</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
