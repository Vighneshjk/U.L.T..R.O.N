import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Activity } from 'lucide-react';

const SystemDiagnostics: React.FC = () => {
  const [data, setData] = useState({
    security: 98.4,
    neuralLoad: 12.5,
    threatLevel: 0,
    activeNodes: 142
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        security: Math.max(95, prev.security + (Math.random() * 0.2 - 0.1)),
        neuralLoad: Math.min(100, Math.max(5, prev.neuralLoad + (Math.random() * 4 - 2))),
        threatLevel: Math.max(0, Math.min(100, prev.threatLevel + (Math.random() * 0.5 - 0.25))),
        activeNodes: Math.floor(prev.activeNodes + (Math.random() * 6 - 3))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-3">
        <DiagCard 
          icon={<Shield size={14} />} 
          label="INTEGRITY" 
          value={`${data.security.toFixed(1)}%`} 
          color="text-sky-400"
          progress={data.security}
        />
        <DiagCard 
          icon={<Zap size={14} />} 
          label="NEURAL_LOAD" 
          value={`${data.neuralLoad.toFixed(1)}%`} 
          color="text-yellow-400"
          progress={data.neuralLoad}
        />
        <DiagCard 
          icon={<Target size={14} />} 
          label="NODES_ACTIVE" 
          value={data.activeNodes.toString()} 
          color="text-sky-400"
        />
        <DiagCard 
          icon={<Activity size={14} />} 
          label="THREAT_INDEX" 
          value={`${data.threatLevel.toFixed(2)}%`} 
          color={data.threatLevel > 50 ? 'text-red-500' : 'text-sky-500/50'}
          progress={data.threatLevel}
        />
      </div>
      
      <div className="glass-panel p-3 bg-black/40">
        <div className="text-[9px] text-sky-500/50 mb-2 font-mono uppercase tracking-widest flex justify-between">
          <span>Neural_Synapse_Feed</span>
          <span className="animate-pulse">LIVE</span>
        </div>
        <div className="flex gap-1 h-8 items-end justify-between px-1">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-sky-500/30 rounded-t-sm"
              animate={{ 
                height: [
                  `${Math.random() * 100}%`, 
                  `${Math.random() * 100}%`, 
                  `${Math.random() * 100}%`
                ] 
              }}
              transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const DiagCard = ({ icon, label, value, color, progress }: any) => (
  <div className="glass-panel p-2 flex flex-col gap-1 bg-black/20 border-white/5">
    <div className="flex items-center gap-2 text-[8px] text-sky-500/50 font-mono tracking-tighter">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`text-xs font-bold font-mono ${color}`}>{value}</div>
    {progress !== undefined && (
      <div className="w-full h-[2px] bg-white/5 rounded-full mt-1 overflow-hidden">
        <motion.div 
          className={`h-full ${color.replace('text', 'bg')}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    )}
  </div>
);

export default SystemDiagnostics;
