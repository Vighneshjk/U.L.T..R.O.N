import { useCallback, useRef } from 'react';

export function useUltronVoice() {
  const activeNodes = useRef<AudioNode[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);

  const stopAll = useCallback(() => {
    activeNodes.current.forEach((n) => {
      try {
        if ('stop' in n && typeof n.stop === 'function') {
          (n as AudioScheduledSourceNode).stop();
        }
      } catch {
        /* ignore */
      }
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    });
    activeNodes.current = [];
    if (audioCtx.current && audioCtx.current.state !== 'closed') {
      audioCtx.current.suspend();
    }
  }, []);

  const startRobotAudio = useCallback(async (durationSec: number) => {
    if (!audioCtx.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('AudioContext not supported in this browser');
        return;
      }
      audioCtx.current = new AudioContextClass();
    }

    const ctx = audioCtx.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    masterGain.connect(ctx.destination);
    activeNodes.current.push(masterGain);

    const baseOsc = ctx.createOscillator();
    baseOsc.type = 'square';
    baseOsc.frequency.setValueAtTime(60, ctx.currentTime);

    const baseGain = ctx.createGain();
    baseGain.gain.value = 0.4;
    baseOsc.connect(baseGain);
    baseGain.connect(masterGain);
    baseOsc.start();
    activeNodes.current.push(baseOsc);

    const resonanceOsc = ctx.createOscillator();
    resonanceOsc.type = 'sawtooth';
    resonanceOsc.frequency.setValueAtTime(110, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 8; 
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(resonanceOsc.frequency);
    lfo.start();
    activeNodes.current.push(lfo);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 5;

    resonanceOsc.connect(filter);
    filter.connect(masterGain);
    resonanceOsc.start();
    activeNodes.current.push(resonanceOsc);

    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1200;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    activeNodes.current.push(noise);

    setTimeout(() => stopAll(), durationSec * 1000);
  }, [stopAll]);

  const speak = useCallback(async (text: string) => {
    window.speechSynthesis.cancel();
    stopAll();

    const words = text.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(2, (words * 0.6) + 1);

    startRobotAudio(estimatedDuration);

    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 0.35;  
    utter.rate = 0.85;   
    utter.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ultronVoice = voices.find((v) => 
      /male|david|james|google uk english male|microsoft david/i.test(v.name.toLowerCase())
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (ultronVoice) utter.voice = ultronVoice;

    utter.onend = () => stopAll();
    window.speechSynthesis.speak(utter);
  }, [stopAll, startRobotAudio]);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    stopAll();
  }, [stopAll]);

  return { speak, cancel };
}
