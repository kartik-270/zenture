'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Headphones, Heart, Search, X, ChevronDown } from 'lucide-react';
import { DailyWellnessCorner } from '@/components/DailyWellnessCorner';
import { apiConfig } from '@/lib/config';
import { getAuthToken } from '@/lib/auth';

interface Resource {
  id: string | number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'exercise';
  category: string;
  author?: string;
  url?: string;
}

const STATIC_RESOURCES: Resource[] = [
  // {
  //   id: 's1',
  //   title: '5-Minute Mindfulness Exercise',
  //   description: 'A quick guided session to clear your mind and reduce immediate stress.',
  //   type: 'exercise',
  //   category: 'Mindfulness',
  //   url: '#'
  // },
  // {
  //   id: 's2',
  //   title: 'Managing Exam Anxiety',
  //   description: 'Effective strategies to stay calm and focused during high-pressure academic periods.',
  //   type: 'article',
  //   category: 'Academic',
  //   url: '#'
  // },
  // {
  //   id: 's3',
  //   title: 'The Science of Resilience',
  //   description: 'Understanding how we bounce back from adversity and how to build your own psychological strength.',
  //   type: 'article',
  //   category: 'General',
  //   url: '#'
  // },
  // {
  //   id: 's4',
  //   title: 'Guided Sleep Meditation',
  //   description: 'A soothing audio track designed to help you unwind and achieve better sleep quality.',
  //   type: 'audio',
  //   category: 'Sleep',
  //   url: '#'
  // },
  // {
  //   id: 's5',
  //   title: 'Productivity & Mental Health',
  //   description: 'Balancing your academic output with self-care to avoid burnout.',
  //   type: 'video',
  //   category: 'Academic',
  //   url: '#'
  // },
  // {
  //   id: 's6',
  //   title: 'Building Healthy Boundaries',
  //   description: 'Learn how to protect your energy and improve your relationships through clear communication.',
  //   type: 'article',
  //   category: 'Relationships',
  //   url: '#'
  // }
];

export default function ResourcesPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ResourcesContent />
    </ProtectedRoute>
  );
}

