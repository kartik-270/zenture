'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Volume2, VolumeX, Calendar, RotateCcw, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiConfig } from '@/lib/config';
import { getAuthToken } from '@/lib/auth';

interface Message {
  text: string;
  isUser: boolean;
  followUps?: string[];
  isCrisis?: boolean;
}

export function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [bubbleBottom, setBubbleBottom] = useState(24);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById('main-footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (footerRect.top < viewportHeight) {
        const overlap = viewportHeight - footerRect.top;
        setBubbleBottom(overlap + 24);
      } else {
        setBubbleBottom(24);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim()) return;

    if (messageToSend === 'Book a Counselor Session') {
      router.push('/appointments');
      setIsOpen(false);
      return;
    }

    setMessages((prev) => [...prev, { text: messageToSend, isUser: true }]);
    setInputValue('');
    setIsTyping(true);

    setMessages((prev) => [...prev, { text: '', isUser: false }]);

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
      let fullResponse = '';

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
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg && !lastMsg.isUser) {
                    lastMsg.text = botText;
                  }
                  return newMessages;
                });
              } else if (data.final) {
                if (data.conversation_id && !conversationId) {
                  setConversationId(data.conversation_id);
                }
                fullResponse = data.full_response || botText;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg && !lastMsg.isUser) {
                    lastMsg.text = fullResponse;
                    lastMsg.followUps = data.followUps;
                    lastMsg.isCrisis = data.is_crisis || false;
                  }
                  return newMessages;
                });

                if (voiceEnabled) {
                  speak(fullResponse);
                }
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
      console.error('Error fetching chatbot response:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].text === '') {
          newMessages.pop();
        }
        return [
          ...newMessages,
          {
            text: "I'm having trouble connecting. Please ensure the backend is running and models are trained.",
            isUser: false,
          },
        ];
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
        body: JSON.stringify({
          conversation_id: conversationId,
          score: score,
        }),
      });
      setFeedbackSubmitted(true);
      setShowFeedback(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.start();
  };

  const speak = (text: string) => {
    if (!voiceEnabled) return;

    const strippedText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    const utterance = new SpeechSynthesisUtterance(strippedText);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.name.includes('Google UK English Female') ||
          v.name.includes('Microsoft Zira') ||
          (v.name.includes('Female') && v.lang.startsWith('en')) ||
          v.name.includes('Samantha')
      ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!mounted) return null;

  return (
    <div style={{ position: 'fixed', bottom: `${bubbleBottom}px`, right: '24px', zIndex: 40 }}>
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 max-w-sm h-screen max-h-96 bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-2xl flex flex-col border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Zenture AI</h3>
              <p className="text-xs opacity-90">Your Personal Wellness Companion</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleEndSession}
                title="New chat"
                className="p-2 text-white/70 hover:bg-white/20 rounded-full transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => { router.push('/chatbot'); setIsOpen(false); }}
                title="Open full chatbot"
                className="p-2 text-white/70 hover:bg-white/20 rounded-full transition-colors"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="mx-auto mb-2 opacity-30" size={32} />
                <p className="font-semibold text-sm">Welcome!</p>
                <p className="text-xs">I'm your personal support assistant. What's on your mind today?</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.isUser ? 'bg-blue-500 text-white' : msg.isCrisis ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.isCrisis && <p className="font-bold mb-1">⚠️ Crisis Support</p>}
                  {msg.text}
                  {!msg.isUser && msg.followUps && (
                    <div className="mt-2 space-y-1">
                      {msg.followUps.map((q, j) => (
                        <button
                          key={j}
                          onClick={() => handleSendMessage(q)}
                          className="block w-full px-2 py-1 bg-white border border-blue-200 text-blue-600 rounded text-xs text-left hover:bg-blue-50 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            {showFeedback && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                <p className="text-sm font-semibold mb-2">Did this conversation help you?</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleFeedback(1)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(0)}
                    className="px-3 py-1 bg-red-400 text-white rounded text-xs font-bold hover:bg-red-500"
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-100 rounded-full outline-none text-sm"
              />
              <button onClick={startListening} className="p-2 hover:bg-gray-100 rounded-full">
                {isListening ? <MicOff size={18} className="text-red-500" /> : <Mic size={18} className="text-gray-600" />}
              </button>
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 text-blue-600 disabled:text-gray-400"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
