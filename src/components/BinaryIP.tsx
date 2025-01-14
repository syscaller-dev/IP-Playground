import { IPv4Address } from '../lib/IPv4Address';
import { SubnetSlider } from './SubnetSlider';

export function BinaryIP({ ip, onChange }: { ip: IPv4Address; onChange?: (ip: IPv4Address) => void }) {
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
