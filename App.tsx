import React, { useState } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { TranscriptionResult } from './components/TranscriptionResult';
import { LoadingState, FileData } from './types';
import { transcribeAudio } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');

  const handleFileSelected = async (file: FileData) => {
    setFileData(file);
    setStatus(LoadingState.TRANSCRIBING);
    setErrorMsg('');
    setTranscript('');
    setProgressMsg('Инициализация...');

    try {
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resultText = await transcribeAudio(
        file.file, 
        file.type, 
        (msg) => setProgressMsg(msg)
      );
      
      setTranscript(resultText);
      setStatus(LoadingState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setStatus(LoadingState.ERROR);
      setErrorMsg(error.message || 'Произошла ошибка при обработке.');
    }
  };

  const reset = () => {
    setFileData(null);
    setTranscript('');
    setStatus(LoadingState.IDLE);
    setErrorMsg('');
    setProgressMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Преврати голос в структурированный текст</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Автоматическое разделение больших файлов на части и транскрибация с помощью Gemini.
          </p>
        </div>

        {/* Input Section */}
        {status === LoadingState.IDLE && (
          <div className="animate-fade-in">
            <DropZone onFileSelected={handleFileSelected} disabled={false} />
          </div>
        )}

        {/* Loading State */}
        {status === LoadingState.TRANSCRIBING && fileData && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center animate-pulse">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Транскрибация...</h3>
            <p className="text-gray-500 mb-4">Обработка файла: {fileData.name}</p>
            
            <div className="max-w-md mx-auto">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-blue-500 animate-pulse w-full"></div>
              </div>
              <p className="text-sm font-medium text-blue-600">{progressMsg}</p>
              <p className="text-xs text-gray-400 mt-2">
                 Не закрывайте вкладку. Большие файлы обрабатываются по частям.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === LoadingState.ERROR && (
           <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
             <div className="text-red-500 mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
               </svg>
             </div>
             <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка</h3>
             <p className="text-red-600 mb-6">{errorMsg}</p>
             <button
               onClick={reset}
               className="bg-white border border-red-300 text-red-700 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
             >
               Попробовать снова
             </button>
           </div>
        )}

        {/* Success State */}
        {status === LoadingState.SUCCESS && (
          <div className="flex flex-col items-center">
             <div className="w-full flex justify-between items-center mb-4">
                 <div className="text-sm text-gray-500">Файл: {fileData?.name}</div>
                 <button 
                    onClick={reset}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-300 hover:decoration-blue-800 underline-offset-4"
                 >
                    Загрузить другой файл
                 </button>
             </div>
             <TranscriptionResult text={transcript} filename={fileData?.name || 'transcript'} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;