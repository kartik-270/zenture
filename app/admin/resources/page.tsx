"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  X,
  FileText,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

interface Resource {
  id: number;
  title: string;
  type: string;
  status: string;
  author: string;
  date: string;
  description?: string;
  url?: string;
  content?: string;
  language?: string;
}

export default function AdminResources() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminResourcesContent />
        </ProtectedRoute>
    );
}

function AdminResourcesContent() {
  const [username, setUsername] = useState("Admin");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResourceId, setCurrentResourceId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "article",
    url: "",
    content: "",
    language: "English"
  });

  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${apiConfig.baseUrl}/admin/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Failed to fetch resources", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${apiConfig.baseUrl}/admin/resource/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast({ title: `Resource ${newStatus}` });
        fetchResources();
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${apiConfig.baseUrl}/admin/resources/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: "Resource deleted" });
        fetchResources();
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to delete resource", variant: "destructive" });
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ title: "", description: "", type: "article", url: "", content: "", language: "English" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resource: Resource) => {
    setIsEditing(true);
    setCurrentResourceId(resource.id);
    setFormData({
      title: resource.title || "",
      description: resource.description || "",
      type: resource.type || "article",
      url: resource.url || "",
      content: resource.content || "",
      language: resource.language || "English"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      const token = getAuthToken();
      let mediaUrl = formData.url;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const uploadRes = await fetch(`${apiConfig.baseUrl}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: uploadFormData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          mediaUrl = uploadData.url;
        } else {
          toast({ title: "Failed to upload media", variant: "destructive" });
          setIsUploading(false);
          return;
        }
      }

      const url = isEditing
        ? `${apiConfig.baseUrl}/admin/resources/${currentResourceId}`
        : `${apiConfig.baseUrl}/resources`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, url: mediaUrl })
      });

      if (res.ok) {
        toast({ title: `Resource ${isEditing ? 'updated' : 'added'} successfully` });
        setIsModalOpen(false);
        setSelectedFile(null);
        fetchResources();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.msg, variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to save resource", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredResources = resources.filter(r =>
    (filter === "all" || r.status === filter) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Resource Management"
      icon={<BookOpen className="text-blue-500" />}
      username={username}
    >
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
          <div className="relative w-full md:w-auto md:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-auto p-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md font-bold"
        >
          <Plus size={20} /> Add Resource
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-lg">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${resource.type === 'video' ? 'bg-red-100 text-red-600' :
                    resource.type === 'audio' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                    {resource.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${resource.status === 'approved' ? 'bg-green-100 text-green-600' :
                    resource.status === 'rejected' ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                    {resource.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {resource.type === "article" && <FileText size={18} className="text-gray-500" />}
                  {resource.type === "video" && <Video size={18} className="text-gray-500" />}
                  {resource.type === "audio" && <LinkIcon size={18} className="text-gray-500" />}
                  <h3 className="text-xl font-bold text-gray-800 break-words">{resource.title}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  By {resource.author} • {resource.date}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {resource.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(resource.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Approve"
                    >
                      <CheckCircle size={22} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(resource.id, 'rejected')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Reject"
                    >
                      <XCircle size={22} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleOpenEdit(resource)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>

                <button
                  onClick={() => handleDelete(resource.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {filteredResources.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No resources found matching criteria.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Resource" : "Add New Resource"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  placeholder="e.g. Managing Exam Stress"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
                  rows={3}
                  placeholder="A brief summary of the resource..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                </select>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {formData.type === 'article' ? "Header Image (Optional)" : "Media File"}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept={formData.type === 'video' ? "video/*" : formData.type === 'audio' ? "audio/*" : "image/*"}
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 transition font-bold text-sm">
                        <ImageIcon size={18} />
                        {selectedFile ? 'Change File' : 'Upload File'}
                      </button>
                    </div>
                    {selectedFile && (
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">{selectedFile.name}</span>
                    )}
                  </div>
                </div>

                {formData.type !== 'article' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL (Alternative)</label>
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-shadow"
                      placeholder="https://..."
                      disabled={!!selectedFile}
                    />
                  </div>
                )}
              </div>

              {formData.type === 'article' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    rows={6}
                    placeholder="Write the full article content here..."
                  />
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isUploading || !formData.title || !formData.description}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                >
                  {isUploading ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                  ) : (
                    isEditing ? "Update Resource" : "Create Resource"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
