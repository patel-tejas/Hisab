"use client";

import { useEffect, useState } from "react";
import { Info, Brain, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { emotionalStates, outcomes, mistakeOptions } from "@/lib/mock-data";
import { AddStrategyModal } from "./add-strategy-modal";

// ---------- DEFAULT SYMBOLS -----------
const defaultSymbols = ["NIFTY 50", "BANKNIFTY", "SENSEX", "BTC", "ETH", "GOLD", "SILVER"];

const defaultQuantities: Record<string, number> = {
  "NIFTY 50": 75,
  BANKNIFTY: 15,
  SENSEX: 20,
  BTC: 1,
  ETH: 10,
  GOLD: 1,
  SILVER: 30,
};

export function AddTradeModal({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState<"general" | "psychology">("general");

  // ---------- FORM STATES (MAIN FIX) ----------
  const [symbol, setSymbol] = useState("");
  const [date, setDate] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");

  const [direction, setDirection] = useState("long");
  const [notes, setNotes] = useState("");

  // Psychology tab states
  const [entryConfidence, setEntryConfidence] = useState([8]);
  const [satisfaction, setSatisfaction] = useState([9]);
  const [selectedEmotional, setSelectedEmotional] = useState("Calm");
  const [selectedOutcome, setSelectedOutcome] = useState("Full Success");
  const [selectedMistakes, setSelectedMistakes] = useState(["No Mistakes"]);

  // Strategy
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);

  // ---------- FETCH STRATEGIES ----------
  useEffect(() => {
    if (!open) return;
    fetch("/api/strategies")
      .then((res) => res.json())
      .then((list) => setStrategies(list));
  }, [open]);

  // ---------- RESET ----------
  const handleReset = () => {
    setSymbol("");
    setDate("");
    setEntryPrice("");
    setExitPrice("");
    setQuantity("");
    setStopLoss("");
    setTarget("");
    setNotes("");
    setDirection("long");
    setSelectedStrategy("");
    setEntryConfidence([8]);
    setSatisfaction([9]);
    setSelectedMistakes(["No Mistakes"]);
  };

  // ---------- MISTAKE TOGGLE ----------
  const toggleMistake = (m) => {
    if (m === "No Mistakes") return setSelectedMistakes(["No Mistakes"]);

    setSelectedMistakes((prev) => {
      const f = prev.filter((x) => x !== "No Mistakes");
      return f.includes(m) ? f.filter((x) => x !== m) : [...f, m];
    });
  };

  // ---------- SAVE TRADE ----------
  async function handleSaveTrade() {
    const pnl = (Number(exitPrice) - Number(entryPrice)) * Number(quantity);
    const pnlPercent = ((Number(exitPrice) - Number(entryPrice)) / Number(entryPrice)) * 100;

    const trade = {
      symbol,
      date,
      type: direction,
      quantity: Number(quantity),
      entryPrice: Number(entryPrice),
      exitPrice: Number(exitPrice),
      totalAmount: Number(entryPrice) * Number(quantity),
      pnl,
      pnlPercent,
      stopLoss: Number(stopLoss),
      target: Number(target),
      strategy: selectedStrategy,
      outcome: selectedOutcome,
      entryConfidence: entryConfidence[0],
      satisfaction: satisfaction[0],
      emotionalState: selectedEmotional,
      mistakes: selectedMistakes,
      notes,
      images: [],
    };

    const res = await fetch("/api/trades", {
      method: "POST",
      body: JSON.stringify(trade),
    });

    if (res.ok) onOpenChange(false);
    else alert("Trade could not be saved.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
        </DialogHeader>

        {/* ---------- TABS ---------- */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "px-4 py-3 border-b-2",
              activeTab === "general" ? "border-primary text-primary" : "text-muted-foreground"
            )}
          >
            <Info className="h-4 w-4 inline-block mr-2" />
            General
          </button>

          <button
            onClick={() => setActiveTab("psychology")}
            className={cn(
              "px-4 py-3 border-b-2",
              activeTab === "psychology" ? "border-primary text-primary" : "text-muted-foreground"
            )}
          >
            <Brain className="h-4 w-4 inline-block mr-2" />
            Psychology
          </button>
        </div>

        {/* =======================================================
                          GENERAL TAB
        ======================================================= */}
        {activeTab === "general" && (
          <div className="space-y-5 py-4">

            {/* SYMBOL SELECT */}
            <div>
              <Label>Symbol *</Label>
              <Select
                onValueChange={(v) => {
                  setSymbol(v);
                  if (defaultQuantities[v]) setQuantity(String(defaultQuantities[v]));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {defaultSymbols.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                className="mt-2"
                placeholder="Or type custom"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            {/* DATE – ENTRY – EXIT */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input value={date} type="date" onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                <Label>Entry Price *</Label>
                <Input value={entryPrice} type="number" onChange={(e) => setEntryPrice(e.target.value)} />
              </div>

              <div>
                <Label>Exit Price *</Label>
                <Input value={exitPrice} type="number" onChange={(e) => setExitPrice(e.target.value)} />
              </div>
            </div>

            {/* QUANTITY */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input value={quantity} type="number" onChange={(e) => setQuantity(e.target.value)} />
              </div>
            </div>

            {/* Direction */}
            <div>
              <Label>Direction *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={direction === "long" ? "default" : "outline"}
                  onClick={() => setDirection("long")}
                >
                  ↑ Long
                </Button>

                <Button
                  type="button"
                  variant={direction === "short" ? "default" : "outline"}
                  onClick={() => setDirection("short")}
                >
                  ↓ Short
                </Button>
              </div>
            </div>

            {/* SL + Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stop Loss</Label>
                <Input value={stopLoss} type="number" onChange={(e) => setStopLoss(e.target.value)} />
              </div>

              <div>
                <Label>Target</Label>
                <Input value={target} type="number" onChange={(e) => setTarget(e.target.value)} />
              </div>
            </div>

            {/* Strategy */}
            <div>
              <Label>Strategy *</Label>
              <Select
                value={selectedStrategy}
                onValueChange={(v) => {
                  if (v === "__add__") return setStrategyModalOpen(true);
                  setSelectedStrategy(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose strategy" />
                </SelectTrigger>

                <SelectContent>
                  {strategies.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}

                  <div className="border-t my-2" />

                  <SelectItem value="__add__">➕ Add New Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Outcome */}
            <div>
              <Label>Outcome *</Label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>Trade Analysis *</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {/* =======================================================
                          PSYCHOLOGY TAB
        ======================================================= */}
        {activeTab === "psychology" && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">

              {/* LEFT */}
              <div className="space-y-6">
                <div>
                  <Label>Entry Confidence</Label>
                  <Slider value={entryConfidence} onValueChange={setEntryConfidence} max={10} min={1} />
                  <p className="text-center">{entryConfidence[0]}</p>
                </div>

                <div>
                  <Label>Satisfaction</Label>
                  <Slider value={satisfaction} onValueChange={setSatisfaction} max={10} min={1} />
                  <p className="text-center">{satisfaction[0]}</p>
                </div>

                <div>
                  <Label>Emotional State *</Label>
                  <Select value={selectedEmotional} onValueChange={setSelectedEmotional}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotionalStates.map((em) => (
                        <SelectItem key={em} value={em}>
                          {em}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-6">
                <div>
                  <Label>Mistakes *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {mistakeOptions.map((m) => (
                      <label key={m} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedMistakes.includes(m)}
                          onCheckedChange={() => toggleMistake(m)}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Lessons Learned *</Label>
                  <Textarea />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- FOOTER ---------- */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>

          <Button onClick={handleSaveTrade}>
            <Save className="mr-2 h-4 w-4" /> Save Trade
          </Button>
        </div>

        {/* STRATEGY ADD MODAL */}
        <AddStrategyModal
          open={strategyModalOpen}
          onOpenChange={setStrategyModalOpen}
          onAdded={(name) => {
            setStrategies((prev) => [...prev, name]);
            setSelectedStrategy(name);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
