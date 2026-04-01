import React from 'react';
import { Play, Pause, Square, Volume2, SkipBack, SkipForward, Clock } from 'lucide-react';
import { ttsEngine } from '../utils/ttsEngine';

const AudioPlayerControl = ({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop, 
  onSkipBack,
  onSkipForward,
  selectedVoice, 
  setSelectedVoice,
  disabled,
  totalWords = 0
}) => {
  // Estimate time: ~150 words per minute average reading speed
  const estimatedSeconds = Math.max(1, Math.ceil((totalWords / 150) * 60));
  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-panel controls-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <Volume2 size={24} color="var(--accent-color)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Playback Options</h3>
      </div>
      
      {totalWords > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <Clock size={16} />
          <span>Estimated read time: {formatTime(estimatedSeconds)}</span>
        </div>
      )}

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
        <button 
          className="button-icon-only" 
          onClick={onSkipBack} 
          disabled={disabled}
          title="Previous Sentence"
        >
          <SkipBack fill="currentColor" />
        </button>

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
        
        <button 
          className="button-icon-only" 
          onClick={onSkipForward} 
          disabled={disabled}
          title="Next Sentence"
        >
          <SkipForward fill="currentColor" />
        </button>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
        Powered by Kokoro-82M (Transformers.js)
      </p>
    </div>
  );
};

export default AudioPlayerControl;
