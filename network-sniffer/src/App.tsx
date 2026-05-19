/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Shield, 
  Search, 
  Play, 
  Square, 
  Trash2, 
  Cpu, 
  Globe, 
  Zap, 
  Info,
  ChevronRight,
  Terminal,
  BarChart3,
  Dna
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Packet, ProtocolFilter } from './types';

// AI Intelligence
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [theme, setTheme] = useState<"cyber" | "dark" | "light">("cyber");
  const [isRunning, setIsRunning] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [filter, setFilter] = useState<ProtocolFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);

  const packetsEndRef = useRef<HTMLDivElement>(null);

  // Initialize stats history
  useEffect(() => {
    const initialStats = Array.from({ length: 20 }, (_, i) => ({
      time: i,
      load: 0,
    }));
    setStats(initialStats);
  }, []);

  // Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/packets?count=${Math.floor(Math.random() * 3) + 1}`);
          const newPackets: Packet[] = await res.json();
          
          setPackets(prev => {
            const updated = [...newPackets, ...prev].slice(0, 500);
            return updated;
          });

          setStats(prev => {
            const next = [...prev.slice(1), { time: Date.now(), load: newPackets.length * 10 + Math.random() * 20 }];
            return next;
          });
        } catch (err) {
          console.error("Fetch failed", err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const filteredPackets = useMemo(() => {
    return packets.filter(p => {
      const matchesProtocol = filter === "ALL" || p.protocol === filter;
      const matchesSearch = 
        p.source.includes(searchQuery) || 
        p.destination.includes(searchQuery) || 
        p.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProtocol && matchesSearch;
    });
  }, [packets, filter, searchQuery]);

  const clearCapture = () => {
    setPackets([]);
    setSelectedPacket(null);
    setAiAnalysis(null);
  };

  const analyzeWithAI = async (packet: Packet) => {
    if (!process.env.GEMINI_API_KEY) {
      setAiAnalysis("Gemini API key missing. Please set GEMINI_API_KEY in secrets.");
      return;
    }
    
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const prompt = `Analyze this network packet and explain it to a beginner network student. 
      Protocol: ${packet.protocol}
      Source: ${packet.source}:${packet.srcPort}
      Destination: ${packet.destination}:${packet.dstPort}
      Length: ${packet.length} bytes
      Payload (Hex): ${packet.payload}
      
      Provide details on its representation, security implications, and a one-sentence takeaway.`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      setAiAnalysis(response.text || "No analysis provided.");
    } catch (err) {
      console.error("AI Analysis error:", err);
      setAiAnalysis("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProtocolColor = (proto: string) => {
    switch (proto) {
      case "TCP": return "text-accent-primary bg-accent-primary/10 border-accent-primary/20";
      case "UDP": return "text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20";
      case "ICMP": return "text-status-amber bg-status-amber/10 border-status-amber/20";
      case "HTTP": return "text-status-emerald bg-status-emerald/10 border-status-emerald/20";
      case "DNS": return "text-status-amber bg-status-amber/10 border-status-amber/20";
      case "TLS": return "text-status-rose bg-status-rose/10 border-status-rose/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className={cn(
      `theme-${theme}`,
      "relative min-h-screen h-screen w-full bg-theme-bg text-theme-text font-sans overflow-hidden flex flex-col p-4 gap-4 selection:bg-accent-primary/30"
    )}>
      {theme === "cyber" && <div className="scanline pointer-events-none" />}
      
      {/* Header Section */}
      <header className="flex justify-between items-center px-4 py-3 console-panel shrink-0 border-l-4 border-l-accent-primary">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-accent-primary/20 text-accent-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              NetPulse <span className="text-[10px] text-accent-primary opacity-80 opacity-60">CONSOLE_v1.2.0</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-40">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> ETH0_PROMISCUOUS</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="flex items-center gap-1 uppercase tracking-tighter">Status: [ {isRunning ? "CAPTURING" : "PAUSED"} ]</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-theme-secondary/50 p-1 rounded-md border border-theme-border/30 mr-2">
            {(["cyber", "dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "px-2 py-1 text-[9px] uppercase font-bold tracking-tighter rounded transition-all",
                  theme === t ? "bg-accent-primary text-theme-bg" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 px-4 bg-theme-secondary/50 rounded-md border border-theme-border/30">
             <div className="flex flex-col">
               <span className="mono-label text-[8px]">Inbound Flux</span>
               <span className="text-xs font-mono font-bold text-accent-primary">{stats[stats.length - 1]?.load.toFixed(1)} kb/s</span>
             </div>
             <div className="h-6 w-1px bg-theme-border/50" />
             <div className="flex flex-col">
               <span className="mono-label text-[8px]">Total Frames</span>
               <span className="text-xs font-mono font-bold">{packets.length.toLocaleString()}</span>
             </div>
          </div>

          <div className="flex gap-1">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={cn(
                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded relative group overflow-hidden",
                isRunning 
                  ? "bg-status-rose/10 text-status-rose border border-status-rose/30 hover:bg-status-rose/20" 
                  : "bg-accent-primary/10 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/20"
              )}
            >
              {isRunning ? "Suspend" : "Initialize"}
              <div className="absolute inset-0 bg-white/5 translate-y-full hover:translate-y-0 transition-transform" />
            </button>
            <button 
              onClick={clearCapture}
              className="px-5 py-2 border border-theme-border/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:border-slate-400 hover:text-slate-300 transition-all rounded"
            >
              Flush
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Control Column */}
        <aside className="w-60 flex flex-col gap-4 shrink-0">
          <div className="console-panel p-4 flex flex-col gap-6 flex-1 overflow-hidden">
            <section>
              <h3 className="mono-label mb-3 flex items-center gap-2">
                <Shield className="w-3 h-3 text-accent-primary" />
                Security Alerts
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                {packets.length > 5 && (
                  <div className="p-2 border border-status-rose/20 bg-status-rose/5 rounded text-[10px] leading-tight flex items-start gap-2">
                    <Zap className="w-3 h-3 text-status-rose shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-status-rose uppercase">Port Scan Detected</p>
                      <p className="opacity-60">High frequency TCP attempts on block 192.168.1.0/24</p>
                    </div>
                  </div>
                )}
                <div className="p-2 border border-theme-border/50 rounded text-[10px] leading-tight flex items-start gap-2 opacity-50">
                  <Info className="w-3 h-3 shrink-0" />
                  <p>Baseline established for eth0 interface.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mono-label mb-3">Protocol Filter</h3>
              <div className="grid grid-cols-2 gap-1">
                {["ALL", "TCP", "UDP", "ICMP", "HTTP", "DNS", "TLS"].map(proto => (
                  <button
                    key={proto}
                    onClick={() => setFilter(proto as ProtocolFilter)}
                    className={cn(
                      "px-2 py-2 text-left font-mono text-[10px] uppercase transition-all border rounded",
                      filter === proto 
                        ? "bg-accent-primary/10 border-accent-primary/50 text-accent-primary font-bold" 
                        : "bg-theme-bg/50 border-theme-border/30 text-slate-500 hover:bg-theme-secondary/50"
                    )}
                  >
                    {proto}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-auto">
               <h3 className="mono-label mb-2">Live Waveform</h3>
               <div className="h-20 w-full opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats}>
                    <defs>
                      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="load" stroke="var(--color-accent-primary)" fill="url(#glow)" isAnimationActive={false} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </section>
          </div>
        </aside>

        {/* Center Grid Area */}
        <div className="flex-1 flex flex-col overflow-hidden console-panel bg-theme-bg/80 border-theme-border/20">
          <div className="grid grid-cols-[80px_1fr_1fr_60px_60px_80px_1.5fr] gap-0 bg-theme-surface/50 border-b border-theme-border/50 text-[10px] font-mono uppercase tracking-widest px-4 py-2 text-slate-500 shrink-0">
            <div>Type</div>
            <div>Source</div>
            <div>Destination</div>
            <div className="text-center">S_Port</div>
            <div className="text-center">D_Port</div>
            <div className="text-center">Size</div>
            <div className="pl-4">Summary</div>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[11px] scrollbar-thin scrollbar-thumb-theme-border/50">
            {filteredPackets.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPacket(p)}
                className={cn(
                  "grid grid-cols-[80px_1fr_1fr_60px_60px_80px_1.5fr] gap-0 w-full text-left transition-all border-b border-theme-border/10 py-2.5 px-4 group",
                  selectedPacket?.id === p.id 
                    ? "bg-accent-primary/10 text-accent-primary" 
                    : "hover:bg-theme-secondary/40 text-slate-400 hover:text-slate-200"
                )}
              >
                <div className="flex items-center">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase leading-none",
                    getProtocolColor(p.protocol)
                  )}>
                    {p.protocol}
                  </span>
                </div>
                <div className="truncate pr-4 text-slate-300">{p.source}</div>
                <div className="truncate pr-4 text-slate-300">{p.destination}</div>
                <div className="text-center opacity-40">{p.srcPort}</div>
                <div className="text-center opacity-40">{p.dstPort}</div>
                <div className="text-center font-bold">{p.length}b</div>
                <div className="pl-4 opacity-70 truncate italic group-hover:opacity-100 transition-opacity">{p.summary}</div>
              </button>
            ))}
            {filteredPackets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4">
                 <Dna className="w-16 h-16 animate-pulse" />
                 <p className="font-mono uppercase tracking-widest text-xs">Waiting for inbound frames...</p>
              </div>
            )}
            <div ref={packetsEndRef} />
          </div>
        </div>

        {/* Right Info Panel */}
        <AnimatePresence>
          {selectedPacket && (
            <motion.aside 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="w-96 flex flex-col gap-4 shrink-0 overflow-y-auto scrollbar-hide"
            >
              <div className="console-panel p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-theme-border/30 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accent-primary" />
                    Inspector
                  </h3>
                  <button onClick={() => setSelectedPacket(null)} className="text-slate-500 hover:text-white transition-colors">
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </div>

                <div className="space-y-4">
                  <section>
                    <h4 className="mono-label text-[9px] mb-2">Protocol Stack</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 p-2 bg-theme-bg border border-theme-border/30 rounded">
                        <span className="w-8 text-center text-[9px] font-bold text-slate-600">L4</span>
                        <span className="text-[11px] font-mono text-accent-primary">{selectedPacket.protocol} (Ports {selectedPacket.srcPort} → {selectedPacket.dstPort})</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-theme-bg border border-theme-border/30 rounded">
                        <span className="w-8 text-center text-[9px] font-bold text-slate-600">L3</span>
                        <span className="text-[11px] font-mono text-slate-400">IPv4: {selectedPacket.source} → {selectedPacket.destination}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-theme-bg border border-theme-border/30 rounded">
                        <span className="w-8 text-center text-[9px] font-bold text-slate-600">L2</span>
                        <span className="text-[11px] font-mono text-slate-500 opacity-50 italic">Ethernet II (IEEE 802.3)</span>
                      </div>
                    </div>
                  </section>

                  <section>
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="mono-label text-[9px]">Hex Dump</h4>
                       <span className="text-[9px] font-mono opacity-30 uppercase">{selectedPacket.length} Bytes Loaded</span>
                     </div>
                     <div className="bg-theme-bg/50 p-2 border border-theme-border/30 rounded font-mono text-[9px] leading-tight text-slate-400 break-all select-all">
                        {selectedPacket.payload.match(/.{1,32}/g)?.map((chunk, i) => (
                          <div key={i} className="mb-0.5 whitespace-pre">
                            <span className="text-accent-primary/30 mr-3">{(i * 16).toString(16).padStart(4, '0')}</span>
                            {chunk.match(/.{2}/g)?.join(' ')}
                          </div>
                        ))}
                     </div>
                  </section>

                  <section className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="mono-label text-[9px]">AI Analysis</h4>
                      {!aiAnalysis && (
                        <button 
                          onClick={() => analyzeWithAI(selectedPacket)}
                          disabled={isAnalyzing}
                          className="flex items-center gap-1 px-2 py-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/50 text-[9px] font-bold uppercase rounded hover:bg-accent-primary/20 transition-all disabled:opacity-50"
                        >
                          <Zap className={cn("w-3 h-3 fill-current", isAnalyzing && "animate-pulse")} />
                          Run Insight
                        </button>
                      )}
                    </div>
                    
                    {isAnalyzing ? (
                      <div className="p-4 border border-accent-primary/20 bg-accent-primary/5 rounded animate-pulse">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-center">Decrypting Packet Intent...</p>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="p-4 border border-accent-primary/30 bg-accent-primary/5 rounded text-[11px] leading-relaxed text-slate-300 font-mono shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]">
                        {aiAnalysis}
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed border-theme-border/50 text-center opacity-40 text-[10px] italic">
                        Select Insight to identify potential security threats.
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info Bar */}
      <footer className="h-6 flex items-center px-4 console-panel bg-theme-surface/50 border-t-0 text-[9px] text-slate-500 font-mono gap-6 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", isRunning ? "text-status-emerald bg-current animate-pulse" : "text-slate-700 bg-current")} />
          {isRunning ? "MONITORING ACTIVE" : "IDLE"}
        </div>
        <div className="h-3 w-1px bg-theme-border/30" />
        <div className="flex items-center gap-4">
          <span>PACKET_BUFFER: {packets.length} / 500</span>
          <span>LATENCY: [ {Math.floor(Math.random() * 5) + 2}ms ]</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <span className="flex items-center gap-1.5 opacity-60">
            <Cpu className="w-3 h-3" /> THREAD_0: STABLE
          </span>
          <span className="flex items-center gap-1.5 opacity-60">
            <BarChart3 className="w-3 h-3" /> ANALYTICS: READY
          </span>
          <div className="px-2 py-0.5 bg-status-rose text-white font-bold rounded uppercase tracking-tighter shadow-lg shadow-status-rose/20">
            Secure Mode
          </div>
        </div>
      </footer>
    </div>
  );
}
