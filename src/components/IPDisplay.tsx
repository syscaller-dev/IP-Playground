import { IPv4Address } from '../lib/IPv4Address';
import { SubnetSlider } from './SubnetSlider';
import { Globe2, Lock, Unlock, Network, Wifi, Radio, Laptop } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

interface IPDisplayProps {
  ip: IPv4Address;
  onIPChange: (ip: IPv4Address) => void;
}

function AddressTypeIcon({ ip }: { ip: IPv4Address }) {
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

function EditableIP({ ip, onChange }: { ip: IPv4Address; onChange: (ip: IPv4Address) => void }) {
  const handleClick = () => {
    const input = prompt('Enter new IP address:', ip.toString());
    if (input) {
      try {
        const newIp = IPv4Address.fromString(input);
        onChange(newIp);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Invalid IP address');
      }
    }
  };

  return (
    <span className="cursor-pointer hover:opacity-80" onClick={handleClick}>
      <ColoredIP ip={ip} />
    </span>
  );
}

function SubnetList({ ip }: { ip: IPv4Address }) {
  const maxCidr = 32; // Show all possible CIDRs
  const pageSize = 8; // Display a maximum of 8 subnets per CIDR

  const subnetsByCidr = useMemo(() => {
    const subnets: { [cidr: number]: number } = {};
    for (let cidr = ip.cidr + 1; cidr <= maxCidr; cidr++) {
      subnets[cidr] = 2 ** (cidr - ip.cidr);
    }
    return subnets;
  }, [ip]);

  if (Object.keys(subnetsByCidr).length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Network className="w-5 h-5" />
        Subnets
      </h3>
      {Object.entries(subnetsByCidr).map(([cidr, subnetCount]) => (
        <AccordionPagedSubnetList key={cidr} cidr={cidr} subnetCount={subnetCount} ip={ip} pageSize={pageSize} />
      ))}
    </div>
  );
}

function AccordionPagedSubnetList({ cidr, subnetCount, ip, pageSize }: { cidr: string, subnetCount: number, ip: IPv4Address, pageSize: number }) {
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const totalPages = Math.ceil(subnetCount / pageSize);

  const generateSubnets = useCallback(() => {
    const subnets: IPv4Address[] = [];
    const baseAddr = ip.networkAddress.addr;
    const subnetSize = 2 ** (32 - Number(cidr));

    for (let i = 0; i < subnetCount; i++) {
      const subnetAddr = baseAddr + (i * subnetSize);
      subnets.push(new IPv4Address(subnetAddr, Number(cidr)));
    }

    return subnets;
  }, [ip, cidr, subnetCount]);

  const currentSubnets = useMemo(() => {
    if (!isOpen) return [];
    const subnets = generateSubnets();
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return subnets.slice(startIndex, endIndex);
  }, [isOpen, page, pageSize, generateSubnets]);

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div>
      <h4 className="font-semibold mb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        CIDR /{cidr} ({subnetCount} subnets / {Math.pow(2, 32 - Number(cidr)) - 2} hosts) {isOpen ? '▲' : '▼'}
      </h4>
      {isOpen && (
        <div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {currentSubnets.map((subnet, i) => (
              <a href={`/?ip=${subnet.toString()}`} target='_blank' rel='noreferrer' key={i}>
                <div
                  key={i}
                  className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-gray-600 cursor-pointer"
                >
                  <div className="font-mono">
                    {page * pageSize + i + 1}. <ColoredIP ip={subnet} />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {subnet.hostCount} hosts
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={page === 0}
            >
              Previous
            </button>
            <button
              className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
              onClick={handleNextPage}
              disabled={page === totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PagedSubnetList({ cidr, subnets, pageSize }: { cidr: string, subnets: IPv4Address[], pageSize: number }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(subnets.length / pageSize);

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const currentSubnets = subnets.slice(startIndex, endIndex);

  return (
    <div>
      <h4 className="font-semibold mb-2">CIDR /{cidr}</h4>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {currentSubnets.map((subnet, i) => (
          <a href={`/?ip=${subnet.toString()}`} target='_blank' rel='noreferrer' key={i}>
            <div
              key={i}
              className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-gray-600 cursor-pointer"
            >
              <div className="font-mono">
                <ColoredIP ip={subnet} />
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {subnet.hostCount} hosts
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <button
          className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handlePrevPage}
          disabled={page === 0}
        >
          Previous
        </button>
        <button
          className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handleNextPage}
          disabled={page === totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ColoredIP({ ip }: { ip: IPv4Address }) {
  const octets = ip.toArray();
  const cidr = ip.cidr;

  return (
    <span className="font-mono">
      {octets.map((octet, i) => {
        const remainingCidr = cidr - i * 8;
        let className = '';

        if (remainingCidr >= 8) className = 'net-color';
        else if (remainingCidr <= 0) className = 'host-color';
        else className = 'subnet-color';

        return (
          <span key={i}>
            <span className={className}>{octet}</span>
            {i < 3 && '.'}
          </span>
        );
      })}
      {cidr < 32 && (
        <span>
          /<span className="net-color">{cidr}</span>
        </span>
      )}
    </span>
  );
}

function BinaryIP({ ip, onChange }: { ip: IPv4Address; onChange?: (ip: IPv4Address) => void }) {
  const octets = ip.toArray();
  const cidr = ip.cidr;

  return (
    <div className="relative font-mono text-sm">
      {onChange && <SubnetSlider ip={ip} onChange={onChange} />}
      {octets.map((octet, i) => {
        const binary = octet.toString(2).padStart(8, '0');
        const remainingCidr = cidr - i * 8;

        if (remainingCidr >= 8) {
          return (
            <span key={i}>
              <span className="net-color">{binary}</span>
              {i < 3 && '.'}
            </span>
          );
        } else if (remainingCidr <= 0) {
          return (
            <span key={i}>
              <span className="host-color">{binary}</span>
              {i < 3 && '.'}
            </span>
          );
        } else {
          const networkPart = binary.slice(0, remainingCidr);
          const hostPart = binary.slice(remainingCidr);
          return (
            <span key={i}>
              <span className="net-color">{networkPart}</span>
              <span className="host-color">{hostPart}</span>
              {i < 3 && '.'}
            </span>
          );
        }
      })}
    </div>
  );
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
              <>
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
              </>
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