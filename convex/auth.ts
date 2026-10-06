import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Resend,
    Anonymous,
  ],
});
