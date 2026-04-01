import { KokoroTTS } from 'kokoro-js';

class TTSService {
  constructor() {
    this.tts = null;
    this.isLoading = false;
    this.model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
    this.audioContext = null;
    this.isPlaying = false;
    this.currentSource = null;
    this.generationId = 0;
    
    // Default available voices for Kokoro
    this.voices = [
      { id: 'af_heart', name: 'Female - Heart' },
      { id: 'af_bella', name: 'Female - Bella' },
      { id: 'af_nicole', name: 'Female - Nicole' },
      { id: 'am_michael', name: 'Male - Michael' },
      { id: 'am_adam', name: 'Male - Adam' },
      { id: 'bf_emma', name: 'British Female - Emma' },
      { id: 'bm_george', name: 'British Male - George' },
    ];
  }

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  async init(onProgress) {
    if (this.tts) return;
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      this.tts = await KokoroTTS.from_pretrained(this.model_id, {
        dtype: "q8", // Quantized for faster download and web execution
        device: "wasm",
        progress_callback: onProgress
      });
    } catch (e) {
      console.error("Failed to load model:", e);
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

  async generateAndPlay(text, voice, onEnded) {
    if (!this.tts) throw new Error("TTS Model not loaded");
    if (!text || text.trim() === '') {
      if (onEnded) onEnded();
      return;
    }
    
    // Stop any currently playing audio and cancel pending generations
    this.stop();
    const currentGenId = ++this.generationId;
    
    try {
      const result = await this.tts.generate(text, { voice });
      
      // Abort Mechanism: check if state changed while generating
      if (this.generationId !== currentGenId) {
        console.log("Aborting audio playback; state changed during generation.");
        return;
      }

      // The generated result might be an object containing .audio and .sampling_rate
      // Or it might be a RawAudio object from transformers.js
      let audioData = result.audio;
      let sampleRate = result.sampling_rate;
      
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Convert to Float32Array if it isn't already
      const float32Data = audioData instanceof Float32Array ? audioData : new Float32Array(audioData);
      
      const buffer = ctx.createBuffer(1, float32Data.length, sampleRate || 24000); // 24000 is default for kokoro
      buffer.getChannelData(0).set(float32Data);
      
      this.currentSource = ctx.createBufferSource();
      this.currentSource.buffer = buffer;
      this.currentSource.connect(ctx.destination);
      
      this.currentSource.onended = () => {
        this.isPlaying = false;
        if (onEnded && this.generationId === currentGenId) onEnded();
      };
      
      this.isPlaying = true;
      this.currentSource.start(0);
    } catch (err) {
      console.error("Error generating/playing audio:", err);
      this.isPlaying = false;
      throw err;
    }
  }
  
  stop() {
    this.generationId++; // Advance generation id to abort dangling promises
    if (this.currentSource && this.isPlaying) {
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    this.isPlaying = false;
  }
}

export const ttsEngine = new TTSService();
