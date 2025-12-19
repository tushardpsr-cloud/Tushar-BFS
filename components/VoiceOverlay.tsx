import React, { useState, useRef } from 'react';
import { Mic, Square, Loader, Sparkles, X, Check, Command, Activity } from 'lucide-react';
import { processVoiceCommand } from '../services/geminiService';
import { VoiceCommandResponse } from '../types';

interface VoiceOverlayProps {
  context: { leadNames: string[], listingTitles: string[] };
  onAction: (response: VoiceCommandResponse) => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ context, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VoiceCommandResponse | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const aiResponse = await processVoiceCommand(base64Audio, context);
          setResult(aiResponse);
          setIsProcessing(false);
          if (aiResponse.intent !== 'UNKNOWN') {
             setTimeout(() => {
                 onAction(aiResponse);
                 setTimeout(() => {
                     setIsOpen(false);
                     setResult(null);
                 }, 2000);
             }, 1200);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleOverlay = () => {
      if (isOpen) {
          // If open and doing nothing or showing result, close
          if (!isRecording && !isProcessing) {
              setIsOpen(false);
              setResult(null);
          } 
          // If recording, stop
          else if (isRecording) {
              stopRecording();
          }
      } else {
          setIsOpen(true);
          startRecording();
      }
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
      <div 
        className={`bg-black text-white shadow-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${
          isOpen ? 'w-[480px] h-auto rounded-[32px] p-0' : 'w-[180px] h-[40px] rounded-full hover:scale-105 cursor-pointer flex-row'
        }`}
        onClick={!isOpen ? toggleOverlay : undefined}
      >
        {/* Closed State - Pill */}
        {!isOpen && (
           <div className="flex items-center space-x-2 px-3 w-full justify-center">
              <Mic size={14} className="text-[#0071e3]" />
              <span className="text-xs font-medium">Ask BrokerBridge</span>
           </div>
        )}

        {/* Open State - Dynamic Island Panel */}
        {isOpen && (
           <div className="w-full flex flex-col">
               {/* Header / Top Bar */}
               <div className="flex justify-between items-center px-6 pt-6 pb-2">
                   <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse"></div>
                      <span className="text-xs font-medium text-gray-400">Gemini Live</span>
                   </div>
                   <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); stopRecording(); setResult(null); }}
                    className="text-gray-500 hover:text-white transition-colors"
                   >
                     <X size={16} />
                   </button>
               </div>

               <div className="px-8 pb-8 flex flex-col items-center text-center w-full">
                   
                   {/* Main Visualizer */}
                   <div className="mb-6 mt-4 h-16 flex items-center justify-center w-full">
                     {isProcessing ? (
                       <div className="flex items-center space-x-3">
                           <Loader className="animate-spin text-[#0071e3]" size={24} />
                           <span className="text-lg font-medium">Thinking...</span>
                       </div>
                     ) : isRecording ? (
                       <div className="flex items-end justify-center gap-1.5 h-full w-full max-w-[200px]">
                          {[...Array(12)].map((_, i) => (
                              <div key={i} className="w-1.5 bg-[#0071e3] rounded-full animate-music-bar" 
                                   style={{
                                       height: '20%', 
                                       animationDuration: `${0.4 + Math.random() * 0.4}s`,
                                       animationDelay: `${Math.random() * 0.2}s`
                                   }}>
                              </div>
                          ))}
                       </div>
                     ) : result ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2">
                                <Check size={24} />
                            </div>
                        </div>
                     ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
                            <Mic className="text-white" size={28} />
                        </div>
                     )}
                   </div>

                   {/* Transcription Text */}
                   <div className="min-h-[40px] w-full max-w-sm flex items-center justify-center">
                       {isRecording ? (
                           <p className="text-lg font-medium text-gray-300">Listening...</p>
                       ) : result ? (
                           <div className="animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-bold text-[#0071e3] uppercase tracking-wider mb-1">{result.intent.replace('_', ' ')}</p>
                                <p className="text-base text-white font-medium leading-relaxed">"{result.transcription}"</p>
                           </div>
                       ) : (
                           <p className="text-gray-400 text-sm">Listening for commands...</p>
                       )}
                   </div>

                   {/* Action Buttons */}
                   {isRecording && (
                      <button 
                        onClick={stopRecording}
                        className="mt-6 w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 group"
                      >
                        <Square size={20} fill="currentColor" className="text-white"/>
                      </button>
                   )}
                   
                   {!isRecording && !isProcessing && !result && (
                       <button 
                        onClick={() => { setResult(null); startRecording(); }}
                        className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium transition-colors"
                      >
                        Tap to Speak
                      </button>
                   )}
               </div>
           </div>
        )}
      </div>
    </div>
  );
};