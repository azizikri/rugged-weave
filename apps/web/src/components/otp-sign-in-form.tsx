import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils";
import Loader from "./loader";
import SocialSignInButtons from "./social-sign-in-buttons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type OtpSignInFormProps = {
  onSwitchToPassword: () => void;
};

const otpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "Enter the 6-digit code").or(z.literal("")),
});

export default function OtpSignInForm({
  onSwitchToPassword,
}: OtpSignInFormProps) {
  const navigate = useNavigate({ from: "/" });
  const { isPending } = authClient.useSession();
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailValue, setEmailValue] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      otp: "",
    },
    onSubmit: async ({ value }) => {
      const email = value.email.trim().toLowerCase();

      if (!otpSent) {
        await sendOtp(email);
        return;
      }

      if (!value.otp) {
        toast.error("Enter the 6-digit code we emailed you");
        return;
      }

      await authClient.signIn.emailOtp(
        {
          email,
          otp: value.otp,
        },
        {
          onSuccess: () => {
            toast.success("Signed in successfully");
            navigate({ to: "/dashboard" });
          },
          onError: (error) => {
            toast.error(getErrorMessage(error, "Invalid code"));
          },
        }
      );
    },
    validators: {
      onSubmit: otpSchema,
    },
  });

  useEffect(() => {
    if (!otpSent || cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, cooldown]);

  const sendOtp = async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Enter your email address first");
      return;
    }

    try {
      setEmailValue(email);
      await authClient.emailOtp.sendVerificationOtp(
        {
          email,
          type: "sign-in",
        },
        {
          onSuccess: () => {
            setOtpSent(true);
            setCooldown(60);
            toast.success("We sent a code to your inbox");
          },
          onError: (error) => {
            toast.error(getErrorMessage(error, "Unable to send a code"));
          },
        }
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send a code"));
    }
  };

  if (isPending) {
    return <Loader />;
  }

  const handleResend = async () => {
    await sendOtp(emailValue);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-3xl">
          Sign in or join with an email code
        </h1>
        <p className="text-muted-foreground text-sm">
          We&apos;ll send a one-time passcode. Accounts are created
          automatically after verification. You can add a password later if you
          prefer.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="space-y-2">
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  autoComplete="email"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    if (otpSent) {
                      setOtpSent(false);
                      setCooldown(0);
                      form.setFieldValue("otp", "");
                    }
                    setEmailValue(event.target.value);
                    field.handleChange(event.target.value);
                  }}
                  type="email"
                  value={field.state.value}
                />
                {(field.state.meta.errors as Array<{ message?: string }>).map(
                  (error, index) =>
                    error?.message ? (
                      <p
                        className="text-destructive text-sm"
                        key={`${field.name}-error-${index}`}
                      >
                        {error.message}
                      </p>
                    ) : null
                )}
              </div>
            )}
          </form.Field>
        </div>

        {otpSent ? (
          <div className="space-y-2">
            <form.Field name="otp">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>One-time code</Label>
                  <Input
                    autoComplete="one-time-code"
                    id={field.name}
                    inputMode="numeric"
                    maxLength={6}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    value={field.state.value}
                  />
                  {(field.state.meta.errors as Array<{ message?: string }>).map(
                    (error, index) =>
                      error?.message ? (
                        <p
                          className="text-destructive text-sm"
                          key={`${field.name}-error-${index}`}
                        >
                          {error.message}
                        </p>
                      ) : null
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Didn&apos;t get a code?
              </span>
              <Button
                disabled={cooldown > 0}
                onClick={handleResend}
                type="button"
                variant="ghost"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </Button>
            </div>
          </div>
        ) : null}

        <form.Subscribe>
          {(state) => {
            let submitLabel = "Send login code";

            if (otpSent) {
              submitLabel = "Verify and continue";
            }

            if (state.isSubmitting) {
              submitLabel = otpSent ? "Verifying..." : "Sending code...";
            }

            return (
              <Button
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting}
                type="submit"
              >
                {submitLabel}
              </Button>
            );
          }}
        </form.Subscribe>
      </form>

      <div className="space-y-3">
        <SocialSignInButtons />
        <Button
          className="w-full"
          onClick={onSwitchToPassword}
          type="button"
          variant="link"
        >
          Prefer using a password? Switch to password login
        </Button>
      </div>
    </div>
  );
}
