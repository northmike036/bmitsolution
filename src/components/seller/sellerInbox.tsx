"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // 🔥 NEW
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // 🔥 NEW
import { useToast } from "@/components/ui/use-toast";
import { CopyButton } from "../copyBtn";

type Post = {
  id: string;
  phone: string;
  message: string;
  clientName: string;
  claimedAt: string;
  createdAt: string;
  poster: string;
  new: boolean;
};

type Pagination = {
  page: number;
  limit: number;
  totalPages: number;
  totalClaims: number;
};

const SellerInboxV2 = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // 🔥 NEW
  const [deleteReason, setDeleteReason] = useState(""); // 🔥 NEW
  const [timeInterval, setTimeInterval] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // --- API handlers ---
  const fetchClaims = async (pageToLoad = 1, append = false) => {
    try {
      const res = await fetch(`/api/seller/claims?page=${pageToLoad}`);
      const data = await res.json();

      const nextPosts = Array.isArray(data) ? data : data.claims || [];
      if (append) {
        setPosts((prev) => [...prev, ...nextPosts]);
      } else {
        setPosts(nextPosts);
      }

      setPagination((Array.isArray(data) ? null : data.pagination) || null);
    } catch (err) {
      console.error("Failed to fetch claims", err);
    }
  };

  const fetchSearchClaims = async (query: string) => {
    try {
      const res = await fetch(
        `/api/seller/claims/search?phone=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
      setPagination(null);
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch search claims", err);
    }
  };

  const fetchLimits = async () => {
    try {
      const res = await fetch("/api/seller/limits");
      const data = await res.json();
      setTimeInterval(data.cooldownSecs);
    } catch (err) {
      console.error("Failed to fetch limits", err);
    }
  };

  const handleRequestPost = async () => {
    setLoading(true);
    const res = await fetch("/api/seller/request", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast({
        title: "Request failed",
        description: data.error || "Something went wrong",
        variant: "destructive",
      });
    } else {
      toast({ title: "Lead assigned!" });
      if (search.trim()) {
        fetchSearchClaims(search.trim());
      } else {
        setPage(1);
        fetchClaims(1);
      }
      setCooldown(timeInterval);
    }
  };

  const handleNew = async (id: string) => {
    await fetch("/api/update-lead/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      const res = await fetch(`/api/post/${selectedPost.id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: "Delete failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Post deleted successfully" });
      setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id)); // remove from UI
      setDeleteDialogOpen(false);
      setDeleteReason("");
    } catch (err) {
      console.error("Failed to delete post", err);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClaims(nextPage, true);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchClaims();
    fetchLimits();
  }, []);

  useEffect(() => {
    const q = search.trim();
    const t = setTimeout(() => {
      if (q) {
        fetchSearchClaims(q);
      } else {
        setPage(1);
        fetchClaims(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const saved = localStorage.getItem("timer");
    if (saved) {
      const savedTime = parseInt(saved);
      const remaining = Math.floor((savedTime - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1 && interval) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
      localStorage.setItem("timer", (Date.now() + cooldown * 1000).toString());
    } else {
      localStorage.removeItem("timer");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldown]);

  // --- UI ---
  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      {/* Request Button */}
      {timeInterval ? (
        <Button
          onClick={handleRequestPost}
          disabled={loading || cooldown > 0}
          className="cursor-pointer"
        >
          {loading
            ? "Requesting..."
            : cooldown > 0
            ? `Cooldown: ${cooldown}s`
            : "Request Lead"}
        </Button>
      ) : (
        <div>Loading...</div>
      )}

      {/* Search Input */}
      <Input
        placeholder="Search by phone number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-full"
      />

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Dialog key={post.id}>
            <DialogTrigger asChild>
              <Card
                onClick={() => {
                  setSelectedPost(post);
                  if (post.new) handleNew(post.id);
                }}
                className="cursor-pointer hover:shadow-md transition py-2"
              >
                <CardContent className="px-4 py-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Phone: {post.phone}</p>
                    <div className="flex gap-2 items-center">
                      <p>{new Date(post.createdAt).toLocaleString()}</p>
                      {post.new && (
                        <p className="bg-emerald-600 rounded-full px-2 text-sm text-white">
                          New
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 line-clamp-2">{post.message}</p>
                </CardContent>
              </Card>
            </DialogTrigger>

            {/* Post Detail Modal */}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Phone Number
                  </p>
                  <div className="flex justify-between items-center gap-3">
                    <p className="text-lg">{selectedPost?.phone}</p>
                    {selectedPost?.phone && (
                      <CopyButton
                        text={selectedPost.phone}
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg">{selectedPost?.clientName}</p>
                </div>
                <Collapsible>
                  <CollapsibleTrigger
                    className="text-sm font-medium text-gray-500 w-full flex justify-between items-center"
                    onClick={() => setOpen(!open)}
                  >
                    <p>Message</p>
                    <p>
                      {open ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="whitespace-pre-wrap break-words break-all">
                    {selectedPost?.message}
                  </CollapsibleContent>
                </Collapsible>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Generated By
                  </p>
                  <p className="whitespace-pre-wrap">{selectedPost?.poster}</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="cursor-pointer">Delete Post</DialogTitle>
              <DialogDescription>
                Please provide a reason for deleting this post.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter reason..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!deleteReason.trim()}
                onClick={handleDeletePost}
                className="cursor-pointer"
              >
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Load More Button */}
        {!search.trim() && pagination && page < pagination.totalPages && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={handleLoadMore}>
              Load More
            </Button>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {search.trim()
              ? "No results for that phone number."
              : "No claimed posts yet."}
          </p>
        )}
      </div>
    </div>
  );
};

export default SellerInboxV2;
