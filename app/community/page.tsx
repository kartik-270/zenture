"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Image as ImageIcon, 
  Loader2, 
  MessageCircle, 
  Heart, 
  Trash2,
  Send,
  X,
  Hash
} from "lucide-react"
import { apiConfig } from "@/lib/config"
import { getAuthToken } from "@/lib/auth"

interface Community {
  id: number
  name: string
  description: string
}

interface Author {
  id: number
  username: string
}

interface Post {
  id: number
  title: string
  content: string
  media_url?: string
  author: Author
  timestamp: string
  reply_count: number
  likes_count: number
}

interface Reply {
  id: number
  content: string
  author: Author
  timestamp: string
}

interface Message {
  id: number
  content: string
  sender_id: number
  timestamp: string
}

export default function CommunityPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <CommunityContent />
    </ProtectedRoute>
  );
}

function CommunityContent() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReplyContent, setNewReplyContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDMOpen, setIsDMOpen] = useState(false)
  const [dmUserId, setDmUserId] = useState<number | null>(null)
  const [dmUserName, setDmUserName] = useState("")
  const [dmMessages, setDmMessages] = useState<Message[]>([])
  const [newDmContent, setNewDmContent] = useState("")
  const [error, setError] = useState("")
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false)
  const [newCommunityName, setNewCommunityName] = useState("")
  const [newCommunityDesc, setNewCommunityDesc] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchCommunities()
    const token = getAuthToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserRole(payload.role)
        setCurrentUserId(Number(payload.sub))
      } catch {
        // ignore
      }
    }
  }, [])

  const fetchCommunities = async () => {
    try {
      const token = getAuthToken()
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(`${apiConfig.baseUrl}/communities`, { headers })
      if (res.ok) {
        const data = await res.json()
        setCommunities(data)
        if (data.length > 0) {
          setActiveCommunity(data[0])
          fetchPosts(data[0].id)
        }
      }
    } catch (err) {
      console.error("Failed to fetch communities", err)
    }
  }

  const fetchPosts = async (communityId: number) => {
    try {
      const res = await fetch(`${apiConfig.baseUrl}/communities/${communityId}/posts`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (err) {
      console.error("Failed to fetch posts", err)
    }
  }

  const handleCommunityChange = (community: Community) => {
    setActiveCommunity(community)
    setExpandedPostId(null)
    fetchPosts(community.id)
  }

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) {
      setError("Title and content are required.")
      return
    }
    const token = getAuthToken()
    if (!token) {
      setError("You must be logged in to post.")
      return
    }
    if (!activeCommunity) return

    try {
      let uploadedMediaUrl = null

      if (selectedFile) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", selectedFile)

        const uploadRes = await fetch(`${apiConfig.baseUrl}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          uploadedMediaUrl = uploadData.url
        } else {
          setError("Failed to upload image. Please try again.")
          setIsUploading(false)
          return
        }
      }

      setIsUploading(true)

      const res = await fetch(`${apiConfig.baseUrl}/communities/${activeCommunity.id}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          media_url: uploadedMediaUrl,
        }),
      })
      if (res.ok) {
        setIsPostModalOpen(false)
        setNewPostTitle("")
        setNewPostContent("")
        setSelectedFile(null)
        setError("")
        fetchPosts(activeCommunity.id)
      } else {
        const data = await res.json()
        setError(data.msg || "Failed to create post.")
      }
    } catch {
      setError("Network error occurred.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleExpandPost = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      return
    }
    setExpandedPostId(postId)
    try {
      const res = await fetch(`${apiConfig.baseUrl}/posts/${postId}/replies`)
      if (res.ok) {
        const data = await res.json()
        setReplies(data)
      }
    } catch (err) {
      console.error("Failed to fetch replies", err)
    }
  }

  const handleCreateCommunity = async () => {
    if (!newCommunityName) {
      setError("Community name is required.")
      return
    }
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(`${apiConfig.baseUrl}/communities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCommunityName, description: newCommunityDesc }),
      })
      if (res.ok) {
        setIsCommunityModalOpen(false)
        setNewCommunityName("")
        setNewCommunityDesc("")
        fetchCommunities()
      } else {
        const data = await res.json()
        setError(data.msg || "Failed to create community.")
      }
    } catch {
      setError("Network error.")
    }
  }

  const handleReplySubmit = async (postId: number) => {
    if (!newReplyContent) return
    const token = getAuthToken()
    if (!token) {
      alert("Please log in to reply.")
      return
    }
    try {
      const res = await fetch(`${apiConfig.baseUrl}/posts/${postId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newReplyContent }),
      })
      if (res.ok) {
        setNewReplyContent("")
        const replyRes = await fetch(`${apiConfig.baseUrl}/posts/${postId}/replies`)
        if (replyRes.ok) {
          const data = await replyRes.json()
          setReplies(data)
        }
      }
    } catch (err) {
      console.error("Failed to submit reply", err)
    }
  }

  const handleLikePost = async (postId: number) => {
    const token = getAuthToken()
    if (!token) {
      alert("Please log in to like posts.")
      return
    }

    const originalPosts = [...posts]
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
    )

    try {
      const res = await fetch(`${apiConfig.baseUrl}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes_count: data.likes_count } : p)))
      } else {
        setPosts(originalPosts)
      }
    } catch (err) {
      console.error("Like failed", err)
      setPosts(originalPosts)
    }
  }

  const handleDeletePost = async (postId: number) => {
    const token = getAuthToken()
    if (!token) return
    if (!window.confirm("Are you sure you want to delete this post?")) return
    if (!activeCommunity) return

    try {
      const res = await fetch(`${apiConfig.baseUrl}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchPosts(activeCommunity.id)
      } else {
        alert("You do not have permission to delete this post.")
      }
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  const handleOpenDM = (userId: number, username: string) => {
    setDmUserId(userId)
    setDmUserName(username)
    setIsDMOpen(true)
    fetchDMs(userId)
  }

  const fetchDMs = async (userId: number) => {
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(`${apiConfig.baseUrl}/messages/direct/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setDmMessages(data)
      }
    } catch (err) {
      console.error("Failed to fetch DMs", err)
    }
  }

  const handleSendDM = async () => {
    if (!newDmContent || !dmUserId) return
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(`${apiConfig.baseUrl}/messages/direct/${dmUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newDmContent }),
      })
      if (res.ok) {
        setNewDmContent("")
        fetchDMs(dmUserId)
      }
    } catch (err) {
      console.error("Failed to send DM", err)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto flex">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen bg-card border-r border-border p-4 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-card-foreground">Communities</h2>
              {(userRole === "admin" || userRole === "moderator") && (
                <button
                  onClick={() => setIsCommunityModalOpen(true)}
                  className="text-sm bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded"
                >
                  + New
                </button>
              )}
            </div>
            <nav className="space-y-1">
              {communities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCommunityChange(c)}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    activeCommunity?.id === c.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  {c.name}
                </button>
              ))}
              {communities.length === 0 && (
                <p className="text-muted-foreground text-sm px-4">No communities found.</p>
              )}
            </nav>

            <div className="mt-8 pt-4 border-t border-border">
              <h3 className="font-semibold text-card-foreground mb-2">Direct Messages</h3>
              <p className="text-muted-foreground text-sm">
                Click a user&apos;s name on a post to message them.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {activeCommunity ? `# ${activeCommunity.name}` : "Community"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {activeCommunity
                    ? activeCommunity.description
                    : "Join our forum for stigma-free support"}
                </p>
              </div>
              {activeCommunity && (
                <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Post in #{activeCommunity?.name}</DialogTitle>
                    </DialogHeader>
                    {error && (
                      <p className="text-destructive text-sm bg-destructive/10 p-2 rounded">{error}</p>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Title</label>
                        <Input
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="e.g., Struggling with Finals Stress"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Content</label>
                        <Textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Write your message here..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                          <ImageIcon className="w-4 h-4" />
                          <span>Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                          />
                        </label>
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
                        )}
                      </div>
                      <Button onClick={handleCreatePost} className="w-full" disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          "Post"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-card rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-card-foreground">{post.title}</h3>
                    {(userRole === "admin" ||
                      userRole === "moderator" ||
                      currentUserId === post.author.id) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  {post.media_url && (
                    <div className="mb-4">
                      {post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video controls className="rounded-lg max-h-80 w-full object-cover">
                          <source src={post.media_url} />
                        </video>
                      ) : (
                        <img
                          src={post.media_url}
                          alt="Post media"
                          className="rounded-lg max-h-80 w-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        onClick={() => handleOpenDM(post.author.id, post.author.username)}
                        className="text-primary hover:underline"
                      >
                        {post.author.username}
                      </button>
                      <span>-</span>
                      <span>{new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleExpandPost(post.id)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {post.reply_count || 0}
                      </button>
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        {post.likes_count}
                      </button>
                    </div>
                  </div>

                  {/* Replies */}
                  {expandedPostId === post.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="font-medium text-card-foreground mb-3">Replies</h4>
                      {replies.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No replies yet. Be the first!</p>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {replies.map((reply) => (
                            <div key={reply.id} className="bg-muted rounded-lg p-3">
                              <p className="text-foreground text-sm">{reply.content}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <button
                                  onClick={() => handleOpenDM(reply.author.id, reply.author.username)}
                                  className="text-primary hover:underline"
                                >
                                  {reply.author.username}
                                </button>
                                <span>{new Date(reply.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newReplyContent}
                          onChange={(e) => setNewReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleReplySubmit(post.id)}>
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {posts.length === 0 && activeCommunity && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">Start the conversation by creating a new post!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Community Modal */}
      <Dialog open={isCommunityModalOpen} onOpenChange={setIsCommunityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
          </DialogHeader>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                placeholder="Community name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={newCommunityDesc}
                onChange={(e) => setNewCommunityDesc(e.target.value)}
                placeholder="What is this community about?"
              />
            </div>
            <Button onClick={handleCreateCommunity} className="w-full">
              Create Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DM Modal */}
      {isDMOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-card-foreground">Chat with {dmUserName}</h3>
              <button onClick={() => setIsDMOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {dmMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Input
                value={newDmContent}
                onChange={(e) => setNewDmContent(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendDM()}
              />
              <Button onClick={handleSendDM}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
