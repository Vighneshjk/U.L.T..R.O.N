// AudioWorklet processor: BitCrusher + Ring Modulator
// This runs in the audio rendering thread for maximum performance
const robotProcessorCode = `
class RobotVoiceProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this.phase = 0;
    this.ringPhase = 0;
    this.bitDepth = 4;         // crush to 4-bit
    this.ringFreq = 110;       // ring mod carrier Hz (Ultron buzz)
    this.tremoloPhase = 0;
    this.tremoloFreq = 9;      // tremolo rate Hz
    this.port.onmessage = (e) => {
      if (e.data.ringFreq !== undefined) this.ringFreq = e.data.ringFreq;
      if (e.data.bitDepth !== undefined) this.bitDepth = e.data.bitDepth;
    };
  }

  process(inputs, outputs) {
    const input  = inputs[0];
    const output = outputs[0];
    if (!input || !input[0]) return true;

    const inputChannel  = input[0];
    const outputChannel = output[0];
    const sr = sampleRate;

    for (let i = 0; i < inputChannel.length; i++) {
      let sample = inputChannel[i];

      // 1. BitCrusher — quantise to N bits
      const steps = Math.pow(2, this.bitDepth);
      sample = Math.round(sample * steps) / steps;

      // 2. Ring modulator — multiply by square wave carrier
      this.ringPhase += this.ringFreq / sr;
      if (this.ringPhase >= 1) this.ringPhase -= 1;
      const ringCarrier = this.ringPhase < 0.5 ? 1 : -1; // square wave
      sample = sample * ringCarrier;

      // 3. Tremolo amplitude modulation
      this.tremoloPhase += this.tremoloFreq / sr;
      if (this.tremoloPhase >= 1) this.tremoloPhase -= 1;
      const tremolo = 0.7 + 0.3 * Math.sin(2 * Math.PI * this.tremoloPhase);
      sample = sample * tremolo;

      outputChannel[i] = sample;
    }
    return true;
  }
}
registerProcessor('robot-voice-processor', RobotVoiceProcessor);
`;

export { robotProcessorCode };
