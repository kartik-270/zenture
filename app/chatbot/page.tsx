'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Calendar, RotateCcw, Send, Loader2, Camera, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { apiConfig } from '@/lib/config';
import { getAuthToken } from '@/lib/auth';
import { ProtectedRoute } from '@/components/protected-route';

interface Message {
  text: string;
  isUser: boolean;
  followUps?: string[];
  isCrisis?: boolean;
}

function ChatbotContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const strippedText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    const utterance = new SpeechSynthesisUtterance(strippedText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Google UK English Female') ||
      v.name.includes('Microsoft Zira') ||
      (v.name.includes('Female') && v.lang.startsWith('en'))
    ) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { text: messageToSend, isUser: true }]);
    setInputValue('');
    setIsTyping(true);
    setMessages(prev => [...prev, { text: '', isUser: false }]);

    try {
      const token = getAuthToken();
      const response = await fetch(`${apiConfig.baseUrl}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_id: conversationId,
        }),
      });

      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botText = '';
      let partialLine = '';

      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().slice(6));
              if (data.chunk) {
                botText += data.chunk;
                setMessages(prev => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && !last.isUser) last.text = botText;
                  return next;
                });
              } else if (data.final) {
                if (data.conversation_id && !conversationId) {
                  setConversationId(data.conversation_id);
                }
                const fullResponse = data.full_response || botText;
                setMessages(prev => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && !last.isUser) {
                    last.text = fullResponse;
                    last.followUps = data.followUps;
                    last.isCrisis = data.is_crisis || false;
                  }
                  return next;
                });
                if (voiceEnabled) speak(fullResponse);
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }

      if (messages.length > 5 && !feedbackSubmitted) {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].text === '') next.pop();
        return [...next, {
          text: "Sorry, I'm having trouble connecting right now. Please try again later.",
          isUser: false,
        }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (score: number) => {
    try {
      const token = getAuthToken();
      await fetch(`${apiConfig.baseUrl}/chatbot/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ conversation_id: conversationId, score }),
      });
      setFeedbackSubmitted(true);
      setShowFeedback(false);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const handleEndSession = async () => {
    if (conversationId) {
      try {
        const token = getAuthToken();
        await fetch(`${apiConfig.baseUrl}/chatbot/session/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    setMessages([]);
    setConversationId(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setDetectedEmotion(null);
  };

  const handleFacialScan = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setIsScanning(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${apiConfig.baseUrl}/chatbot/facial-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await res.json();

      if (res.ok) {
        setDetectedEmotion(data.emotion);
        setMessages(prev => [...prev, {
          text: `[Facial Analysis: Detected emotion is "${data.emotion}" with stress level ${data.stress_level}/10. Sharing this with the AI for context.]`,
          isUser: true,
        }]);
        handleSendMessage(`I'm feeling a bit like the emotion you detected (${data.emotion}). Can you help me process this?`);
      } else {
        console.error('Facial analysis failed:', data.error);
      }
    } catch (e) {
      console.error('Facial analysis error:', e);
    } finally {
      setIsScanning(false);
      setShowWebcam(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="flex flex-col w-full max-w-md h-[700px] mx-auto rounded-2xl shadow-2xl bg-white overflow-hidden relative border border-blue-100">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-400">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold text-lg mr-3 shadow-md">
            A
          </div>
          <div className="flex-grow flex flex-col uppercase tracking-tighter">
            <span className="font-black text-white text-lg leading-tight">Zenture AI</span>
            <span className="text-[10px] font-bold text-blue-100 opacity-80">Wellness Companion</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'bg-white/30 text-white' : 'text-white/60 hover:bg-white/20'}`}
              title={voiceEnabled ? 'Voice On' : 'Voice Off'}
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={handleEndSession}
              title="New chat"
              className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Detected emotion badge */}
        {detectedEmotion && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Detected Emotion:</span>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full capitalize">{detectedEmotion}</span>
          </div>
        )}

        {/* Message Area */}
        <div className="flex-grow flex flex-col p-4 space-y-3 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-black text-4xl mb-3 shadow-lg">
                A
              </div>
              <span className="font-black text-xl text-slate-800 mb-1 uppercase tracking-tighter">AI Assistant</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-12">Your safe space for sharing and support.</span>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              <div
                className={`p-4 rounded-2xl max-w-[85%] break-words text-xs leading-relaxed ${
                  msg.isUser
                    ? 'self-end bg-blue-600 text-white rounded-br-none shadow-md'
                    : msg.isCrisis
                    ? 'self-start bg-red-50 text-red-800 border-2 border-red-100 rounded-bl-none'
                    : 'self-start bg-slate-100 text-slate-700 rounded-bl-none'
                }`}
              >
                {msg.isCrisis && <p className="font-black mb-1 uppercase tracking-widest text-[9px]">⚠️ Crisis Support</p>}
                {msg.text}
              </div>
              {!msg.isUser && msg.followUps && (
                <div className="self-start mt-3 flex flex-col space-y-2 w-full max-w-[85%]">
                  {msg.followUps.map((question, qIndex) => (
                    <button
                      key={qIndex}
                      onClick={() => handleSendMessage(question)}
                      className="p-3 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 bg-white text-left text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm group flex items-center justify-between"
                    >
                      {question}
                      <ChevronLeft className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {showFeedback && (
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mt-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-4">Did this conversation help you?</p>
              <div className="flex justify-center gap-2">
                <button onClick={() => handleFeedback(1)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-sm">Yes 😊</button>
                <button onClick={() => handleFeedback(0.5)} className="px-4 py-2 bg-slate-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-500 transition-all shadow-sm">Mid 😐</button>
                <button onClick={() => handleFeedback(0)} className="px-4 py-2 bg-red-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-sm">No 😞</button>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="self-start flex items-center gap-2 text-blue-400 bg-blue-50/50 p-3 rounded-xl rounded-bl-none">
              <Loader2 className="animate-spin" size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">Bot is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="p-4 border-t border-slate-100 bg-white shadow-lg relative z-10">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input
              type="text"
              className="flex-grow bg-transparent border-none py-2 px-3 focus:outline-none text-xs font-bold text-slate-700 placeholder:text-slate-400"
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputValue); }}
              disabled={isTyping}
            />
            <button
              onClick={() => setShowWebcam(!showWebcam)}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showWebcam ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}
              title="Expression Analysis"
            >
              <Camera size={18} />
            </button>
            <button
              onClick={() => router.push('/appointments')}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all shadow-none"
              title="Book Session"
            >
              <Calendar size={18} />
            </button>
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isTyping || !inputValue.trim()}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all shadow-lg ${isTyping || !inputValue.trim() ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Webcam Overlay */}
        {showWebcam && (
          <div className="absolute inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
               <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-white animate-spin" size={40} />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-white text-xs font-black uppercase tracking-widest mt-12 mb-2">Expression Analysis</p>
            <p className="text-slate-400 text-[10px] font-bold mb-10 px-6 leading-relaxed uppercase tracking-wider">
              AI uses your expression to personalize its support. <br/>
              <span className="text-cyan-400">No images are ever stored.</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowWebcam(false)}
                className="px-8 py-3 rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFacialScan}
                disabled={isScanning}
                className="px-10 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Scan Face
              </button>
            </div>
          </div>
        )}

        <div className="text-center py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          <span>[ Powered by Zenture AI ]</span>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ChatbotContent />
    </ProtectedRoute>
  );
}
