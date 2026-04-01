import React from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { ttsEngine } from '../utils/ttsEngine';

const AudioPlayerControl = ({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop, 
  selectedVoice, 
  setSelectedVoice,
  disabled 
}) => {
  return (
    <div className="glass-panel controls-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <Volume2 size={24} color="var(--accent-color)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Playback Options</h3>
      </div>

      <div className="control-group">
        <label htmlFor="voice-select">Voice Model</label>
        <select 
          id="voice-select" 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value)}
          disabled={disabled || isPlaying}
        >
          {ttsEngine.voices.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      <div className="player-buttons">
        {!isPlaying ? (
          <button 
            className="primary button-icon-only" 
            onClick={onPlay} 
            disabled={disabled}
            title="Play"
          >
            <Play fill="currentColor" />
          </button>
        ) : (
          <button 
            className="primary button-icon-only" 
            onClick={onPause} 
            title="Pause"
          >
            <Pause fill="currentColor" />
          </button>
        )}
        
        <button 
          className="button-icon-only" 
          onClick={onStop} 
          disabled={disabled || !isPlaying}
          title="Stop"
        >
          <Square fill="currentColor" />
        </button>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
        Powered by Kokoro-82M (Transformers.js)
      </p>
    </div>
  );
};

export default AudioPlayerControl;
