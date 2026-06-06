import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUser = cache(async (): Promise<string> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
});
