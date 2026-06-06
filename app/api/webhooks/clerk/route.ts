import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    if (!email) return new Response("No email", { status: 400 });
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.upsert({
      where: { clerkId: id },
      create: { clerkId: id, email, name },
      update: { email, name },
    });
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    await prisma.user
      .delete({ where: { clerkId: evt.data.id } })
      .catch(() => null);
  }

  return new Response("OK", { status: 200 });
}
