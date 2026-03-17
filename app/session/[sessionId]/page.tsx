"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { io, Socket } from "socket.io-client"
import { Loader2, ShieldCheck, VideoOff, Mic, MicOff, Video as VideoIcon, PhoneOff, MessageSquare, Send, Phone, VideoOff as VideoOffIcon, X } from 'lucide-react'
import { apiConfig } from "@/lib/config"
import { getAuthToken } from "@/lib/auth"

// Default Fallback Configuration
const FALLBACK_RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

// Derive socket URL from API config (remove /api suffix if present)
const SOCKET_URL = apiConfig.baseUrl.replace(/\/api\/?$/, "");

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.sessionId as string

  // Access & User State
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [user, setUser] = useState<{ id: string | number; name: string; role: string } | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | number | null>(null);
  const [sessionMode, setSessionMode] = useState('video_call');
  const [turnServers, setTurnServers] = useState<any>(FALLBACK_RTC_CONFIG);
  const [errorHeader, setErrorHeader] = useState("Access Denied");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    feedback: '',
    rating: 5,
    helpfulness: 5,
    emotional_state: 'Neutral'
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Connection State
  const [status, setStatus] = useState("Initializing connection...");
  const [peerConnected, setPeerConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Seconds remaining

  // Media State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null); 
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const sessionModeRef = useRef<string>('video_call');

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRedirection = () => {
    const role = user?.role || localStorage.getItem('userRole') || 'student';
    if (role === 'counselor') {
      router.push('/counsellor/dashboard');
    } else if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const hangup = async () => {
    if (confirm("Are you sure you want to end the session?")) {
      const role = user?.role || localStorage.getItem('userRole') || 'student';

      if (role === 'student' && appointmentId) {
        if (confirm("Allow counselor to send follow-up messages?")) {
          try {
            const token = getAuthToken();
            await fetch(`${apiConfig.baseUrl}/appointments/${appointmentId}/messaging-permission`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              },
              body: JSON.stringify({ allow_messaging: true })
            });
          } catch (e) {
            console.error("Failed to save permission:", e);
          }
        }
      }

      if (role === 'counselor' || role === 'admin') {
        handleRedirection();
      } else {
        setShowFeedback(true);
      }
    }
  };

  const submitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${apiConfig.baseUrl}/appointments/${appointmentId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(feedbackForm)
      });

      if (res.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => handleRedirection(), 2000);
      } else {
        alert("Failed to submit feedback. Redirecting...");
        handleRedirection();
      }
    } catch (e) {
      console.error("Feedback error:", e);
      handleRedirection();
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      alert("Session time has ended.");
      handleRedirection();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Verify Access
  useEffect(() => {
    const verifyAccess = async () => {
      const token = getAuthToken();
      if (!token) {
        fail("Authentication Required", "Please log in to join the session.");
        return;
      }
      try {
        const res = await fetch(`${apiConfig.baseUrl}/session/verify/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.allowed) {
          setUser(data.user);
          setAppointmentId(data.appointment_id);
          setSessionMode(data.mode);
          sessionModeRef.current = data.mode; 
          setAccessGranted(true);

          const startTime = new Date(data.startTime).getTime();
          const now = new Date().getTime();
          const bucket = 30 * 60 * 1000; 
          const elapsed = now - startTime;
          const remaining = Math.max(0, Math.ceil((bucket - elapsed) / 1000));

          setTimeLeft(remaining);

          if (data.mode === 'message') setIsMuted(true);

          try {
            const turnRes = await fetch(`${apiConfig.baseUrl}/session/turn-credentials`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const turnData = await turnRes.json();
            if (turnData.iceServers) {
              setTurnServers({ iceServers: turnData.iceServers });
            }
          } catch (turnErr) {
            console.error("Failed to fetch TURN credentials, using fallback STUN:", turnErr);
          }

        } else {
          fail("Session Unavailable", data.error || "You do not have permission to join this session.");
        }
      } catch (e) {
        fail("Connection Error", "Could not verify session. Please check your internet.");
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) verifyAccess();
  }, [sessionId]);

  const fail = (header: string, msg: string) => {
    setErrorHeader(header);
    setErrorMsg(msg);
    setLoading(false);
  };

  // 2. Initialize Call Logic
  useEffect(() => {
    if (!accessGranted || !sessionId || !user) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus("Connected. Joining secure room...");
      socket.emit('join-room', { roomId: sessionId, userId: user.id });
    });

    socket.io.on('reconnect', () => {
      socket.emit('join-room', { roomId: sessionId, userId: user.id });
    });

    socket.on('user-connected', (userId) => {
      setStatus("Peer joined. Establishing secure connection...");
      setPeerConnected(true);
      if (!pcRef.current || pcRef.current.signalingState === 'stable') {
        createOffer();
      }
    });

    socket.on('user-disconnected', (userId) => {
      setStatus("Participant left. Waiting for them to rejoin...");
      setPeerConnected(false);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    });

    socket.on('offer', async (data) => {
      setStatus("Incoming connection...");
      setPeerConnected(true);
      handleOffer(data);
    });

    socket.on('answer', async (data) => {
      setStatus("Connection established.");
      handleAnswer(data);
    });

    socket.on('ice-candidate', async (data) => {
      handleCandidate(data);
    });

    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, { sender: "Peer", text: data.message }]);
    });

    const initMedia = async () => {
      const currentMode = sessionModeRef.current;
      if (currentMode === 'message') {
        setStatus("Chat Session Active");
        setPeerConnected(true); 
        return;
      }

      try {
        const constraints = {
          audio: true,
          video: currentMode === 'video_call'
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        setLocalStream(stream);

        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        if (pcRef.current) {
          stream.getTracks().forEach(track => {
            pcRef.current!.addTrack(track, stream);
          });
        }

      } catch (err) {
        console.error("Media Access Error:", err);
        setStatus("Error accessing Camera/Microphone. Check permissions.");
      }
    };

    initMedia();

    return () => {
      socket.disconnect();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (pcRef.current) pcRef.current.close();
    };
  }, [accessGranted, sessionId, user, SOCKET_URL]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, localVideoRef.current, isVideoOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, remoteVideoRef.current]);

  const createPeerConnection = () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(turnServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          roomId: sessionId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus("Securely Connected");
      if (pc.connectionState === 'failed') setStatus("Connection Failed. Check network.");
    };

    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== 'stable') return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('offer', { roomId: sessionId, offer });
      } catch (e) {
        console.error("Renegotiation error:", e);
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      setPeerConnected(true);
      setStatus("Active Session");
    };

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    pcRef.current = pc;
    return pc;
  };

  const createOffer = async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', { roomId: sessionId, offer });
    } catch (err) {
      console.error("Offer Creation Error:", err);
    }
  };

  const handleOffer = async (data: any) => {
    const pc = createPeerConnection();
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit('answer', { roomId: sessionId, answer });
    } catch (err) {
      console.error("Handle Offer Error:", err);
    }
  };

  const handleAnswer = async (data: any) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (err) {
      console.error("Handle Answer Error:", err);
    }
  };

  const handleCandidate = async (data: any) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error("Handle Candidate Error:", err);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    socketRef.current?.emit('chat-message', { roomId: sessionId, message: inputText });
    setMessages(prev => [...prev, { sender: "You", text: inputText }]);
    setInputText("");
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
      <p className="text-gray-600">Verifying secure session...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <VideoOff className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{errorHeader}</h1>
      <p className="text-gray-600 max-w-md mb-6">{errorMsg}</p>
      <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">Return Home</button>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex flex-col overflow-hidden relative">
      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
            
            {feedbackSubmitted ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Thank You!</h2>
                <p className="text-gray-500 font-medium">Your feedback has been recorded. Redirecting you home...</p>
              </div>
            ) : (
              <div className="relative z-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Session Feedback</h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">Role: {user?.role}</p>

                <div className="space-y-6">
                  {user?.role === 'student' ? (
                    <>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">How do you feel now?</label>
                        <select 
                          className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                          value={feedbackForm.emotional_state}
                          onChange={e => setFeedbackForm({...feedbackForm, emotional_state: e.target.value})}
                        >
                          {['Happy', 'Relieved', 'Calm', 'Neutral', 'Sad', 'Anxious'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Session Helpfulness (1-5)</label>
                          <input 
                            type="number" min="1" max="5"
                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                            value={feedbackForm.helpfulness}
                            onChange={e => setFeedbackForm({...feedbackForm, helpfulness: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Counselor Rating (1-5)</label>
                          <input 
                            type="number" min="1" max="5"
                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                            value={feedbackForm.rating}
                            onChange={e => setFeedbackForm({...feedbackForm, rating: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Student's Emotional State (Assessment)</label>
                      <input 
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                        placeholder="e.g. Improved, Stable, Crisis"
                        value={feedbackForm.emotional_state}
                        onChange={e => setFeedbackForm({...feedbackForm, emotional_state: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      {user?.role === 'student' ? 'Share your experience...' : 'Case notes and feedback about student...'}
                    </label>
                    <textarea 
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all min-h-[120px]"
                      placeholder="Type here..."
                      value={feedbackForm.feedback}
                      onChange={e => setFeedbackForm({...feedbackForm, feedback: e.target.value})}
                    />
                  </div>

                  <button 
                    onClick={submitFeedback}
                    disabled={submittingFeedback}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingFeedback ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    Submit Final Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <ShieldCheck className="text-green-400" />
          <span className="font-semibold tracking-wide text-lg shadow-black drop-shadow-md">
            Zenture Secure {sessionMode === 'voice_call' ? 'Voice' : (sessionMode === 'message' ? 'Chat' : 'Video')}
          </span>
        </div>
        <div className="flex flex-col items-end pointer-events-auto">
          {timeLeft !== null && (
            <div className={`text-xl font-mono font-bold px-3 py-1 rounded mb-1 shadow-lg ${timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-black/50'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-sm opacity-80 bg-black/40 px-3 py-1 rounded-full">{status}</div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-slate-800">
        {sessionMode === 'message' ? (
          <div className="w-full h-full flex flex-col bg-gray-100">
            {/* Chat Header for Message Mode */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full"><MessageSquare className="text-blue-600" /></div>
                <div>
                  <h2 className="font-bold text-gray-800">Secure Consultation Chat</h2>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Active Session
                  </div>
                </div>
              </div>
              <button onClick={hangup} className="text-red-500 font-medium hover:bg-red-50 px-3 py-1 rounded">End Chat</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50 text-blue-600" />
                  <p className="font-medium text-gray-500">Messages are end-to-end encrypted.</p>
                  <p className="text-sm">Start the conversation...</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${m.sender === 'You' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>
                    <p>{m.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t flex justify-center">
              <div className="max-w-3xl w-full">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                  <button type="submit" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-md">
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {sessionMode === 'video_call' ? (
              <>
                {remoteStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 animate-pulse">
                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <VideoIcon className="w-10 h-10 opacity-50" />
                    </div>
                    <p>{peerConnected ? "Establishing media stream..." : "Waiting for participant ..."}</p>
                  </div>
                )}
                <div className="absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-36 bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl z-10">
                  {localStream && !isVideoOff ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <span className="text-xl font-bold text-slate-500">{user?.name[0]}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-8">
                <audio ref={remoteVideoRef} autoPlay playsInline />
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg z-10 relative">
                    <Phone className="w-12 h-12 text-white" />
                  </div>
                  {peerConnected && (
                    <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary opacity-20 animate-ping"></div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{peerConnected ? "Connected" : "Calling..."}</h2>
                  <p className="text-slate-400 mt-2">{status}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-center gap-8 z-20 pb-4">
        <button onClick={toggleMute} className={`p-4 rounded-full transition transform hover:scale-110 ${isMuted ? "bg-red-500 text-white" : "bg-slate-700 text-white"}`}>
          {isMuted ? <MicOff /> : <Mic />}
        </button>

        {sessionMode === 'video_call' && (
          <button onClick={toggleVideo} className={`p-4 rounded-full transition transform hover:scale-110 ${isVideoOff ? "bg-red-500 text-white" : "bg-slate-700 text-white"}`}>
            {isVideoOff ? <VideoOffIcon /> : <VideoIcon />}
          </button>
        )}

        <button onClick={hangup} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transform hover:scale-110 shadow-lg">
          <PhoneOff className="w-6 h-6" />
        </button>

        <button onClick={() => alert("Quick chat overlay coming soon!")} className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transform hover:scale-110">
          <MessageSquare />
        </button>
      </div>
    </div>
  )
}
