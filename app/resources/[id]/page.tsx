'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Video, 
  Headphones, 
  Heart, 
  ChevronLeft, 
  Calendar, 
  User as UserIcon,
  Share2,
  Search
} from 'lucide-react';
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
  content?: string;
  date?: string;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${apiConfig.baseUrl}/resources/${id}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Resource not found');
      }
      
      const data = await response.json();
      setResource(data);
    } catch (err: any) {
      console.error('Error fetching resource:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getSourceUrl = (url: string | undefined) => {
    if (!url || url === '#') return "";
    if (url.startsWith('http')) return url;
    return `${apiConfig.baseUrl}${url}`;
  };

  const getYouTubeEmbedUrl = (url: string | undefined) => {
    if (!url || !url.includes("youtube.com/watch?v=")) return undefined;
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="text-primary" size={24} />;
      case 'video': return <Video className="text-primary" size={24} />;
      case 'audio': return <Headphones className="text-primary" size={24} />;
      case 'exercise': return <Heart className="text-primary" size={24} />;
      default: return <Heart className="text-primary" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading resource...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500">
              <Search size={48} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Resource Not Found</h1>
            <p className="text-slate-500 mb-8 font-bold leading-relaxed px-4 text-balanced">
               We couldn't locate ID <span className="text-primary">#{id}</span> in our hub library. It might have been relocated or removed.
            </p>
            <div className="flex flex-col gap-3">
                <Button 
                    onClick={() => router.push('/resources')}
                    className="w-full rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg"
                >
                    Return to Hub
                </Button>
                <Button 
                    variant="ghost"
                    onClick={() => fetchResource()}
                    className="w-full rounded-2xl h-14 text-slate-400 hover:text-primary font-bold transition-all"
                >
                    Try Again
                </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(resource.url);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-slate-50 py-12 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => router.push('/resources')}
              className="group flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-8"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              BACK TO HUB
            </button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                    {getTypeIcon(resource.type)}
                  </div>
                  <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{resource.type}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                  {resource.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} />
                    <span>{resource.author || 'Zenture Team'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{resource.date || 'Campus Wellness'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-white hover:border-primary/50 transition-all font-bold group">
                  <Share2 size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            <div className="space-y-12">
              {/* Media Player / Display */}
              {resource.type === 'video' && (
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video border-8 border-slate-100">
                  {embedUrl ? (
                    <iframe 
                      className="w-full h-full"
                      src={embedUrl}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : resource.url ? (
                    <video controls className="w-full h-full" src={getSourceUrl(resource.url)} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 font-bold">Video Link Not Available</div>
                  )}
                </div>
              )}

              {resource.type === 'audio' && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center border-4 border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 text-primary animate-pulse">
                    <Headphones size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Guided Audio Session</h3>
                  {resource.url ? (
                    <audio controls className="w-full max-w-md h-12 shadow-sm" src={getSourceUrl(resource.url)} />
                  ) : (
                    <p className="text-slate-500 font-medium">Audio URL not available</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="bg-slate-50 rounded-[2rem] p-8 md:p-10 border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Summary</h3>
                <p className="text-xl text-slate-700 leading-relaxed font-medium">
                  {resource.description}
                </p>
              </div>

              {/* Detailed Content */}
              {resource.content && (
                <div className="prose prose-slate prose-lg max-w-none">
                  <div className="bg-white p-2 rounded-2xl">
                    <div className="text-slate-700 leading-[1.8] whitespace-pre-wrap font-medium text-lg">
                      {resource.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback for Articles without specific content embedded */}
              {resource.type === 'article' && !resource.content && resource.url && (
                <div className="text-center py-12 border-t border-slate-100">
                  <p className="text-slate-500 mb-6 font-medium">This article is hosted on an external platform.</p>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-primary/25"
                  >
                    Read on External Site
                    <Share2 size={18} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
