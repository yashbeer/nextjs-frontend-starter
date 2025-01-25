"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AddMemberDialog({ onAddMember, activeTeam }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      email: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${activeTeam.id}/invitation`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formData.email }),
          }
        );        
        const data = await response.json();
        
        if (!response.ok) {
          toast.error("Failed to send invitation", {
            description: data.message || "An unexpected error occurred."
          });
          return;
        }

        const newMember = {
          id: data.id,
          email: data.email,
          invitedAt: data.invitedAt
        };

        toast.success("Invitation sent", {
          description: "You've successfully invited the member."
        });
        onAddMember(newMember);
        setFormData({ email: ""});
        setOpen(false);
      } catch (error) {
        console.error("Error adding member:", error);
        toast.error("Failed to send invitation", {
          description: "An unexpected error occurred while sending the invitation."
        });
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
}