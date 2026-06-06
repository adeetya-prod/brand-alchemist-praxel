import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import type { Brand, Prisma } from "@prisma/client";

export async function getBrands(): Promise<Brand[]> {
  const userId = await getCurrentUser();
  return prisma.brand.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBrand(brandId: string): Promise<Brand> {
  const userId = await getCurrentUser();
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId },
    include: { assets: true, guidelines: true },
  });
  if (!brand) throw new Error("Not found");
  return brand;
}

export async function updateBrand(
  brandId: string,
  data: Prisma.BrandUpdateInput
): Promise<Brand> {
  const userId = await getCurrentUser();
  const existing = await prisma.brand.findFirst({
    where: { id: brandId, userId },
  });
  if (!existing) throw new Error("Not found");
  return prisma.brand.update({ where: { id: brandId }, data });
}
