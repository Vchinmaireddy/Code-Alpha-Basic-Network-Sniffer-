import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simulation Logic: Packet Generator
  const protocols = ["TCP", "UDP", "ICMP", "HTTP", "DNS", "TLS"];
  const ipPrefixes = ["192.168.1.", "10.0.0.", "172.16.0."];

  const generatePacket = () => {
    const src = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)] + Math.floor(Math.random() * 254 + 1);
    const dst = ipPrefixes[Math.floor(Math.random() * ipPrefixes.length)] + Math.floor(Math.random() * 254 + 1);
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const srcPort = Math.floor(Math.random() * 65535);
    const dstPort = [80, 443, 22, 53, 8080][Math.floor(Math.random() * 5)] || Math.floor(Math.random() * 65535);
    const length = Math.floor(Math.random() * 1460 + 40);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      source: src,
      destination: dst,
      protocol,
      srcPort,
      dstPort,
      length,
      payload: Buffer.from(Math.random().toString(36).repeat(3)).toString('hex'),
      summary: `${protocol} Packet from ${src}:${srcPort} -> ${dst}:${dstPort}`
    };
  };

  // API Endpoints
  app.get("/api/packets", (req, res) => {
    const count = parseInt(req.query.count as string) || 10;
    const packets = Array.from({ length: count }, generatePacket);
    res.json(packets);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
