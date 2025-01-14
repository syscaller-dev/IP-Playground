import { IPv4AddressTypes } from '../types';

export class IPv4Address {
    private _addr: number;
    private _cidr: number;

    constructor(addr: number, cidr?: number) {
        if (addr >= 2 ** 32) throw new TypeError('Address needs to be 4 Octets');
        
        if (cidr === undefined) {
            cidr = 8 + 8 * ((addr >>> 31) + Number((addr >>> 30) == 0b11) + Number((addr >>> 29) == 0b111));
        }
        
        if (cidr < 0 || cidr > 32) throw new TypeError('Invalid CIDR');
        
        this._addr = addr;
        this._cidr = cidr;
    }

    valueOf(): number {
        return this._addr;
    }

    toString(showcidr?: boolean): string {
        const octets = this.toArray();
        let addressString = octets.join('.');
        if (showcidr || (this._cidr && showcidr === undefined)) {
            addressString += `/${this._cidr}`;
        }
        return addressString;
    }

    toArray(): number[] {
        let addrNumber = this._addr;
        const octets: number[] = [];
        for (let index = 0; index < 4; index++, addrNumber >>= 8) {
            octets.push(addrNumber & 255);
        }
        return octets.reverse();
    }

    includes(ipaddr: IPv4Address): boolean {
        if (this.cidr > ipaddr.cidr) return false;
        const subnetMask = this.subnetMask;
        return !((this._addr ^ ipaddr.addr) & subnetMask.addr);
    }

    *generateHosts(): Generator<IPv4Address> {
        const addressCount = this.addressCount;
        const hasBrcAndNet = Number(!this.isP2P);
        for (let index = hasBrcAndNet; index < addressCount - hasBrcAndNet; index++) {
            const addr = this._addr + index;
            yield new IPv4Address(addr, this._cidr);
        }
    }

    get addr(): number {
        return this._addr;
    }

    get cidr(): number {
        return this._cidr;
    }

    set cidr(cidr: number) {
        if (cidr < 0 || cidr > 32) throw new TypeError('Invalid CIDR');
        this._cidr = cidr;
    }

    get subnetMask(): IPv4Address {
        return new IPv4Address(IPv4Address.cidrToMask(this._cidr), this._cidr);
    }

    get networkAddress(): IPv4Address {
        const netaddr = this._addr & this.subnetMask.addr;
        return new IPv4Address(netaddr, this._cidr);
    }

    get broadcastAddress(): IPv4Address {
        const brcaddr = (0xFFFFFFFF ^ this.subnetMask.addr) | this.addr;
        return new IPv4Address(brcaddr, this._cidr);
    }

    get addressCount(): number {
        return 2 ** (32 - this._cidr);
    }

    get hostCount(): number {
        if (this.cidr > 30) return this.addressCount;
        return this.addressCount - 2;
    }

    get isP2P(): boolean {
        return [30, 31].includes(this._cidr);
    }

    get isLoopback(): boolean {
        return IPv4Address.loopbackNet.includes(this);
    }

    get isMulticast(): boolean {
        return IPv4Address.multicastNet.includes(this);
    }

    get isPrivate(): boolean {
        return (
            IPv4Address.privateClassANet.includes(this) ||
            IPv4Address.privateClassBNet.includes(this) ||
            IPv4Address.privateClassCNet.includes(this)
        );
    }

    get isNetAddr(): boolean {
        return this.valueOf() === this.networkAddress.valueOf();
    }

    get routingSchema(): string {
        let routingSchema = 'Unicast';
        if (this.isMulticast) routingSchema = 'Multicast';
        else if (this.cidr === 32) routingSchema = 'Host';
        else if (this.cidr > 30) routingSchema = 'Point-to-Point';
        else if (this.isNetAddr) routingSchema = 'Network';
        else if (this.valueOf() === this.broadcastAddress.valueOf())
            routingSchema = 'Broadcast';
        if (this.cidr === 30) routingSchema += ' Point-to-Point';
        return routingSchema;
    }

    get legacyClass(): string {
        const firstOctet = this._addr >>> 24;
        if (firstOctet < 128) return 'A';
        if (firstOctet < 192) return 'B';
        if (firstOctet < 224) return 'C';
        if (firstOctet < 240) return 'D';
        return 'E';
    }

    get addressTypes(): IPv4AddressTypes {
        return {
            legacyClass: this.legacyClass,
            isPrivate: this.isPrivate,
            routingSchema: this.routingSchema,
            isNetAddr: this.isNetAddr,
            isLoopback: this.isLoopback,
            isP2P: this.isP2P,
            isMulticast: this.isMulticast
        };
    }

    static maskToCIDR(subnetMask: number): number {
        let cidr = 0;
        for (let index = 0; index < 32; index++, subnetMask >>= 1) {
            const bit = subnetMask & 1;
            if (bit) cidr++;
            else if (cidr) throw new TypeError('Invalid mask');
        }
        return cidr;
    }

    static cidrToMask(cidr: number): number {
        if (cidr === 32) return 0xFFFFFFFF;
        return ((1 << cidr) - 1) << (32 - cidr);
    }

    static fromString(IPAddrString: string, SubnetString?: string): IPv4Address {
        const ipregex = /(\d+)\.(\d+)\.(\d+)\.(\d+)(?:\/(\d+))?/;
        const match = IPAddrString.match(ipregex);
        if (!match) throw new TypeError('Invalid IP-Address');

        const [, ...matchGroups] = match;
        const ipSegments = matchGroups.slice(0, 4).map(Number);
        const addrNumber = ipSegments.reduce((acc, val, index) => {
            if (val > 255 || val < 0)
                throw new TypeError(`IP-Address is invalid at Octet ${index}`);
            return (acc << 8) | val;
        }, 0);

        let CIDR = matchGroups[4] ? Number(matchGroups[4]) : undefined;
        if (!CIDR && SubnetString) {
            const subnet = SubnetString.split('.')
                .map(Number)
                .reduce((acc, val) => (acc << 8) + val, 0);
            CIDR = IPv4Address.maskToCIDR(subnet);
        }

        return new IPv4Address(addrNumber, CIDR);
    }

    static privateClassANet = IPv4Address.fromString('10.0.0.0/8');
    static privateClassBNet = IPv4Address.fromString('172.16.0.0/12');
    static privateClassCNet = IPv4Address.fromString('192.168.0.0/16');
    static multicastNet = IPv4Address.fromString('224.0.0.0/4');
    static loopbackNet = IPv4Address.fromString('127.0.0.0/8');
}