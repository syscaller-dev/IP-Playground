import { IPv4Address } from '../lib/IPv4Address';
import { SubnetList } from './SubnetList.tsx';
import { AddressTypeIcon } from './AddressTypeIcon';
import { EditableIP } from './EditableIP.tsx';
import { BinaryIP } from './BinaryIP.tsx';
import { ColoredIP } from './ColoredIP.tsx';

interface IPDisplayProps {
  ip: IPv4Address;
  onIPChange: (ip: IPv4Address) => void;
}

export function IPDisplay({ ip, onIPChange }: IPDisplayProps) {
  const types = ip.addressTypes;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <EditableIP ip={ip} onChange={onIPChange} />
          <AddressTypeIcon ip={ip} />
        </h2>
        <div className="font-mono text-sm">
          <BinaryIP ip={ip} onChange={onIPChange} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="font-semibold mb-2">Address Information</h3>
          <dl className="space-y-1">
            <div className="grid grid-cols-2">
              <dt className="text-gray-400">Class:</dt>
              <dd>{types.legacyClass}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-400">Type:</dt>
              <dd>{types.isPrivate ? 'Private' : 'Public'}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-400">Schema:</dt>
              <dd>{types.routingSchema}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="font-semibold mb-2">Network Details</h3>
          <dl className="space-y-1">
            {!ip.isP2P && (
              <div>
                <div className="grid grid-cols-2">
                  <dt className="text-gray-400">Network:</dt>
                  <dd>
                    <a
                      className="cursor-pointer hover:opacity-80"
                      href={`/?ip=${ip.networkAddress.toString()}`}
                    >
                      <ColoredIP ip={ip.networkAddress} />
                    </a>
                  </dd>
                  <dt className="text-gray-400">↳</dt>
                  <dd>
                    <BinaryIP ip={ip.networkAddress} />
                  </dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-gray-400">Broadcast:</dt>
                  <dd>
                    <a
                      className="cursor-pointer hover:opacity-80"
                      href={`/?ip=${ip.broadcastAddress.toString()}`}
                    >
                      <ColoredIP ip={ip.broadcastAddress} />
                    </a>
                  </dd>
                  <dt className="text-gray-400">↳</dt>
                  <dd>
                    <BinaryIP ip={ip.broadcastAddress} />
                  </dd>
                </div>
              </div>
            )}
            {ip.cidr <= 31 && (
              <div className="grid grid-cols-2">
                <dt className="text-gray-400">Subnet Mask:</dt>
                <dd>
                  <ColoredIP ip={ip.subnetMask} />
                </dd>
                <dt className="text-gray-400">↳</dt>
                <dd>
                  <BinaryIP ip={ip.subnetMask} />
                </dd>
              </div>
            )}
            <div className="grid grid-cols-2">
              <dt className="text-gray-400">Hosts:</dt>
              <dd>{ip.hostCount}</dd>
            </div>
          </dl>
        </div>
      </div>

      <SubnetList ip={ip} />
    </div>
  );
}