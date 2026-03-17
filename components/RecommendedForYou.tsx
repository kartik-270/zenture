"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Video, BookOpen, Loader2 } from "lucide-react";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";

interface Resource {
  id: number;
  type: "article" | "video" | "exercise";
  title: string;
  description: string;
  link: string;
}

const getIcon = (type: Resource['type']) => {
  switch (type) {
    case 'article':
      return <BookOpen className="text-primary" size={24} />;
    case 'video':
      return <Video className="text-primary" size={24} />;
    case 'exercise':
      return <Lightbulb className="text-primary" size={24} />;
    default:
      return <Lightbulb className="text-primary" size={24} />;
  }
};

export function RecommendedForYou() {
  const [recommendations, setRecommendations] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const token = getAuthToken();
        // Placeholder Data Simulation as per reference
        await new Promise(resolve => setTimeout(resolve, 800));
        const placeholderData: Resource[] = [
          { id: 1, type: "exercise", title: "5-Minute Mindfulness Exercise", description: "Clear your mind and reduce stress with this guided session.", link: "/resources" },
          { id: 2, type: "article", title: "Managing Exam Anxiety", description: "Learn effective strategies to stay calm and focused during exams.", link: "/resources" },
          { id: 3, type: "video", title: "The Importance of a Sleep Routine", description: "Discover how a consistent sleep schedule can boost your mental health.", link: "/resources" },
        ];

        setRecommendations(placeholderData);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <section className="w-full">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        Recommended For You <span className="text-lg">✨</span>
      </h2>
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-slate-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item) => (
              <a
                key={item.id}
                href={item.link}
                className="block bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center transition-colors group-hover:bg-primary/10">
                    {getIcon(item.type)}
                  </div>
                  <h3 className="text-md font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
