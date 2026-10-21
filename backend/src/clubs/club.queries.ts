import { NotFoundException } from '@nestjs/common';
import { Club, Prisma } from '../generated/prisma/client';

export async function findClub(
  db: Prisma.TransactionClient,
  id: number,
): Promise<Club> {
  const club = await db.club.findUnique({ where: { id } });
  if (!club) {
    throw new NotFoundException('Clube não encontrado.');
  }
  return club;
}

export async function findClubForUpdate(
  tx: Prisma.TransactionClient,
  id: number,
): Promise<Club> {
  await tx.$queryRaw`SELECT id FROM clubes WHERE id = ${id} FOR UPDATE`;
  return findClub(tx, id);
}
