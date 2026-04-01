import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const parseFile = async (file) => {
  if (!file) return null;

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await parsePdf(file);
    } else if (
      fileType.startsWith('text/') ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md')
    ) {
      return await parseTextFile(file);
    } else {
      throw new Error(`Unsupported file format: ${file.name}`);
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
};

const parseTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target.result;
      // Basic markdown stripping for cleaner TTS reading
      if (file.name.toLowerCase().endsWith('.md')) {
        text = text
          .replace(/#+\s/g, '') // Remove headers
          .replace(/(\*|_){1,3}(\S)(\*|_){1,3}/g, '$2') // Remove bold/italic
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links formatting but keep text
          .replace(/`{1,3}[^`\n]+`{1,3}/g, '') // Remove inline code
          .replace(/```[\s\S]*?```/g, ''); // Remove block code
      }
      resolve(text.trim());
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const parsePdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
};
