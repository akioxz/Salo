import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = typeof params.email === "string"
          ? params.email.trim().toLowerCase()
          : "";
        const name = typeof params.name === "string" && params.name.trim()
          ? params.name.trim()
          : email.split("@")[0] || "User";
        return { email, name };
      },
    }),
    Anonymous({
      profile(params) {
        return {
          name: (params.name as string) || "Family Member",
          isAnonymous: true,
        };
      },
    }),
  ],
});
