"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import CounsellorLayout from '@/components/counselor/layout';
import { Send, User as UserIcon, MoreVertical, MessageSquare, ChevronLeft } from 'lucide-react';
import { ProtectedRoute } from "@/components/protected-route";

interface Conversation {
    user: { id: number; name: string; role: string };
    last_message: string;
    timestamp: string;
    unread_count: number;
}

interface Message {
    id: number;
    content: string;
    timestamp: string;
    is_read: boolean;
    is_sender: boolean;
}

export default function MessagesPage() {
    return (
        <ProtectedRoute requiredRole="counselor">
            <Messages />
        </ProtectedRoute>
    );
}

function Messages() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null); // Conversation.user
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [showMobileChat, setShowMobileChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchConversations(); }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
            const interval = setInterval(() => fetchMessages(selectedUser.id), 5000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setConversations(await res.json());
        } catch (e) { }
    };

    const fetchMessages = async (uid: number) => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/messages/${uid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setMessages(await res.json());
        } catch (e) { }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser) return;
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_id: selectedUser.id,
                    content: inputText
                })
            });
            if (res.ok) {
                setInputText("");
                fetchMessages(selectedUser.id);
                fetchConversations(); // Update last message listing
            }
        } catch (e) { }
    };

    const handleSelectConversation = (user: any) => {
        setSelectedUser(user);
        setShowMobileChat(true);
    };

    return (
        <CounsellorLayout title="Messages" icon={<MessageSquare />}>
            <div className="flex bg-white rounded-3xl border border-slate-100 h-[calc(100vh-200px)] overflow-hidden shadow-sm">
                {/* Conversation List */}
                <div className={`w-full lg:w-80 border-r border-slate-50 flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Conversations</h2>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <MessageSquare size={16} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {conversations.map(c => (
                            <div
                                key={c.user.id}
                                onClick={() => handleSelectConversation(c.user)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${selectedUser?.id === c.user.id
                                    ? 'bg-blue-600 shadow-xl shadow-blue-200'
                                    : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-black uppercase text-xs tracking-tight ${selectedUser?.id === c.user.id ? 'text-white' : 'text-slate-900'}`}>
                                        {c.user.name}
                                    </span>
                                    <span className={`text-[9px] font-bold ${selectedUser?.id === c.user.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <div className={`text-[10px] font-medium truncate ${selectedUser?.id === c.user.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {c.last_message}
                                </div>
                                {c.unread_count > 0 && (
                                    <span className="inline-block mt-2 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-400 shadow-sm">
                                        {c.unread_count} New
                                    </span>
                                )}
                            </div>
                        ))}
                        {conversations.length === 0 && (
                            <div className="text-center py-20 opacity-30 grayscale">
                                <MessageSquare size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No active chats</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {selectedUser ? (
                    <div className={`flex-1 flex flex-col bg-white ${showMobileChat ? 'flex' : 'hidden lg:flex'}`}>
                        {/* Header */}
                        <div className="bg-white p-4 border-b border-slate-50 flex justify-between items-center shadow-sm relative z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowMobileChat(false)}
                                    className="lg:hidden p-2 hover:bg-slate-50 rounded-xl"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                    <UserIcon className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">{selectedUser.name}</h2>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
                            {messages.map(m => {
                                const isIncoming = !m.is_sender;
                                return (
                                    <div key={m.id} className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] md:max-w-[70%] group`}>
                                            <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm relative ${isIncoming
                                                ? 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                                                : 'bg-slate-900 text-white rounded-br-none shadow-xl shadow-slate-200'
                                                }`}>
                                                {m.content}
                                            </div>
                                            <div className={`mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef}></div>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-slate-50 shadow-2xl">
                            <form onSubmit={sendMessage} className="flex gap-4">
                                <input
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 ring-blue-500 outline-none shadow-inner"
                                    placeholder="Write your message..."
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-slate-300 bg-white p-20 text-center">
                        <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100">
                            <MessageSquare size={48} className="opacity-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Private Messaging</h3>
                        <p className="text-xs text-slate-400 font-medium max-w-xs uppercase tracking-widest leading-relaxed">Select a conversation from the left to start communicating with students securely.</p>
                    </div>
                )}
            </div>
        </CounsellorLayout>
    );
}
