"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateHeader, formatWeekRange, toDateString, addDays, getMondayOf } from "@/lib/date-helpers";

type AgendaHeaderProps = {
  date: Date;
  onDateChange: (date: Date) => void;
};

export function AgendaHeader({ date, onDateChange }: AgendaHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isWeekView = pathname === "/agenda/week";

  const monday = getMondayOf(date);

  function goToday() {
    onDateChange(new Date());
  }

  function goPrev() {
    onDateChange(addDays(date, isWeekView ? -7 : -1));
  }

  function goNext() {
    onDateChange(addDays(date, isWeekView ? 7 : 1));
  }

  function switchToDay() {
    router.push("/agenda");
  }

  function switchToWeek() {
    router.push("/agenda/week");
  }

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
          onClick={goToday}
          disabled={isToday && !isWeekView}
          className="h-7 px-2 text-xs text-zinc-500"
        >
          Hoy
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button onClick={goPrev} className="rounded-md p-1 hover:bg-zinc-100">
          <ChevronLeft className="h-4 w-4 text-zinc-500" />
        </button>
        <span className="text-sm font-medium capitalize text-zinc-800">
          {isWeekView ? formatWeekRange(monday) : formatDateHeader(date)}
        </span>
        <button onClick={goNext} className="rounded-md p-1 hover:bg-zinc-100">
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </button>
      </div>

      {/* View tabs */}
      <div className="flex border-t border-zinc-100">
        <button
          onClick={switchToDay}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            !isWeekView
              ? "border-b-2 border-zinc-900 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Día
        </button>
        <button
          onClick={switchToWeek}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            isWeekView
              ? "border-b-2 border-zinc-900 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Semana
        </button>
      </div>
    </header>
  );
}
