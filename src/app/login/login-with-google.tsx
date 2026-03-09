'use client'

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginWithGoogle() {
     const { isLoading, login } = useAuth();
     const router = useRouter();
   
     async function handleCredential(credentialResponse: { credential?: string }) {
       if (!credentialResponse.credential) return;
       try {
         const loggedUser = await login(credentialResponse.credential);
         router.replace(loggedUser.role === "SUPERADMIN" ? "/superadmin" : "/agenda");
       } catch (err: unknown) {
         const status = (err as { response?: { status?: number } })?.response?.status;
         if (status === 401) {
           alert("Este correo no tiene acceso autorizado. Contacta al administrador.");
         } else {
           alert("No pudimos conectarnos. Verifica tu conexión e intenta de nuevo.");
         }
       }
     }

    if(isLoading) {
      return (
        <Button disabled variant="outline" className="w-full gap-3 h-11">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          Cargando...
        </Button>
      )
    }
    
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <GoogleLogin
          onSuccess={handleCredential}
              onError={() => alert("Error al iniciar sesión con Google.")}
              useOneTap
              text="signin_with"
              shape="rectangular"
              size="large"
              theme="outline"
            />
          </div>
        )
}