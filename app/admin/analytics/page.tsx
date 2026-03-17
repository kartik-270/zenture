"use client";

import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    MessageSquare,
    TrendingUp,
    Heart,
    CheckCircle,
    Activity,
    Shield,
    ArrowRight
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import {
    StressRadarChart,
    WellnessGauge,
    ActionableInsightCard
} from "@/components/admin/holistic-charts";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ChatAnalytics() {
    return (
        <ProtectedRoute requiredRole="admin">
            <ChatAnalyticsContent />
        </ProtectedRoute>
    );
}

function ChatAnalyticsContent() {
    const [username, setUsername] = useState("Admin");
    const [chatbotStats, setChatbotStats] = useState<any>(null);
    const [nlpAnalytics, setNlpAnalytics] = useState<any>(null);
    const [holisticData, setHolisticData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingHolistic, setLoadingHolistic] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) setUsername(storedUsername);

        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = getAuthToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const [chatbotRes, nlpRes, holisticRes] = await Promise.all([
                fetch(`${apiConfig.baseUrl}/admin/analytics/chatbot`, { headers }),
                fetch(`${apiConfig.baseUrl}/admin/analytics/chat`, { headers }),
                fetch(`${apiConfig.baseUrl}/admin/analytics/holistic`, { headers })
            ]);

            if (chatbotRes.ok) setChatbotStats(await chatbotRes.json());
            if (nlpRes.ok) setNlpAnalytics(await nlpRes.json());
            if (holisticRes.ok) setHolisticData(await holisticRes.json());

        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
            setLoadingHolistic(false);
        }
    };

    if (loading || !chatbotStats || !nlpAnalytics) {
        return (
            <AdminLayout title="Chatbot AI Insights" icon={<MessageSquare className="text-purple-600" />} username={username}>
                <div className="p-8 text-center text-gray-500">Loading Analytics...</div>
            </AdminLayout>
        );
    }

    const emotionData = Object.entries(chatbotStats.emotionDistribution || {}).map(([name, value]) => ({
        name,
        value
    }));

    const trendData = Object.entries(chatbotStats.trends || {}).map(([date, emotions]: [string, any]) => ({
        date,
        ...emotions
    }));

    const risks = nlpAnalytics?.risks || [];

    return (
        <AdminLayout
            title="Chatbot AI Insights"
            icon={<MessageSquare className="text-purple-600" />}
            username={username}
        >
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Holistic Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="text-purple-600" /> Holistic Welfare Distribution
                            </h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aggregate Analysis</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {loadingHolistic ? (
                                <div className="h-64 flex items-center justify-center">Loading stress patterns...</div>
                            ) : (
                                <StressRadarChart data={holisticData?.causesOfStress || []} />
                            )}
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Key Observation</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        The radar chart shows <strong>{holisticData?.causesOfStress?.sort((a: any, b: any) => b.A - a.A)[0]?.subject || "N/A"}</strong> as the primary driver of student concern this month.
                                    </p>
                                </div>
                                {loadingHolistic ? (
                                    <div className="h-40 flex items-center justify-center">Loading index...</div>
                                ) : (
                                    <WellnessGauge value={holisticData?.wellnessIndex || 0} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Activity className="text-blue-500" /> Actionable Insights
                        </h3>
                        <div className="space-y-2">
                            {loadingHolistic ? (
                                [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)
                            ) : (
                                holisticData?.insights?.map((insight: any) => (
                                    <ActionableInsightCard
                                        key={insight.id}
                                        title={insight.title}
                                        description={insight.description}
                                        type={insight.type as any}
                                        onClick={() => toast({ title: "Insight Details", description: "Opening detailed recommendation plan..." })}
                                    />
                                ))
                            )}
                        </div>
                        <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 group">
                            Generate Full Report <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completion Rate</p>
                            <h3 className="text-2xl font-bold text-gray-800">{chatbotStats.completionRate}%</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="text-green-500" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Avg Feedback</p>
                            <h3 className="text-2xl font-bold text-gray-800">{chatbotStats.avgFeedbackScore}/1</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg"><Heart className="text-blue-500" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Crisis Flags</p>
                            <h3 className="text-2xl font-bold text-red-600">{chatbotStats.crisisCount}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg"><AlertTriangle className="text-red-500" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Primary Emotion</p>
                            <h3 className="text-2xl font-bold text-purple-600 text-sm">
                                {emotionData.length > 0 ? (emotionData as any[]).sort((a: any, b: any) => b.value - a.value)[0]?.name : "None"}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg"><Activity className="text-purple-500" /></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            😊 Emotional Distribution
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={emotionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {emotionData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Emotional Trends (7 Days)
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="stressed" fill="#FF8042" stackId="a" />
                                    <Bar dataKey="anxious" fill="#FFBB28" stackId="a" />
                                    <Bar dataKey="neutral" fill="#00C49F" stackId="a" />
                                    <Bar dataKey="happy" fill="#0088FE" stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* High Risk Identifications */}
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <AlertTriangle className="text-red-500" size={28} /> High-Risk AI Identifications
                            </h3>
                            <p className="text-gray-500 mt-1">Autonomous risk detection system flags for urgent review</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2">
                                <Shield size={16} /> Priority 1 Level
                            </div>
                            <button
                                onClick={() => window.location.href = '/admin/dashboard'}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Go to Alert Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Student Identity</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Risk Factors</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Risk Level</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {risks.map((risk: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                                    {risk.studentId.includes('_') ? risk.studentId.split('_')[1] : risk.studentId.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-800">{risk.studentId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                {risk.riskFactors.map((f: string, j: number) => (
                                                    <span key={j} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold uppercase border border-red-100">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full w-24">
                                                    <div
                                                        className="h-full bg-red-500 rounded-full"
                                                        style={{ width: `${risk.riskScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-red-600">{risk.riskScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={() => window.location.href = '/admin/dashboard'}
                                                className="text-red-600 font-bold text-sm hover:underline flex items-center gap-1"
                                            >
                                                Urgent Review <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {risks.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No high-risk identifications at this time.</div>
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
