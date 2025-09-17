 /* eslint-disable @typescript-eslint/no-explicit-any */
 'use client';

// import { useState } from 'react';
// import * as pdfjsLib from 'pdfjs-dist';
// //import 'pdfjs-dist/build/pdf.worker.entry'; // Important for PDF parsing

// export default function PDFReaderPage() {
//   const [pdfText, setPdfText] = useState('');
//   const [reading, setReading] = useState(false);

//   const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || file.type !== 'application/pdf') return;

//     const arrayBuffer = await file.arrayBuffer();
//     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//     let fullText = '';

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const content = await page.getTextContent();
//       const text = content.items.map((item: any) => item.str).join(' ');
//       fullText += text + '\n\n';
//     }

//     setPdfText(fullText);
//   };

//   const speakText = () => {
//     if (!pdfText) return;

//     const utterance = new SpeechSynthesisUtterance(pdfText);
//     utterance.lang = 'en-US';
//     utterance.rate = 1;
//     utterance.pitch = 1;

//     utterance.onstart = () => setReading(true);
//     utterance.onend = () => setReading(false);
//     speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="p-8 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">📄 PDF Voice Reader</h1>

//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handlePDFUpload}
//         className="mb-4"
//       />

//       {pdfText && (
//         <div className="mb-4">
//           <button
//             onClick={speakText}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             disabled={reading}
//           >
//             {reading ? '🔊 Reading...' : '🗣️ Read Aloud'}
//           </button>
//         </div>
//       )}

//       {pdfText && (
//         <textarea
//           className="w-full h-64 p-4 border rounded"
//           value={pdfText}
//           readOnly
//         />
//       )}
//     </div>
//   );
// }





import {
    RealtimeAgent,
    RealtimeSession,
   // TransportLayerAudio,
  } from '@openai/agents/realtime';
  import { webSearchTool } from '@openai/agents'

const AgentReader = () => {
  const initializeAgent = async () => {
 

    const webSearchAgent = new RealtimeAgent({
        name: 'Web Search Agent',
        handoffDescription: "specialist web researcher",
        instructions: "search the web and find relevant answers to the user input, analyze these answers and be sure to give a correct oen back to the user.",
        tools: [webSearchTool()],
    });

    const agent = new RealtimeAgent({
      name: 'Professor Dave',
      instructions: 'Greet the user with cheer and answer questions.',
      handoffs: [webSearchAgent]
    });
    const session = new RealtimeSession(agent, {
      model: 'gpt-4o-realtime-preview-2025-06-03',
      config: {
        turnDetection: {
          type: 'semantic_vad',
          eagerness: 'medium',
          create_response: true,
          interrupt_response: true,
        },
      },
    
    });

    await session.connect({ apiKey: `ek_68480e5508848190843c3a3aa843e1bc` });
  };

  initializeAgent();

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Voice Agent Reader</h3>
    </div>
  );
};

export default AgentReader
