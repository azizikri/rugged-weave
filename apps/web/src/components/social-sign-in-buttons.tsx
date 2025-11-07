import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "./ui/button";

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
] as const;

type ProviderId = (typeof providers)[number]["id"];

export default function SocialSignInButtons() {
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(
    null
  );

  const handleProviderSignIn = async (provider: ProviderId) => {
    try {
      setPendingProvider(provider);
      await authClient.signIn.social({ provider });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          `Unable to continue with ${provider.toUpperCase()}`
        )
      );
      setPendingProvider(null);
    }
  };

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <Button
          className="w-full"
          disabled={pendingProvider !== null && pendingProvider !== provider.id}
          key={provider.id}
          onClick={() => handleProviderSignIn(provider.id)}
          type="button"
          variant="outline"
        >
          {pendingProvider === provider.id ? "Redirecting..." : provider.label}
        </Button>
      ))}
    </div>
  );
}
