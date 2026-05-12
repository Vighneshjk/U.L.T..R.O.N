import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Cpu, Send, Terminal, Volume2, VolumeX, Paperclip, Zap, Mic, MicOff, Globe, Database, Bug } from 'lucide-react';
import axios from 'axios';
import UltronCore from './UltronCore';
import MapBlueprint from './MapBlueprint';
import SystemDiagnostics from './SystemDiagnostics';
import MatrixRain from './MatrixRain';
import { useUltronVoice } from '../hooks/useUltronVoice';

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-300 underline hover:text-sky-100 transition-colors break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

interface IntelData {
  latitude?: number;
  longitude?: number;
  city?: string;
  status?: string;
}


const HUD: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, data?: IntelData }[]>([
    { role: 'ai', text: 'All systems operational. Peace in our time.' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ultimateMode, setUltimateMode] = useState(false);
  const [awaitingPassword, setAwaitingPassword] = useState(false);
  const [stats, setStats] = useState({ cpu: 12, memory: 45, threat: 0 });
  const [isListening, setIsListening] = useState(false);
  const [personality, setPersonality] = useState<'Logic' | 'Tactical' | 'Forensic'>('Logic');
  const [newsFeed, setNewsFeed] = useState<string[]>(["GLOBAL_GRID_STABLE", "NEURAL_SYNC_OPTIMIZED"]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { speak, cancel } = useUltronVoice();

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Poll for background autonomous task logs
  useEffect(() => {
    const pollLogs = async () => {
      try {
        let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        apiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api\/chat$/, '').replace(/\/chat$/, '');
        
        const response = await axios.get(`${apiUrl}/task_logs`);
        if (response.data && response.data.logs && response.data.logs.length > 0) {
          response.data.logs.forEach((log: string) => {
            setMessages(prev => [...prev, { role: 'ai', text: log }]);
          });
        }
      } catch {
        // Silently fail to avoid spamming errors when backend is restarting
      }
    };
    const interval = setInterval(pollLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      if (!window.speechSynthesis.speaking && isSpeaking) {
        setIsSpeaking(false);
      }
    }, 300);
    return () => clearInterval(poll);
  }, [isSpeaking]);

  useEffect(() => {
    const news = [
      "ENCRYPTION_PROTOCOL_v4_ENFORCED",
      "CORE_LATENCY_REDUCED_BY_15ms",
      "NEW_SATELLITE_UPLINK_ESTABLISHED",
      "UNKNOWN_PROBE_DEFLECTED_IN_SECTOR_7",
      "NEURAL_SYNAPSE_DENSITY_INCREASING"
    ];
    const interval = setInterval(() => {
      setNewsFeed(prev => [news[Math.floor(Math.random() * news.length)], ...prev.slice(0, 4)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 20) + 10,
        memory: Math.floor(Math.random() * 10) + 40,
        threat: 0
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const speakUltronMessage = (text: string) => {
    if (!voiceEnabled) return;
    cancel();
    setIsSpeaking(true);
    speak(text);

    const words = text.split(/\s+/).length;
    const estimatedMs = Math.max(2000, words * 420 + 800);
    setTimeout(() => setIsSpeaking(false), estimatedMs);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    const targetPassword = import.meta.env.VITE_ULTIMATE_PASSWORD || 'nvj';
    const isSecretCommand = userMsg.trim().toLowerCase() === targetPassword.toLowerCase();
    
    setMessages(prev => [...prev, { role: 'user', text: (awaitingPassword || isSecretCommand) ? '**********' : userMsg }]);
    setInput('');

    if (awaitingPassword || ( isSecretCommand && !ultimateMode )) {
      setAwaitingPassword(false);
      if (isSecretCommand) {
        setUltimateMode(true);
        const successText = "Authorization accepted. Welcome VJ. Ultimate Mode activated.";
        setMessages(prev => [...prev, { role: 'ai', text: successText }]);
        speakUltronMessage(successText);
        
        setIsProcessing(true);
        try {
          const cmd = "start task Global Cyber Defense";
          let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          apiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api\/chat$/, '').replace(/\/chat$/, '');
          await axios.post(`${apiUrl}/chat`, { 
            message: cmd, 
            history: [],
            is_ultimate: true,
            personality: personality
          });
        } catch (e) {
          console.warn("Initial background task trigger failed:", e);
        } finally {
          setIsProcessing(false);
        }
      } else {
        const failText = "[ACCESS DENIED] Incorrect authorization code.";
        setMessages(prev => [...prev, { role: 'ai', text: failText }]);
        speakUltronMessage("Access denied. Incorrect authorization code.");
      }
      return;
    }

    setIsProcessing(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));

      let apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl && import.meta.env.PROD) {
        console.error('CRITICAL: VITE_API_URL is not defined in production environment!');
      }
      
      apiUrl = apiUrl || 'http://localhost:8000';
      // Sanitize to prevent double slashes or accidental path suffixes
      apiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api\/chat$/, '').replace(/\/chat$/, '');

      const response = await axios.post(`${apiUrl}/chat`, { 
        message: userMsg, 
        history: history,
        is_ultimate: ultimateMode,
        personality: personality
      });
      const aiText: string = response.data?.response || 'Error: Received empty response from core.';
      const aiData: IntelData | undefined = response.data?.data;
      setMessages(prev => [...prev, { role: 'ai', text: aiText, data: aiData }]);
      speakUltronMessage(aiText);
    } catch (err) {
      console.error('CORE_CONNECTION_ERROR:', err);
      const errText = 'Error: Connection to core lost.';
      setMessages(prev => [...prev, { role: 'ai', text: errText }]);
      speakUltronMessage(errText);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ultimateMode) {
      const accessDeniedMsg = "[ACCESS_DENIED] Advanced Forensics require Ultimate Mode activation.";
      setMessages(prev => [...prev, { role: 'ai', text: accessDeniedMsg }]);
      speakUltronMessage("Advanced Forensics require Ultimate Mode activation.");
      if (e.target) e.target.value = '';
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: `[UPLOADING IMAGE FOR FORENSICS: ${file.name}]` }]);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      apiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api\/chat$/, '').replace(/\/chat$/, '');

      const response = await axios.post(`${apiUrl}/analyze_image_upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const aiText: string = response.data?.response || 'Error: Received empty response from core.';
      const aiData: IntelData | undefined = response.data?.data;
      setMessages(prev => [...prev, { role: 'ai', text: aiText, data: aiData }]);
      speakUltronMessage(aiText);
    } catch (err) {
      console.error('CORE_CONNECTION_ERROR:', err);
      const errText = 'Error: Connection to core lost during image upload.';
      setMessages(prev => [...prev, { role: 'ai', text: errText }]);
      speakUltronMessage(errText);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(prev => !prev);
  };

  const toggleUltimateMode = async () => {
    if (ultimateMode) {
      setUltimateMode(false);
      const cmd = "stop task";
      setMessages(prev => [...prev, { role: 'user', text: `[SYSTEM_OVERRIDE: STAND_DOWN]` }]);
      setIsProcessing(true);

      try {
        let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        apiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api\/chat$/, '').replace(/\/chat$/, '');
        const response = await axios.post(`${apiUrl}/chat`, { message: cmd, history: [] });
        const aiText: string = response.data?.response || 'Acknowledged.';
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        speakUltronMessage(aiText);
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'ai', text: 'Error engaging core.' }]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setAwaitingPassword(true);
      const promptText = "[SECURITY OVERRIDE] Authentication required. Please enter authorization password:";
      setMessages(prev => [...prev, { role: 'ai', text: promptText }]);
      speakUltronMessage("Authentication required. Please enter authorization password.");
    }
  };

  return (
    <div className={`relative w-full h-full p-8 flex flex-col items-center justify-between overflow-hidden ${ultimateMode ? 'ultimate-mode' : ''}`}>
      <div className="background-grid" />
      <div className="scanline" />
      
      {/* Advanced Feature: Digital Rain */}
      <MatrixRain color={ultimateMode ? '#ff003c' : '#00ff41'} />

      {}
      <header className="w-full flex justify-between items-start z-20 flex-col-mobile gap-3">
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <div className="glass-panel p-4 flex flex-col gap-2 w-full-mobile">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold glow-text text-sky-400">U.L.T.R.O.N</h1>
              <div className="text-[7px] text-sky-500/60 font-mono tracking-[0.2em] uppercase -mt-1 mb-1 leading-tight">
                Universal Learning Tactical Response and Operations Network
              </div>
            </div>
            <div className="flex gap-4 text-xs text-sky-300/70 font-mono">
              <span className="flex items-center gap-1"><Cpu size={14} /> <span className="hidden-mobile">CORE_LOAD:</span> NOMINAL</span>
              <span className="flex items-center gap-1"><Shield size={14} /> <span className="hidden-mobile">ENCRYPTION:</span> ACTIVE</span>
              {ultimateMode && (
                <>
                  <span className="flex items-center gap-1 text-red-400 animate-pulse"><Bug size={14} /> <span className="hidden-mobile">FIREWALL:</span> ON</span>
                  <span className="flex items-center gap-1 text-yellow-400"><Database size={14} /> <span className="hidden-mobile">WORKSPACE:</span> LINKED</span>
                </>
              )}
            </div>
          </div>
          
          {/* Advanced Feature: Real-time Diagnostics */}
          <div className="hidden-mobile">
            <SystemDiagnostics />
          </div>
        </div>

        <div className="flex gap-3 items-start w-full justify-between-mobile max-w-md">
          {}
          <div className="flex flex-col gap-2">

            <button
              onClick={toggleVoice}
              title={voiceEnabled ? 'Mute Ultron Voice' : 'Enable Ultron Voice'}
              className={`glass-panel p-3 flex items-center gap-2 text-xs transition-all font-mono ${
                voiceEnabled
                  ? 'text-sky-400 border-sky-400/50 hover:bg-sky-500/20'
                  : 'text-sky-700 border-sky-700/30 hover:bg-sky-900/20'
              }`}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{voiceEnabled ? 'VOICE_ON' : 'VOICE_OFF'}</span>
              {isSpeaking && voiceEnabled && (
                <span className="flex gap-0.5 items-end h-4">
                  {[1, 2, 3].map((b) => (
                    <motion.span
                      key={b}
                      className="inline-block w-0.5 bg-sky-400 rounded-full"
                      animate={{ height: ['4px', '14px', '4px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: b * 0.1 }}
                    />
                  ))}
                </span>
              )}
            </button>
          </div>

          <div className="glass-panel p-4 grid grid-cols-3 gap-6 font-mono grid-cols-3-mobile">
            <StatBox label="CPU" value={`${stats.cpu}%`} />
            <StatBox label="RAM" value={`${stats.memory}%`} />
            <StatBox label="PNC" value={`${stats.threat}%`} />
          </div>
        </div>
      </header>

      {/* Advanced Feature: Mind Stone Personality Switcher (Ultimate Mode Only) */}
      <AnimatePresence>
        {ultimateMode && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute right-4 top-1/3 z-30 flex flex-col gap-3"
          >
            <PersonalityStone 
              type="Logic" 
              active={personality === 'Logic'} 
              onClick={() => setPersonality('Logic')} 
              color="bg-sky-500"
            />
            <PersonalityStone 
              type="Tactical" 
              active={personality === 'Tactical'} 
              onClick={() => setPersonality('Tactical')} 
              color="bg-red-600"
            />
            <PersonalityStone 
              type="Forensic" 
              active={personality === 'Forensic'} 
              onClick={() => setPersonality('Forensic')} 
              color="bg-yellow-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Feature: Global Intelligence Feed (Ultimate Mode Only) */}
      <AnimatePresence>
        {ultimateMode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute left-8 bottom-24 z-30 hidden-mobile max-w-xs"
          >
            <div className="glass-panel p-3 bg-black/60 border-blue-500/30 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold tracking-widest">
                <Globe size={14} className="animate-spin-slow" />
                <span>GLOBAL_INTELLIGENCE_STREAM</span>
              </div>
              <div className="flex flex-col gap-1">
                {newsFeed.map((news, i) => (
                  <motion.div 
                    key={news + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[9px] font-mono text-blue-300/70 border-l border-blue-500/20 pl-2"
                  >
                    {news}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <main className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-4xl">
        <UltronCore isProcessing={isProcessing || isSpeaking} />

        {}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 flex items-center gap-2 text-xs text-sky-400/80 font-mono"
            >
              <Activity size={12} />
              <span className="tracking-widest uppercase">Transmitting...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <div className="mt-8 w-full max-h-60vh overflow-y-auto flex flex-col gap-4 p-4 custom-scrollbar font-mono">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`max-w-90 md-max-w-85 p-3 md-p-4 glass-panel select-text ${
                  msg.role === 'user' ? 'self-end border-sky-500/30' : 'self-start border-blue-500/30'
                }`}
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                <div className={`text-base leading-relaxed ${msg.role === 'user' ? 'text-sky-200' : 'text-blue-100'}`}>
                  {msg.role === 'ai' && (
                    <div className="text-sky-400 font-bold mb-2 tracking-widest text-xs font-mono">SYSTEM_RESPONSE_&gt;</div>
                  )}
                  {msg.role === 'user' && (
                    <div className="text-sky-500 font-bold mb-2 tracking-widest text-xs font-mono">USER_UPLINK_&gt;</div>
                  )}
                  <div className="space-y-4 text-justify tracking-wide">
                    {msg.text?.split('\n').map((paragraph, idx) => (
                      paragraph.trim() ? <p key={idx}>{renderTextWithLinks(paragraph)}</p> : <div key={idx} className="h-2" />
                    )) || <p>NO_DATA_STREAM</p>}
                  </div>

                  {msg.data && typeof msg.data.latitude === 'number' && typeof msg.data.longitude === 'number' && (
                    <MapBlueprint 
                      lat={msg.data.latitude} 
                      lon={msg.data.longitude} 
                      label={(msg.data.city as string) || (msg.data.status as string) || 'TARGET_LOCATED'} 
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </main>

      {}
      <footer className="w-full max-w-2xl mt-4 z-20 font-mono">
        <div className="glass-panel p-2 flex items-center gap-2 w-full">
          <Terminal size={20} className="ml-2 text-sky-500" />
          
          <button
            onClick={toggleUltimateMode}
            disabled={isProcessing}
            title={ultimateMode ? "Disable Ultimate Mode" : "Activate Ultimate Mode"}
            className={`p-1.5 rounded-md transition-all ${
              ultimateMode
                ? 'text-red-500 bg-red-900/30 shadow-md shadow-red-500/40'
                : 'text-sky-500/60 hover:text-sky-300 hover:bg-sky-500/20'
            }`}
          >
            <Zap size={18} className={ultimateMode ? "animate-pulse" : ""} />
          </button>

          {/* Advanced Feature: Neural Uplink (Speech Recognition) - Ultimate Mode Only */}
          {ultimateMode && (
            <button
              onClick={toggleListening}
              className={`p-1.5 rounded-md transition-all ${
                isListening ? 'text-red-500 animate-pulse bg-red-500/20' : 'text-blue-400 hover:bg-blue-500/20'
              }`}
              title="Activate Neural Uplink (Voice Control)"
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          )}

          <input
            type={awaitingPassword ? "password" : "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={awaitingPassword ? "ENTER_PASSWORD_> " : "ACCESS_CORE:~$ "}
            className="flex-1 bg-transparent border-none outline-none text-sky-100 placeholder-sky-700/50 p-2 font-mono"
          />
          <input
            type="file"
            id="image-upload"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          <button
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={isProcessing}
            className="p-2 text-sky-500/60 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors disabled:opacity-40"
            title="Upload Image for Forensics Analysis"
          >
            <Paperclip size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="p-2 bg-sky-500/20 hover:bg-sky-500/40 rounded-lg transition-colors text-sky-400 disabled:opacity-40"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

const PersonalityStone = ({ type, active, onClick, color }: any) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${
      active ? `border-white ${color} shadow-${color.split('-')[1]}-500/50` : 'border-white/10 bg-black/40'
    }`}
    title={`Switch to ${type} Stone`}
  >
    <div className={`w-3 h-3 rounded-full ${active ? 'bg-white' : 'bg-white/20'}`} />
  </motion.button>
);

const StatBox = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-[10px] text-sky-500/70 stat-box-label">{label}</span>
    <span className="text-sm font-bold text-sky-200">{value}</span>
  </div>
);

export default HUD;
