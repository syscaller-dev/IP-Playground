import { useState } from 'react';
import { IPv4Address } from '../lib/IPv4Address';
import { ColoredIP } from './ColoredIP';

export function AccordionPagedSubnetList({ cidr, subnetCount, ip, pageSize }: { cidr: string, subnetCount: number, ip: IPv4Address, pageSize: number }) {
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const totalPages = Math.ceil(subnetCount / pageSize);

  const currentSubnets = isOpen ? ip.getSubnetPage(Number(cidr), page, pageSize) : [];

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
              <a href={`?ip=${subnet.toString()}`} target='_blank' rel='noreferrer' key={i}>
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
