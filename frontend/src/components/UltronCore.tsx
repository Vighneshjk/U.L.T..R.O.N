import React from 'react';
import { motion } from 'framer-motion';

const UltronCore: React.FC<{ isProcessing: boolean }> = ({ isProcessing }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full border-2 border-dashed border-sky-400/30 rounded-full"
      />
      
      {/* Inner Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-4/5 h-4/5 border border-sky-400/50 rounded-full"
      />

      {/* The Core Orb */}
      <motion.div
        animate={{
          scale: isProcessing ? [1, 1.1, 1] : [1, 1.05, 1],
          boxShadow: isProcessing 
            ? "0 0 60px var(--core-shadow)" 
            : "0 0 30px var(--core-shadow-dim)"
        }}
        transition={{
          duration: isProcessing ? 0.5 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-32 h-32 bg-gradient-to-br from-[var(--core-gradient-from)] to-[var(--core-gradient-to)] rounded-full flex items-center justify-center overflow-hidden"
      >
        {/* Internal Pulse */}
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[var(--core-glow)] opacity-20 blur-xl rounded-full"
        />
        
        {/* Core Detail */}
        <div className="z-10 w-16 h-16 border-4 border-[var(--core-glow)] opacity-30 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-[var(--core-glow)] rounded-full shadow-[0_0_15px_var(--core-glow)]" />
        </div>
      </motion.div>

      {/* Orbiting Particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-full h-full"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--core-glow)] rounded-full shadow-[0_0_10px_var(--core-glow)]" />
        </motion.div>
      ))}

    </div>
  );
};

export default UltronCore;
