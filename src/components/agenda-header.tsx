"use client";

import Link from "next/link";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekRange, toDateString, addDays, getMondayOf } from "@/lib/date-helpers";

type AgendaHeaderProps = {
  date: Date;
  onDateChange: (date: Date) => void;
};

export function AgendaHeader({ date, onDateChange }: AgendaHeaderProps) {
  const monday = getMondayOf(date);
  const isToday = toDateString(date) === toDateString(new Date());

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-0 border-b border-zinc-100 bg-white">
      {/* Top row */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/notifications" className="relative">
          <Bell className="h-5 w-5 text-zinc-500" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </Link>
        <span className="text-sm font-semibold text-zinc-900">Saludates</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
          disabled={isToday}
          className="h-7 px-2 text-xs text-zinc-500"
        >
          Hoy
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button onClick={() => onDateChange(addDays(date, -7))} className="rounded-md p-1 hover:bg-zinc-100">
          <ChevronLeft className="h-4 w-4 text-zinc-500" />
        </button>
        <span className="text-sm font-medium capitalize text-zinc-800">
          {formatWeekRange(monday)}
        </span>
        <button onClick={() => onDateChange(addDays(date, 7))} className="rounded-md p-1 hover:bg-zinc-100">
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </button>
      </div>
    </header>
  );
}
