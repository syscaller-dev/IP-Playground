import { useState, useMemo, useCallback } from 'react';
import { IPv4Address } from '../lib/IPv4Address';
import { Network } from 'lucide-react';
import { AccordionPagedSubnetList } from './AccordionPagedSubnetList';

export function SubnetList({ ip }: { ip: IPv4Address }) {
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
