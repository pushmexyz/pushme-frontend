'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface UsernameSetupProps {
  wallet: string | null;
  currentUsername: string | null | undefined;
  onUsernameSet: (username: string | null) => void;
}

export default function UsernameSetup({
  wallet,
  currentUsername,
  onUsernameSet,
}: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!wallet) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAnonymous && !username.trim()) {
      setError('Please enter a username or check anonymous');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/save-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet,
          username: isAnonymous ? null : username.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save username');
      }

      onUsernameSet(isAnonymous ? null : username.trim());
      if (!isAnonymous) {
        setUsername('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUsername !== null && currentUsername !== undefined) {
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-neutral-800 px-4 py-2">
          <span className="text-sm font-body font-medium text-neutral-900 dark:text-neutral-50">
            Username: <span className="font-semibold text-accent">{currentUsername}</span>
          </span>
        </div>
        <button
          onClick={() => {
            setIsAnonymous(true);
            handleSubmit(new Event('submit') as any);
          }}
          className="rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-body text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-accent transition-all"
        >
          Go Anonymous
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-body font-medium text-neutral-900 dark:text-neutral-50">
            Choose Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isAnonymous || isLoading}
            placeholder="Enter your username"
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 font-body text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 disabled:bg-neutral-100 dark:disabled:bg-neutral-700 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="anonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-neutral-200 dark:border-neutral-700 text-accent focus:ring-2 focus:ring-accent transition-all"
          />
          <label htmlFor="anonymous" className="text-sm font-body text-neutral-700 dark:text-neutral-300">
            Send anonymously
          </label>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || (!isAnonymous && !username.trim())}
          className="w-full rounded-lg bg-neutral-900 dark:bg-neutral-50 px-4 py-2 font-body font-semibold text-white dark:text-neutral-900 transition-all hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 disabled:cursor-not-allowed disabled:bg-neutral-400 dark:disabled:bg-neutral-600"
        >
          {isLoading ? 'Saving...' : 'Set Username'}
        </button>
      </form>
    </div>
  );
}

