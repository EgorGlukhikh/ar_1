"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface Props {
  userId: string;
  currentBalance: number;
}

export function AddBalanceButton({ userId, currentBalance }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(currentBalance);

  const preset = [500, 1000, 3000, 5000, 10000];

  async function handleAdd() {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n }),
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        title="Пополнить баланс"
      >
        <Wallet className="h-3.5 w-3.5" />
        {balance.toLocaleString("ru")} ₽
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-1.5">
      <div className="flex gap-1">
        {preset.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(String(p))}
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              amount === String(p)
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {p >= 1000 ? `${p / 1000}к` : p}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-16 rounded border border-emerald-200 px-1.5 py-0.5 text-xs"
        min="1"
      />
      <Button
        size="sm"
        className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? "…" : "+"}
      </Button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
}
