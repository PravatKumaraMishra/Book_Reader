import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

const Dropzone = ({ onFileParsed }) => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileParsed(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFileParsed(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className={`dropzone-container ${isDragActive ? 'active' : ''}`}
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
       <div className="dropzone-content">
         <UploadCloud size={64} className="dropzone-icon" />
         <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Drop your document here</h2>
         <p style={{ color: 'var(--text-secondary)' }}>Supports PDF, Text, and Markdown (.pdf, .txt, .md)</p>
       </div>
    </div>
  );
};

export default Dropzone;
