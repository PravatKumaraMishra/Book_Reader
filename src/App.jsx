import { useState, useEffect, useRef } from 'react';
import './App.css';
import Dropzone from './components/Dropzone';
import TextDisplay from './components/TextDisplay';
import AudioPlayerControl from './components/AudioPlayerControl';
import { parseFile } from './utils/fileParser';
import { ttsEngine } from './utils/ttsEngine';

function App() {
  const [text, setText] = useState('');
  const [sentences, setSentences] = useState([]);
  const [activeSentence, setActiveSentence] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('af_heart');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const isPlayingRef = useRef(false);

  // Sync state to ref so async async loops can read latest playing state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleFileDrop = async (file) => {
    try {
      setLoadingMsg('Parsing file...');
      const extractedText = await parseFile(file);
      setText(extractedText);
      const parsedSentences = (extractedText.match(/[^.!?]+[.!?]+/g) || [extractedText]).map(s => s.trim()).filter(s => s.length > 0);
      setSentences(parsedSentences);
      setActiveSentence(-1);
      setLoadingMsg('');
      setIsPlaying(false);
      ttsEngine.stop();
    } catch (e) {
      alert(e.message);
      setLoadingMsg('');
    }
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

  const handlePlay = async () => {
    if (!text) return;
    
    // Resume context if needed
    if (ttsEngine.audioContext?.state === 'suspended') {
      await ttsEngine.audioContext.resume();
    }
    
    if (!isModelLoaded) {
      await initModel();
    }

    setIsPlaying(true);
    // If we're at the end or haven't started, start from 0
    const startIdx = activeSentence === -1 ? 0 : activeSentence;
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

  return (
    <div className="app-container app-main">
      <header>
        <h1>Vocalise</h1>
        <p>Your open-source document reader, powered by Kokoro TTS.</p>
      </header>

      {!text && !loadingMsg && (
        <Dropzone onFileParsed={handleFileDrop} />
      )}

      {loadingMsg && (
        <div className="glass-panel loading-overlay">
          <div className="loader-spinner"></div>
          <p>{loadingMsg}</p>
          {progress > 0 && progress < 100 && (
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}
        </div>
      )}

      {text && !loadingMsg && (
        <div className="reader-section">
          <TextDisplay text={text} currentSentenceIndex={activeSentence} />
          
          <AudioPlayerControl 
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            disabled={loadingMsg !== ''}
          />
        </div>
      )}
    </div>
  );
}

export default App;
