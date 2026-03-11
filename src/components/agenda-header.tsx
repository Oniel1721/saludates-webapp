"use client";

import Link from "next/link";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekRange, toDateString, addDays, getMondayOf } from "@/lib/date-helpers";

type AgendaHeaderProps = {
  date: Date;
  onDateChange: (date: Date) => void;
  unreadCount?: number;
};

export function AgendaHeader({ date, onDateChange, unreadCount = 0 }: AgendaHeaderProps) {
  const monday = getMondayOf(date);
  const isToday = toDateString(date) === toDateString(new Date());

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-0 border-b border-zinc-100 bg-white/95 backdrop-blur-sm">
      {/* Top row */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/notifications" className="relative p-1 -ml-1 rounded-lg hover:bg-zinc-100 transition-colors">
          <Bell className="h-5 w-5 text-zinc-500" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <span className="text-base font-semibold text-zinc-900">Saludates</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
          disabled={isToday}
          className="h-8 px-3 text-sm text-zinc-500 disabled:opacity-40"
        >
          Hoy
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          onClick={() => onDateChange(addDays(date, -7))}
          className="rounded-lg p-1.5 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-500" />
        </button>
        <span className="text-sm font-medium capitalize text-zinc-700">
          {formatWeekRange(monday)}
        </span>
        <button
          onClick={() => onDateChange(addDays(date, 7))}
          className="rounded-lg p-1.5 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </button>
      </div>
    </header>
  );
}
