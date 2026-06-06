import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import type { Creative } from "@prisma/client";

export async function getCreatives(brandId: string): Promise<Creative[]> {
  const userId = await getCurrentUser();
  const brand = await prisma.brand.findFirst({ where: { id: brandId, userId } });
  if (!brand) throw new Error("Not found");
  return prisma.creative.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCreative(creativeId: string): Promise<Creative> {
  const userId = await getCurrentUser();
  const creative = await prisma.creative.findFirst({
    where: { id: creativeId, brand: { userId } },
  });
  if (!creative) throw new Error("Not found");
  return creative;
}

export async function getCreativeWithKey(creativeId: string) {
  const userId = await getCurrentUser();
  const creative = await prisma.creative.findFirst({
    where: { id: creativeId, brand: { userId } },
    select: {
      id: true, format: true, prompt: true, editedPrompt: true,
      status: true, url: true, key: true, variantIndex: true,
      parentCreativeId: true, brandId: true, createdAt: true,
    },
  });
  if (!creative) throw new Error("Not found");
  return creative;
}
