import React from 'react';

interface TranscriptionResultProps {
  text: string;
  filename: string;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text, filename }) => {
  
  const getBaseName = () => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (extension: 'txt' | 'md') => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getBaseName()}_transcript.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 gap-4">
        <h2 className="font-semibold text-gray-800">Результат транскрибации</h2>
        
        <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={() => handleDownload('txt')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 bg-white border border-gray-300 hover:border-blue-400 px-3 py-1.5 rounded-md transition-all shadow-sm flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                TXT
            </button>
            <button
                onClick={() => handleDownload('md')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 bg-white border border-gray-300 hover:border-blue-400 px-3 py-1.5 rounded-md transition-all shadow-sm flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
                MD
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>
            <button
            onClick={handleCopy}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
            </svg>
            Копировать
            </button>
        </div>
      </div>
      <div className="p-6">
        <div className="prose prose-blue max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base">
                {text}
            </pre>
        </div>
      </div>
    </div>
  );
};