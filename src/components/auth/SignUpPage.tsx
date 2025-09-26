import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return (
    <div className="signup-page">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
