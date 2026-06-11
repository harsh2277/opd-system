import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

export function TVDisplayDebug() {
  const { tokens, currentToken, doctors } = useApp();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    const checkLocalStorage = () => {
      setLocalStorageData({
        tokens: localStorage.getItem('opd-tokens'),
        doctors: localStorage.getItem('opd-doctors'),
        currentToken: localStorage.getItem('opd-current-token'),
        sessionStart: localStorage.getItem('opd-session-start'),
      });
    };

    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">TV Display Debug Info</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[var(--neutral-200)]">
          <h2 className="text-xl font-bold mb-4">Context State</h2>
          <div className="space-y-2">
            <p><strong>Tokens Count:</strong> {tokens.length}</p>
            <p><strong>Current Token:</strong> {currentToken || 'None'}</p>
            <p><strong>Doctors Count:</strong> {doctors.length}</p>
            <p><strong>On Duty Doctors:</strong> {doctors.filter(d => d.status === 'on-duty').length}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold mb-2">Tokens:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(tokens, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[var(--neutral-200)]">
          <h2 className="text-xl font-bold mb-4">LocalStorage State</h2>
          <div className="space-y-2">
            <div>
              <h3 className="font-bold">Tokens:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                {localStorageData.tokens || 'null'}
              </pre>
            </div>
            <div>
              <h3 className="font-bold">Doctors:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                {localStorageData.doctors || 'null'}
              </pre>
            </div>
            <div>
              <h3 className="font-bold">Current Token:</h3>
              <p className="bg-gray-100 p-2 rounded text-xs">{localStorageData.currentToken || 'null'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to the main window and issue some tokens (Dashboard → Begin Check-in)</li>
          <li>This debug page will update automatically</li>
          <li>If tokens show here but not on TV Display, there's a rendering issue</li>
          <li>If tokens don't show here, they're not being saved to localStorage</li>
        </ol>
      </div>

      <div className="mt-6">
        <a
          href="/display"
          target="_blank"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-600"
        >
          Open TV Display in New Window
        </a>
      </div>
    </div>
  );
}
