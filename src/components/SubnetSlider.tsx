import { useEffect, useState } from 'react';
import { IPv4Address } from '../lib/IPv4Address';

interface SubnetSliderProps {
  ip: IPv4Address;
  onChange: (ip: IPv4Address) => void;
}

export function SubnetSlider({ ip, onChange }: SubnetSliderProps) {
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(event.target.value);
    if (value > 8) value--;
    if (value > 16) value--;
    if (value > 24) value--;
    
    const newIp = new IPv4Address(ip.addr, value);
    onChange(newIp);
  };

  return (
    <div className="relative w-fit" style={{ pointerEvents: isShiftPressed ? 'auto' : 'none' }}>
      <input
        type="range"
        min="0"
        max="35"
        value={ip.cidr + (ip.cidr > 24 ? 3 : ip.cidr > 16 ? 2 : ip.cidr > 8 ? 1 : 0)}
        onChange={handleSliderChange}
        className="net-slider"
      />
    </div>
  );
}