"use server";

import { redirect } from "next/navigation";
import { getServerClinicId, getServerPayload } from "@/lib/cookies";
import { cookies } from "next/headers";

export default async function Root() {
  const cookieStore = await cookies();
  const payload = getServerPayload(cookieStore);
  const clinicId = getServerClinicId(cookieStore);
  
  if(!payload) {
    redirect("/login");
  }

  if(payload.role === 'SUPERADMIN' && !clinicId){
    redirect("/superadmin");
  }
  
  redirect("/agenda");
}
