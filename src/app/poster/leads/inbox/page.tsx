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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { DisplayMessage } from "@/components/admin/displayMessage";

type Post = {
  id: string;
  phone: string;
  message: string;
  agentName: string;
  location: string;
  rent: string;
  screenshot: string;
  clientName: string;
  createdAt: string;
  claimedAt: string;
  poster: string;
  new: boolean;
};

type Pagination = {
  page: number;
  limit: number;
  totalPages: number;
  totalClaims: number;
};

const page = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Fetch paginated claims (no search)
  const fetchClaims = async (pageToLoad = 1, append = false) => {
    try {
      const res = await fetch(`/api/poster/leads?page=${pageToLoad}`);
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

  // Fetch search results (no pagination; backend limits to 10)
  const fetchSearchClaims = async (query: string) => {
    try {
      const res = await fetch(
        `/api/poster/leads/search?phone=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      // The search API returns an array directly
      setPosts(Array.isArray(data) ? data : []);
      setPagination(null); // disable "Load More" while searching
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch search claims", err);
    }
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClaims(nextPage, true);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClaims();
  }, []);

  // Debounced search
  useEffect(() => {
    const q = search.trim();
    const t = setTimeout(() => {
      if (q) {
        fetchSearchClaims(q);
      } else {
        // go back to paginated list
        setPage(1);
        fetchClaims(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
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
                className="cursor-pointer py-2 transition hover:shadow-md"
                onClick={() => {
                  setSelectedPost(post);
                }}
              >
                <CardContent className="space-y-1 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Phone: {post.phone}</p>
                    <p>{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="line-clamp-2 text-gray-800">{post.message}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Details</DialogTitle>
                <DialogDescription className="hidden">
                  View the full message and phone number of this post.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Phone Number
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg">{selectedPost?.phone}</p>
                    <Link
                      href={`/poster/leads/inbox/${post.id}`}
                      className="rounded-md bg-black px-3 py-1 text-white"
                    >
                      Update Lead
                    </Link>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Client Name
                  </p>
                  <p className="text-lg">{selectedPost?.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Agent Name
                  </p>
                  <p className="text-lg">{selectedPost?.agentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-lg">{selectedPost?.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rent</p>
                  <p className="text-lg">{selectedPost?.rent}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Screenshot
                  </p>
                  <p className="text-lg">{selectedPost?.screenshot}</p>
                </div>
                <DisplayMessage
                  type="Details"
                  message={selectedPost?.message}
                />
              </div>
            </DialogContent>
          </Dialog>
        ))}

        {/* Load More Button (hidden during search) */}
        {!search.trim() && pagination && page < pagination.totalPages && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="cursor-pointer"
            >
              Load More
            </Button>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <p className="text-muted-foreground text-center text-sm">
            {search.trim()
              ? "No results for that phone number."
              : "No Leads Added Yet."}
          </p>
        )}
      </div>
    </div>
  );
};

export default page;
