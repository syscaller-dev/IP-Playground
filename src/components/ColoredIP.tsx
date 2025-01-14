import { IPv4Address } from '../lib/IPv4Address';

export function ColoredIP({ ip }: { ip: IPv4Address }) {
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
