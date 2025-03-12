/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import mammoth from 'mammoth';

export default function FileUpload({ onTextExtracted, setIsLoading } : {onTextExtracted : any, setIsLoading: any}) {
  const [file, setFile] :  any = useState(null);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'paste'
  const [pastedText, setPastedText] = useState('');

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Check file type
    const fileType = selectedFile.type;
    const fileName = selectedFile.name;
    
    if (fileName.toLowerCase().endsWith('.pdf')) {
      setError('PDF files cannot be processed directly. Please copy and paste the text from your PDF into the "Paste Text" tab.');
      setFile(null);
      return;
    }
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!validTypes.includes(fileType) && 
        !(fileName.endsWith('.docx') || fileName.endsWith('.txt'))) {
      setError('Please upload a DOCX or TXT file. For PDFs, use the "Paste Text" option.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
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
    }
  };

  const switchToPasteMode = () => {
    setInputMethod('paste');
    setError('');
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
              Select a file (DOCX or TXT)
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
              accept=".docx,.txt"
            />
            {file && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm">Selected: {file.name}</p>
              </div>
            )}
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-amber-700">
              <p><strong>Note:</strong> For PDF files, please use the &apos;Paste Text&apos; tab. Copy the text from your PDF and paste it in.</p>
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
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded">
          {error}
          {error.includes('PDF') && inputMethod === 'file' && (
            <div className="mt-2">
              <button 
                onClick={switchToPasteMode}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Switch to Paste Mode
              </button>
            </div>
          )}
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