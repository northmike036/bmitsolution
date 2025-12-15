"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
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
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

type Team = {
  id: string;
  name: string;
  leader?: { name: string } | null;
  _count?: { members: number } | null;
  createdAt: string | Date;
};

type Poster = {
  id: string;
  name: string;
  userName: string;
};

export default function TeamAdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/teams")
      .then((r) => r.json())
      .then(setTeams);
    fetch("/api/admin/poster/list")
      .then((r) => r.json())
      .then(setPosters);
  }, []);

  const createTeam = async () => {
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName, leaderId }),
    });
    if (res.ok) {
      const updated = await fetch("/api/admin/teams").then((r) => r.json());
      setTeams(updated);
      setOpen(false);
      setTeamName("");
      setLeaderId("");
      fetch("/api/admin/poster/list")
        .then((r) => r.json())
        .then(setPosters);
      toast({
        title: "Success",
        description: "Team Added Successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: res.statusText,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Users /> Poster Teams
        </h1>
        <Button
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-2xl"
        >
          <Plus /> Create Team
        </Button>
      </div>

      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Teams List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>More Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length ? (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.leader?.name || "-"}</TableCell>
                    <TableCell>{team._count?.members || 0}</TableCell>
                    <TableCell>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/teams/${team.id}`}>
                        <Button className="cursor-pointer">Profile</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>No team found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <Separator className="my-2" />

          <div className="space-y-4">
            <div>
              <label className="text-sm">Team Name</label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm">Team Leader</label>
              <Select onValueChange={setLeaderId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a Leader" />
                </SelectTrigger>
                <SelectContent>
                  {posters.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.userName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={createTeam} className="cursor-pointer rounded-2xl">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
