import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import OtpSignInForm from "@/components/otp-sign-in-form";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

type ViewMode = "otp" | "password";
type PasswordMode = "sign-in" | "sign-up";

function RouteComponent() {
  const [view, setView] = useState<ViewMode>("otp");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("sign-in");

  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <div className="mx-auto flex max-w-md gap-2 rounded-lg border bg-card/70 p-1 shadow-sm backdrop-blur">
          <Button
            className="flex-1"
            onClick={() => setView("otp")}
            type="button"
            variant={view === "otp" ? "default" : "ghost"}
          >
            Email code
          </Button>
          <Button
            className="flex-1"
            onClick={() => setView("password")}
            type="button"
            variant={view === "password" ? "default" : "ghost"}
          >
            Password
          </Button>
        </div>

        {view === "otp" ? (
          <OtpSignInForm onSwitchToPassword={() => setView("password")} />
        ) : (
          <div className="space-y-4">
            {passwordMode === "sign-in" ? (
              <SignInForm onSwitchToSignUp={() => setPasswordMode("sign-up")} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setPasswordMode("sign-in")} />
            )}

            <div className="text-center text-sm">
              <Button
                className="text-indigo-600 hover:text-indigo-800"
                onClick={() => setView("otp")}
                type="button"
                variant="link"
              >
                Prefer a one-time code? Use passwordless login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
