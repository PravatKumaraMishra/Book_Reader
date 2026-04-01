import React, { useEffect, useRef } from 'react';

const TextDisplay = ({ text, currentSentenceIndex }) => {
  const containerRef = useRef(null);
  
  // Split text into readable sentences (simple naive split for MVP)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  useEffect(() => {
    // Auto-scroll to current active sentence
    if (containerRef.current) {
      const activeElement = containerRef.current.querySelector('.highlight');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSentenceIndex]);

  return (
    <div className="glass-panel text-container" ref={containerRef}>
      <div className="text-display-content">
        {sentences.map((sent, idx) => (
          <span
            key={idx}
            className={idx === currentSentenceIndex ? 'highlight' : ''}
            style={{ 
              opacity: currentSentenceIndex >= 0 && idx < currentSentenceIndex ? 0.6 : 1,
              transition: 'opacity 0.3s'
            }}
          >
            {sent}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TextDisplay;
