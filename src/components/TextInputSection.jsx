import React, { useRef, useState } from 'react';
import { UploadCloud, Check } from 'lucide-react';
import { parseFile } from '../utils/fileParser';

const TextInputSection = ({ text, setText, onReadRequest, onFileParseStart, onFileParseError }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    try {
      if (onFileParseStart) onFileParseStart();
      const extractedText = await parseFile(file);
      setText(extractedText);
    } catch (e) {
      if (onFileParseError) onFileParseError(e.message);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="glass-panel text-input-section">
      <div 
        className={`dropzone-header ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
         <input 
           type="file" 
           ref={fileInputRef} 
           style={{ display: 'none' }} 
           onChange={handleChange}
           accept=".pdf,.txt,.md" 
         />
         <div className="dropzone-header-content">
           <UploadCloud size={24} className="dropzone-icon-small" />
           <span style={{ fontWeight: 500 }}>Upload a Document (.pdf, .txt, .md)</span>
           <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 'auto' }}>Or paste text below</span>
         </div>
      </div>

      <textarea 
        className="text-input-area"
        placeholder="Paste your text or markdown here, or upload a document above..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          className="primary" 
          onClick={onReadRequest}
          disabled={!text || text.trim().length === 0}
        >
          <Check size={20} />
          {text ? 'Start Reading' : 'Enter text to read'}
        </button>
      </div>
    </div>
  );
};

export default TextInputSection;
