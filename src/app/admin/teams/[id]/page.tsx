"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Team } from "../../../../../types/teamTypes";
import { useToast } from "@/components/ui/use-toast";
import TeamPerformance from "@/components/admin/TeamPerformance";

type Poster = {
  id: string;
  name: string;
  userName: string;
};

export default function TeamDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const { toast } = useToast();

  const normalizedId = Array.isArray(rawId) ? rawId[0] : (rawId ?? null);
  const [teamId, setTeamId] = useState<string | null>(normalizedId);
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newPosterId, setNewPosterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/admin/teams/${teamId}`),
        fetch(`/api/admin/poster/list`),
      ]);

      if (!tRes.ok) throw new Error(`Failed to load team: ${tRes.status}`);
      if (!pRes.ok) throw new Error(`Failed to load posters: ${pRes.status}`);
      const t = await tRes.json();
      const p = await pRes.json();
      setTeam(t);
      setPosters(Array.isArray(p) ? p : []);
    } catch (err) {
      setTeam(null);
      setPosters([]);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamId) return;
    loadData();
  }, [teamId]);

  const addMember = async () => {
    if (!newPosterId) return;
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId: newPosterId }),
      });
      if (!res.ok) throw new Error("Failed to add member");
      setOpenAdd(false);
      setNewPosterId("");
      await loadData();
    } catch (err) {
      alert(
        "Failed to add member: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const removeMember = async (posterId: string) => {
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId }),
      });
      if (!res.ok) throw new Error("Failed to remove member");
      await loadData();
    } catch (err) {
      alert(
        "Failed to remove member: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const deleteTeam = async () => {
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete team");
      try {
        router.push("/admin/teams");
      } catch {} // ignore preview navigation errors
    } catch (err) {
      alert(
        "Failed to delete team: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  if (!teamId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">Team Detail (Preview)</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          No <code>params.id</code> was provided. Enter a team id to preview the
          page.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter team id"
            value={teamId ?? ""}
            onChange={(e) => setTeamId(e.target.value || null)}
            className="flex-1 rounded border px-3 py-2"
          />
          <Button onClick={loadData} disabled={!teamId}>
            Load
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!team) return <div className="p-6">Team not found</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Team: {team.name}</h1>
      <div className="py-5">
        <TeamPerformance teamId={teamId} />
      </div>

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button onClick={() => setOpenAdd(true)} className="cursor-pointer">
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members?.length ? (
                team.members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.userName}</TableCell>
                    <TableCell>
                      {team.leaderId !== m.id && (
                        // <Button
                        //   className="cursor-pointer"
                        //   variant="destructive"
                        //   onClick={}
                        // >
                        //   Remove
                        // </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="cursor-pointer"
                            >
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <p>
                              This action will permanently Remove this Team
                              Member from This Team
                            </p>
                            <DialogFooter className="pt-4">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeMember(m.id)}
                              >
                                Confirm
                              </AlertDialogAction>
                            </DialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No members found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="cursor-pointer">
            Delete Team
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <p>This action will permanently delete Team and Team activity</p>
          <DialogFooter className="pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTeam}>Confirm</AlertDialogAction>
          </DialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <Separator className="my-2" />
          <Select onValueChange={setNewPosterId} value={newPosterId}>
            <SelectTrigger>
              <SelectValue placeholder="Select poster" />
            </SelectTrigger>
            <SelectContent>
              {posters.length ? (
                posters.map((p) => (
                  <SelectItem value={p.id} key={p.id}>
                    {p.name} ({p.userName})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No available posters
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              onClick={addMember}
              disabled={!newPosterId}
              className="cursor-pointer"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