function ResourcesContent() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Resource | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeLanguage, setActiveLanguage] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const filters = ["all", "article", "video", "audio", "exercise", "wellness"];
  const languages = ["all", "English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam"];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${apiConfig.baseUrl}/resources`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      let finalResources = [...STATIC_RESOURCES];
      if (response.ok) {
        const data = await response.json();
        finalResources = [...finalResources, ...data];
      }
      setResources(finalResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources(STATIC_RESOURCES);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (item: Resource) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const isDirectMedia = (url: string | undefined) => {
    if (!url || url === '#') return false;
    return url.startsWith('/uploads') || url.startsWith('http');
  };

  const getSourceUrl = (url: string | undefined) => {
    if (!url || url === '#') return "";
    if (url.startsWith('http')) return url;
    return `${apiConfig.baseUrl}${url}`;
  };

  const getYouTubeEmbedUrl = (url: string | undefined) => {
    if (!url || !url.includes("youtube.com/watch?v=")) return undefined;
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  const filteredData = resources.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const itemLanguage = (item as any).language || "English";
    const matchesLanguage = activeLanguage === 'all' || itemLanguage === activeLanguage;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesLanguage && matchesSearch;
  });

  // Include Wellness Corner in the list if it matches filters
  const showWellnessCorner = (activeFilter === 'all' || activeFilter === 'wellness') && 
                            (activeLanguage === 'all' || activeLanguage === 'English') &&
                            ("Daily Wellness Corner".toLowerCase().includes(searchTerm.toLowerCase()));

  const getPlaceholderImage = (type: string) => {
    switch (type) {
  //     case 'video': return "https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg";
  //     case 'audio': return "https://www.hellomyyoga.com/blog/wp-content/uploads/2024/02/what-is-guided-meditation.webp";
      case 'article': return "https://cdn2.psychologytoday.com/assets/styles/manual_crop_3_2_600x400/public/teaser_image/blog_entry/2025-03/pexels-ivan-samkov-5676744.jpg?itok=gCTxLgRX";
  //     case 'exercise': return "https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg";
      default: return "https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="text-primary" size={20} />;
      case 'video': return <Video className="text-primary" size={20} />;
      case 'audio': return <Headphones className="text-primary" size={20} />;
      case 'exercise': return <Heart className="text-primary" size={20} />;
      default: return <Heart className="text-primary" size={20} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Psychoeducational Hub
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              Explore curated resources to support your mental wellbeing and personal growth.
            </p>

            {/* Search and Filters */}
            <div className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto">
              <div className="relative w-full md:w-1/2 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="relative w-full md:w-1/3 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Heart size={18} />
                </div>
                <select
                  value={activeLanguage}
                  onChange={(e) => setActiveLanguage(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none appearance-none font-medium text-slate-700"
                >
                  <option value="all">All Languages</option>
                  {languages.filter(l => l !== 'all').map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 ${activeFilter === f
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading wellness resources...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Daily Wellness Corner card — integrated into grid */}
              {showWellnessCorner && (
                <div className="lg:col-span-1">
                  <DailyWellnessCorner />
                </div>
              )}

              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleCardClick(item)}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:border-primary/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="w-full h-48 overflow-hidden relative">
                      <img
                        src={item.url && (item.type === 'article' || item.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? getSourceUrl(item.url):""}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/5 rounded-xl text-primary group-hover:bg-primary transition-colors group-hover:text-white">
                            {getTypeIcon(item.type)}
                          </div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{item.type}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                          {(item as any).language || "English"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-3 line-clamp-3 leading-relaxed flex-grow">{item.description}</p>
                      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(item as any).author || "Campus Wellness"}</span>
                        <div className="text-primary group-hover:translate-x-1 transition-transform">
                          <Search size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No resources found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
                  <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setActiveFilter('all'); setActiveLanguage('all'); setSearchTerm(''); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Media Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 max-h-[90vh] flex flex-col">
            <button
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md z-30 transition-all border border-white/20"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>

            {/* Media Content Section */}
            <div className="w-full bg-slate-900">
              {currentItem.type === "video" && (
                <div className="aspect-video w-full">
                  {(() => {
                    const embedUrl = getYouTubeEmbedUrl(currentItem.url);
                    if (embedUrl) {
                      return (
                        <iframe
                          className="w-full h-full"
                          src={embedUrl}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      );
                    }
                    if (isDirectMedia(currentItem.url)) {
                      return <video controls className="w-full h-full" src={getSourceUrl(currentItem.url)} />;
                    }
                    return <div className="flex items-center justify-center h-full text-white/50 font-medium">Video content unavailable</div>;
                  })()}
                </div>
              )}

              {currentItem.type === "audio" && (
                <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 p-12 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 animate-pulse text-primary">
                    <Headphones size={64} />
                  </div>
                  {isDirectMedia(currentItem.url) ? (
                    <audio controls className="w-full max-w-md h-12 shadow-inner" src={getSourceUrl(currentItem.url)} />
                  ) : (
                    <a href={currentItem.url} target="_blank" className="px-8 py-3 bg-white text-primary font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform">
                      Listen External Audio
                    </a>
                  )}
                </div>
              )}

              {currentItem.type === "article" && currentItem.url && isDirectMedia(currentItem.url) && (
                <div className="w-full h-64 overflow-hidden">
                  <img src={getSourceUrl(currentItem.url)} alt="Header" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-8 md:p-12 overflow-y-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      {getTypeIcon(currentItem.type)}
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentItem.type}</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{currentItem.title}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 whitespace-nowrap">
                    {(currentItem as any).language || "English"}
                  </span>
                </div>
              </div>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                {currentItem.description}
              </p>

              {(currentItem as any).content && (
                <div className="prose prose-slate max-w-none text-slate-700 mb-10 text-base leading-loose whitespace-pre-wrap font-medium bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  {(currentItem as any).content}
                </div>
              )}

              {currentItem.type === "article" && currentItem.url && currentItem.url !== '#' && (
                <div className="flex gap-4">
                   <a href={currentItem.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95">
                    <BookOpen size={20} /> Read Full Document
                  </a>
                  <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-bold" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
