"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart2,
    Users,
    Stethoscope,
    Activity,
    Calendar,
    TrendingUp
} from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminReports() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminReportsContent />
        </ProtectedRoute>
    );
}

function AdminReportsContent() {
    const [username, setUsername] = useState("Admin");
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        avgSessionDuration: "0 min"
    });

    const [engagementData, setEngagementData] = useState<any>(null);
    const [moodData, setMoodData] = useState<any[]>([]);
    const [assessmentData, setAssessmentData] = useState<any[]>([]);

    const { toast } = useToast();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = getAuthToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [ovRes, enRes, moRes, asRes] = await Promise.all([
                fetch(`${apiConfig.baseUrl}/admin/analytics/overview`, { headers }),
                fetch(`${apiConfig.baseUrl}/admin/analytics/engagement`, { headers }),
                fetch(`${apiConfig.baseUrl}/admin/analytics/mood`, { headers }),
                fetch(`${apiConfig.baseUrl}/admin/analytics/assessments`, { headers })
            ]);

            if (ovRes.ok) setOverview(await ovRes.json());
            if (enRes.ok) setEngagementData(await enRes.json());
            if (moRes.ok) setMoodData(await moRes.json());
            if (asRes.ok) setAssessmentData(await asRes.json());

        } catch (e) {
            console.error(e);
            toast({ title: "Failed to load report data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Chart Components
    const LineChart = ({ data, colors }: { data: { label: string, value: number }[][]; colors: string[] }) => {
        const chartHeight = 200;
        const chartWidth = 500;
        const allValues = data.flatMap(series => series.map(d => d.value));
        const yAxisMax = Math.max(...allValues, 10);
        const yAxisMin = 0;
        const yRatio = chartHeight / (yAxisMax - yAxisMin);
        const xRatio = chartWidth / (data[0].length - 1 || 1);
        const days = data[0].map(d => d.label);

        return (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full">
                {days.map((day, i) => (
                    <text key={`label-${i}`} x={i * xRatio} y={chartHeight + 15} textAnchor="middle" fontSize="12" fill="#4b5563">
                        {day}
                    </text>
                ))}
                {data.map((series, seriesIndex) => {
                    const points = series.map((d, i) => `${i * xRatio},${chartHeight - (d.value - yAxisMin) * yRatio}`).join(" ");
                    return (
                        <g key={seriesIndex}>
                            <polyline fill="none" stroke={colors[seriesIndex]} strokeWidth="2" points={points} />
                            {series.map((d, i) => (
                                <circle key={i} cx={i * xRatio} cy={chartHeight - (d.value - yAxisMin) * yRatio} r="4" fill={colors[seriesIndex]} />
                            ))}
                        </g>
                    );
                })}
            </svg>
        );
    };

    const AnxietyAnalysisChart = ({ data }: { data: { day: string, low: number, medium: number, high: number }[] }) => {
        const chartHeight = 200;
        const chartWidth = 500;
        const maxTotal = Math.max(...data.map(d => d.low + d.medium + d.high), 10);

        return (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full">
                {data.map((d, index) => {
                    const barWidth = (chartWidth / data.length) * 0.7;
                    const barX = (chartWidth / data.length) * index + (chartWidth / data.length - barWidth) / 2;
                    const lowHeight = (d.low / maxTotal) * chartHeight;
                    const mediumHeight = (d.medium / maxTotal) * chartHeight;
                    const highHeight = (d.high / maxTotal) * chartHeight;

                    return (
                        <g key={index}>
                            <rect x={barX} y={chartHeight - lowHeight} width={barWidth} height={lowHeight} fill="#22c55e" />
                            <rect x={barX} y={chartHeight - lowHeight - mediumHeight} width={barWidth} height={mediumHeight} fill="#f97316" />
                            <rect x={barX} y={chartHeight - lowHeight - mediumHeight - highHeight} width={barWidth} height={highHeight} fill="#ef4444" />
                            <text x={barX + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="12" fill="#4b5563">
                                {d.day}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    const AssessmentResultsChart = ({ data }: { data: { test: string, count: number }[] }) => {
        const chartHeight = 200;
        const chartWidth = 500;
        const maxCount = Math.max(...data.map(d => d.count), 5);
        const barWidth = (chartWidth / (data.length || 1)) * 0.4;

        return (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full">
                {data.map((d, index) => {
                    const barX = (chartWidth / data.length) * index + (chartWidth / data.length - barWidth) / 2;
                    const barHeight = (d.count / maxCount) * chartHeight;

                    return (
                        <g key={index}>
                            <rect x={barX} y={chartHeight - barHeight} width={barWidth} height={barHeight} fill="#8b5cf6" rx="4" />
                            <text x={barX + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="12" fill="#4b5563">
                                {d.test}
                            </text>
                            <text x={barX + barWidth / 2} y={chartHeight - barHeight - 5} textAnchor="middle" fontSize="12" fill="#8b5cf6" fontWeight="bold">
                                {d.count}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <AdminLayout
            title="Reporting & Analytics"
            icon={<BarChart2 className="text-blue-500" />}
            username={username}
        >
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Total Users</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{overview.totalUsers}</h3>
                                </div>
                                <Users className="text-blue-500" size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Active Users (30d)</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{overview.activeUsers}</h3>
                                </div>
                                <Activity className="text-green-500" size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Total Sessions</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{overview.totalSessions}</h3>
                                </div>
                                <Stethoscope className="text-purple-500" size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Avg Session Duration</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{overview.avgSessionDuration}</h3>
                                </div>
                                <Calendar className="text-orange-500" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-blue-500" /> Engagement Trends
                            </h3>
                            <div className="h-64 flex-1 flex flex-col items-center justify-center">
                                {engagementData ? (
                                    <>
                                        <LineChart
                                            data={[engagementData.newUsers, engagementData.activeSessions]}
                                            colors={["#2563eb", "#f97316"]}
                                        />
                                        <div className="flex justify-center space-x-6 mt-4">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
                                                <span className="text-sm text-gray-700 font-medium">New Users</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                                                <span className="text-sm text-gray-700 font-medium">Active Sessions</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500">No engagement data available.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Activity className="text-red-500" /> Mood Analysis (Past 7 Days)
                            </h3>
                            <div className="h-64 flex-1 flex flex-col items-center justify-center">
                                {moodData.length > 0 ? (
                                    <>
                                        <AnxietyAnalysisChart data={moodData} />
                                        <div className="flex justify-center space-x-6 mt-4">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                                <span className="text-sm text-gray-700 font-medium">Low</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                                                <span className="text-sm text-gray-700 font-medium">Medium</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                                                <span className="text-sm text-gray-700 font-medium">High</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500">No mood data available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Stethoscope className="text-purple-500" /> Screening Test Participation
                        </h3>
                        <div className="h-64 flex flex-col items-center justify-center">
                            {assessmentData.length > 0 ? (
                                <AssessmentResultsChart data={assessmentData} />
                            ) : (
                                <p className="text-gray-500">No screening data available yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
