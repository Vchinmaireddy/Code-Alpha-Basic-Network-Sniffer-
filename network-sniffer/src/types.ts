export interface Packet {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  srcPort: number;
  dstPort: number;
  length: number;
  payload: string;
  summary: string;
}

export type ProtocolFilter = "ALL" | "TCP" | "UDP" | "ICMP" | "HTTP" | "DNS" | "TLS";
