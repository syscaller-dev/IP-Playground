import { useState } from 'react';
import { Network } from 'lucide-react';
import { IPv4Address } from '../lib/IPv4Address';

interface IPInputProps {
  onIPChange: (ip: IPv4Address) => void;
}

export function IPInput({ onIPChange }: IPInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ip = IPv4Address.fromString(input);
      onIPChange(ip);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid IP address');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Network className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter IP address (e.g., 192.168.1.1/24)"
          className={`w-full pl-10 pr-4 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 text-gray-100 placeholder-gray-400 ${
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-600 focus:ring-blue-500/20'
          }`}
        />
      </div>
      {error && (
        <div className="absolute mt-1 text-sm text-red-400">{error}</div>
      )}
    </form>
  );
}