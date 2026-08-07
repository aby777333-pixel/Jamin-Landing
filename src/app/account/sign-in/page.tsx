import { Suspense } from "react";
import { SignInForm } from "@/components/account/SignInForm";

export default function SignInPage() {
  // `next` deliberately is NOT read from the query string. An open redirect
  // parameter on a sign-in page is a phishing primitive, and the only place a
  // buyer needs to land after signing in is their own account.
  return (
    <Suspense fallback={null}>
      <SignInForm next="/account" />
    </Suspense>
  );
}
