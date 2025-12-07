"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AddStrategyModal({ open, onOpenChange, onAdded }: any) {
  const [name, setName] = useState("");

  async function handleAdd() {
    const res = await fetch("/api/strategies", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      onAdded(name);
      onOpenChange(false);
      setName("");
    } else {
      alert("Strategy already exists");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Strategy</DialogTitle>
        </DialogHeader>

        <Label>Name</Label>
        <Input
          className="mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Breakout, Pullback..."
        />

        <Button className="w-full mt-4" onClick={handleAdd}>
          Save Strategy
        </Button>
      </DialogContent>
    </Dialog>
  );
}
