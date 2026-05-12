import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';

interface MapBlueprintProps {
  lat: number;
  lon: number;
  label?: string;
}

const MapBlueprint: React.FC<MapBlueprintProps> = ({ lat, lon, label = 'TARGET_LOCATED' }) => {
  // Bounding box for OSM embed
  const delta = 0.01;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full h-64 mt-4 border border-sky-500/30 rounded-lg overflow-hidden glass-panel"
    >
      {/* Blueprint Filter Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-50 bg-[radial-gradient(circle,transparent_20%,var(--accent-glow)_100%)]" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(var(--accent-color) 1px, transparent 1px), linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <iframe
        title="Blueprint Map"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        className="map-blueprint-iframe"
        style={{ 
          filter: 'invert(100%) hue-rotate(var(--map-hue, 190deg)) brightness(1.2) contrast(1.5) saturate(0.7)',
          border: 'none',
          pointerEvents: 'auto'
        }}
      />

      {/* HUD Elements on Map */}
      <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 font-mono text-[10px] text-sky-400 bg-black/60 p-2 border border-sky-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Crosshair size={12} className="animate-pulse" />
          <span className="font-bold tracking-widest text-sky-400">{label}</span>
        </div>
        <div className="opacity-70 text-sky-300">LAT: {lat.toFixed(6)}</div>
        <div className="opacity-70 text-sky-300">LON: {lon.toFixed(6)}</div>
      </div>

      <div className="absolute bottom-2 right-2 z-30 font-mono text-[8px] text-sky-500/50 uppercase tracking-tighter">
        Vector Intelligence Overlay v4.0.1
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-500 z-30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sky-500 z-30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky-500 z-30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-500 z-30" />
    </motion.div>
  );
};

export default MapBlueprint;
