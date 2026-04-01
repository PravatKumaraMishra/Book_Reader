import { useState, useEffect, useRef } from 'react';
import './App.css';
import TextInputSection from './components/TextInputSection';
import TextDisplay from './components/TextDisplay';
import AudioPlayerControl from './components/AudioPlayerControl';
import { ttsEngine } from './utils/ttsEngine';
import { Edit2 } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [sentences, setSentences] = useState([]);
  const [activeSentence, setActiveSentence] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('af_heart');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const isPlayingRef = useRef(false);

  // Sync state to ref so async callback loops can read latest playing state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleReadRequest = () => {
    if (!text.trim()) return;
    const parsedSentences = (text.match(/[^.!?\n]+[.!?\n]+/g) || [text]).map(s => s.trim()).filter(s => s.length > 0);
    setSentences(parsedSentences);
    setActiveSentence(-1);
    setIsEditing(false); // Switch to Read Mode
  };

  const handleEditRequest = () => {
    setIsPlaying(false);
    ttsEngine.stop();
    setIsEditing(true); // Switch back to Edit Mode
  };

  const initModel = async () => {
    if (isModelLoaded) return;
    setLoadingMsg('Loading Kokoro TTS model (approx 82MB)...');
    try {
      await ttsEngine.init((progressData) => {
        if (progressData.status === 'progress') {
          setProgress(progressData.progress);
        } else if (progressData.status === 'ready') {
          setIsModelLoaded(true);
          setLoadingMsg('');
        }
      });
      setIsModelLoaded(true);
      setLoadingMsg('');
    } catch (err) {
      console.error(err);
      setLoadingMsg('Failed to load model. Check console.');
    }
  };

  const playSequence = async (startIndex) => {
    if (startIndex >= sentences.length) {
      setIsPlaying(false);
      setActiveSentence(-1);
      return;
    }

    if (!isPlayingRef.current) return;

    setActiveSentence(startIndex);
    
    try {
      await ttsEngine.generateAndPlay(sentences[startIndex], selectedVoice, () => {
        // After sentence finishes, if still playing, go to next
        if (isPlayingRef.current) {
          playSequence(startIndex + 1);
        }
      });
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const handlePlay = async (startIndexOverride = null) => {
    if (sentences.length === 0) return;
    
    // Resume context if needed
    if (ttsEngine.audioContext?.state === 'suspended') {
      await ttsEngine.audioContext.resume();
    }
    
    if (!isModelLoaded) {
      await initModel();
    }

    setIsPlaying(true);
    // If we're at the end or haven't started, start from 0
    let startIdx = activeSentence === -1 ? 0 : activeSentence;
    if (startIndexOverride !== null) {
      startIdx = Math.max(0, Math.min(startIndexOverride, sentences.length - 1));
    }
    
    // Small timeout to allow state updates
    setTimeout(() => {
     playSequence(startIdx);
    }, 100);
  };

  const handlePause = () => {
    setIsPlaying(false);
    ttsEngine.stop();
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveSentence(-1);
    ttsEngine.stop();
  };

  const handleSkipForward = () => {
    if (sentences.length === 0) return;
    handleStop(); 
    // Wait for stop to firmly end current generator
    setTimeout(() => {
      handlePlay(activeSentence + 1);
    }, 100);
  };

  const handleSkipBack = () => {
    if (sentences.length === 0) return;
    handleStop();
    // Wait for stop to firmly end current generator
    setTimeout(() => {
      handlePlay(Math.max(0, activeSentence - 1));
    }, 100);
  };

  // Helper for computing total words across sentences
  const totalWords = sentences.reduce((acc, sent) => acc + sent.split(/\s+/).length, 0);

  return (
    <div className="app-container app-main">
      <header>
        <h1>Vocalise</h1>
        <p>Edit, paste, and read documents with offline, open-source TTS.</p>
      </header>

      {loadingMsg && (
        <div className="glass-panel loading-overlay">
          <div className="loader-spinner"></div>
          <p>{loadingMsg}</p>
          {progress > 0 && progress < 100 && (
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {!loadingMsg && isEditing && (
        <TextInputSection 
          text={text} 
          setText={setText}
          onReadRequest={handleReadRequest}
          onFileParseStart={() => setLoadingMsg('Parsing file...')}
          onFileParseError={(errMsg) => { alert(errMsg); setLoadingMsg(''); }}
        />
      )}

      {!loadingMsg && !isEditing && (
        <div className="reader-section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button onClick={handleEditRequest} className="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                 <Edit2 size={16} /> Edit Text
               </button>
            </div>
            <TextDisplay text={text} currentSentenceIndex={activeSentence} />
          </div>
          
          <AudioPlayerControl 
            isPlaying={isPlaying}
            onPlay={() => handlePlay()}
            onPause={handlePause}
            onStop={handleStop}
            onSkipForward={handleSkipForward}
            onSkipBack={handleSkipBack}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            disabled={loadingMsg !== ''}
            totalWords={totalWords}
          />
        </div>
      )}
    </div>
  );
}

export default App;
