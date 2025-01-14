import { IPv4Address } from '../lib/IPv4Address';
import { ColoredIP } from './ColoredIP.tsx';

export function EditableIP({ ip, onChange }: { ip: IPv4Address; onChange: (ip: IPv4Address) => void }) {
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
