# Vocalise — Book Reader

A React application that turns pasted text and uploaded documents into spoken audio using the Kokoro model in the browser.

## Features

- Import PDF, plain text, and Markdown files.
- Edit extracted text before switching to reading mode.
- Highlight the active sentence and move between sentences.
- Choose a voice and play, pause, or stop narration.

## Requirements

- Node.js `^20.19.0 || >=22.12.0` and npm.
- A browser with Web Audio and WebAssembly support.
- Internet access for the initial model download; no backend or API key is configured.

## Run locally

```sh
git clone https://github.com/PravatKumaraMishra/Book_Reader.git
cd Book_Reader
npm ci
```

1. Paste text or choose a document.
2. Switch to reading mode and choose a voice.
3. Press Play and wait for the initial model download.
4. Use the playback controls or return to editing.

```sh
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Available commands

| Command | Script |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run lint` | `eslint .` |
| `npm run preview` | `vite preview` |

`npm run preview` serves the output of `npm run build`; it does not build the project itself.

## Project structure

- `src/App.jsx`: editing and narration state.
- `src/utils/fileParser.js`: PDF and text extraction.
- `src/utils/ttsEngine.js`: Kokoro loading and audio generation.
- `src/components/`: upload, text display, and player controls.

## Notes

The model is `onnx-community/Kokoro-82M-v1.0-ONNX`, loaded with quantized WebAssembly inference. Initial loading and sentence generation can take time. PDF extraction reads embedded text; scanned PDFs need OCR elsewhere. Markdown cleanup is basic. Pausing stops the current audio; continuing may restart the active sentence.
