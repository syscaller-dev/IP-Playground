import { useState } from 'react';
import { IPv4Address } from './lib/IPv4Address';
import { IPInput } from './components/IPInput';
import { IPDisplay } from './components/IPDisplay';
import { SubnetSlider } from './components/SubnetSlider';

function App() {
  const url = new URL(window.location.href);
  const ipString = url.searchParams.get('ip');
  const [ip, setIp] = useState(() => IPv4Address.fromString(ipString || '127.0.0.1/8'));
  // Get the IP address from the URL
  

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-1 flex items-center justify-center">
              <IPInput onIPChange={setIp} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IPDisplay ip={ip} onIPChange={setIp} />
      </main>
    </div>
  );
}

export default App;