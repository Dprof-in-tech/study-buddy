/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Set up PDF.js worker to use local file
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export default function FileUpload({ onTextExtracted, setIsLoading } : {onTextExtracted : any, setIsLoading: any}) {
  const [file, setFile] :  any = useState(null);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'paste'
  const [pastedText, setPastedText] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Check file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (selectedFile.size > maxSize) {
      setError('File too large. Maximum size is 25MB.');
      setFile(null);
      return;
    }

    // Check file type
    const fileType = selectedFile.type;
    const fileName = selectedFile.name;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/pdf'
    ];

    if (!validTypes.includes(fileType) &&
        !(fileName.endsWith('.docx') || fileName.endsWith('.txt') || fileName.endsWith('.pdf'))) {
      setError('Please upload a DOCX, TXT, or PDF file.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setProcessingProgress(0);
    setProcessingStatus('');
  };

  const handlePastedTextChange = (e: any) => {
    setPastedText(e.target.value);
  };

  const extractDocxText = async (docxFile: any) => {
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  };

  const extractTxtText = async (txtFile: any) => {
    try {
      const text = await txtFile.text();
      return text.trim();
    } catch (error) {
      console.error('TXT extraction error:', error);
      throw new Error('Failed to extract text from TXT');
    }
  };

  const extractPdfText = async (pdfFile: any) => {
    try {
      setProcessingStatus('Loading PDF...');
      setProcessingProgress(10);

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      let hasText = false;

      setProcessingStatus('Extracting text from PDF...');
      setProcessingProgress(30);

      // First try: Extract text using PDF.js (for text-based PDFs)
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ').trim();

        if (pageText.length > 10) { // Consider page has meaningful text if more than 10 chars
          hasText = true;
          fullText += pageText + '\n\n';
        }

        setProcessingProgress(30 + (pageNum / pdf.numPages) * 40);
      }

      // If we extracted meaningful text, return it
      if (hasText && fullText.trim().length > 50) {
        setProcessingStatus('Text extraction complete!');
        setProcessingProgress(100);
        return fullText.trim();
      }

      // Second try: OCR for scanned PDFs or PDFs with minimal text
      setProcessingStatus('PDF appears to be scanned. Running OCR...');
      setProcessingProgress(70);

      return await extractPdfWithOCR(pdf);

    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF: ' + (error as Error).message);
    }
  };

  const extractPdfWithOCR = async (pdf: any) => {
    try {
      const worker = await createWorker('eng');
      let ocrText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProcessingStatus(`Running OCR on page ${pageNum} of ${pdf.numPages}...`);

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

        // Create canvas to render page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert canvas to image data for OCR
        const imageData = canvas.toDataURL('image/png');

        // Run OCR on the image
        const { data: { text } } = await worker.recognize(imageData);
        ocrText += text + '\n\n';

        setProcessingProgress(70 + (pageNum / pdf.numPages) * 25);
      }

      await worker.terminate();

      setProcessingStatus('OCR complete!');
      setProcessingProgress(100);

      if (ocrText.trim().length < 50) {
        throw new Error('Could not extract meaningful text from this PDF. Please try a different document or paste the text manually.');
      }

      return ocrText.trim();

    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('OCR processing failed: ' + (error as Error).message);
    }
  };

  const handleProcessText = () => {
    if (pastedText.trim() === '') {
      setError('Please enter some text');
      return;
    }
    
    onTextExtracted(pastedText.trim());
  };

  const handleUpload = async () => {
    if (inputMethod === 'paste') {
      handleProcessText();
      return;
    }
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let extractedText = '';
      
      if (file.name.endsWith('.docx')) {
        extractedText = await extractDocxText(file);
      } else if (file.name.endsWith('.txt')) {
        extractedText = await extractTxtText(file);
      } else if (file.name.endsWith('.pdf')) {
        extractedText = await extractPdfText(file);
      } else {
        throw new Error('Unsupported file type');
      }
      
    //   if (!extractedText || extractedText.trim() === '') {
    //     throw new Error('No text was extracted from the file. Please try pasting the text directly.');
    //   }
      
      onTextExtracted(extractedText);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process file');
    } finally {
      setIsLoading(false);
      // Reset progress after a short delay to show completion
      setTimeout(() => {
        setProcessingProgress(0);
        setProcessingStatus('');
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold mb-4">Input Study Material</h2>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 ${
              inputMethod === 'file'
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setInputMethod('file')}
          >
            Upload File
          </button>
          <button
            className={`py-2 px-4 ${
              inputMethod === 'paste'
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setInputMethod('paste')}
          >
            Paste Text
          </button>
        </div>
        
        {inputMethod === 'file' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a file (DOCX, TXT, or PDF)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
              accept=".docx,.txt,.pdf"
            />
            {file && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm">Selected: {file.name}</p>
              </div>
            )}
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <p><strong>Enhanced PDF Processing:</strong> This tool can extract text from both regular PDFs and scanned documents using OCR technology. Processing may take longer for scanned documents.</p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your study material here
            </label>
            <textarea
              value={pastedText}
              onChange={handlePastedTextChange}
              placeholder="Paste or type your text content here..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Characters: {pastedText.length}
            </p>
          </div>
        )}
      </div>
      
      {/* Processing Progress */}
      {processingProgress > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">{processingStatus}</span>
            <span className="text-sm text-blue-600">{processingProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={inputMethod === 'file' ? !file : pastedText.trim() === ''}
        className={`w-full py-2 px-4 rounded-md ${
          (inputMethod === 'file' && !file) || (inputMethod === 'paste' && pastedText.trim() === '')
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {inputMethod === 'file' ? 'Process File' : 'Use This Text'}
      </button>
    </div>
  );
}