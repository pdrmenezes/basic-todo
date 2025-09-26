import { SignIn } from "@clerk/clerk-react";

export function LoginPage() {
  return (
    <div className="login-page">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}
