'use server'
import Link from "next/link";
import { cookies } from "next/headers";
import { Shield } from "lucide-react";
import { getServerPayload } from "@/lib/cookies";
import { redirect } from "next/navigation";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const payload = getServerPayload(cookieStore);
  
  if(payload?.role !== "SUPERADMIN") {
    return redirect("/");
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-900 px-4 py-3">
        <Shield className="h-4 w-4 text-zinc-400" />
        <Link href="/superadmin" className="text-xs font-semibold tracking-widest text-zinc-400 uppercase hover:text-zinc-200">
          Saludates Admin
        </Link>
      </div>
      {children}
    </div>
  );
}
