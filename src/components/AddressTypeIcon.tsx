import { IPv4Address } from '../lib/IPv4Address';
import { Globe2, Lock, Unlock, Wifi, Radio, Laptop } from 'lucide-react';

export function AddressTypeIcon({ ip }: { ip: IPv4Address }) {
  const types = ip.addressTypes;

  return (
    <div className="inline-flex gap-2 ml-4 items-center">
      {types.isPrivate ? (
        <div title='Private IP Address'>
          <Lock className="w-5 h-5 text-orange-500" />
        </div>
      ) : (
        <div title='Public IP Address'>
          <Unlock className="w-5 h-5 text-blue-500" />
        </div>
      )}
      {types.isLoopback && (
        <div title='Loopback Address'>
          <Radio className="w-5 h-5 text-purple-500" />
        </div>
      )}
      {types.isMulticast ? (
        <div title='Multicast Address'>
          <Wifi className="w-5 h-5 text-green-500" />
        </div>
      ) : (
        <div title='Unicast Address'>
          <Laptop className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div title={`Class ${types.legacyClass} - ${types.routingSchema}`}>
        <Globe2
          className="w-5 h-5 text-gray-400"
        />
      </div>
    </div>
  );
}
