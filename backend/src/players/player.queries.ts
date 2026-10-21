import { NotFoundException } from '@nestjs/common';
import { Player, Prisma } from '../generated/prisma/client';

export async function findActivePlayer(
  db: Prisma.TransactionClient,
  id: number,
): Promise<Player> {
  const player = await db.player.findFirst({ where: { id, deletedAt: null } });
  if (!player) {
    throw new NotFoundException('Jogador não encontrado.');
  }
  return player;
}

export async function lockPlayers(
  tx: Prisma.TransactionClient,
  ids: number[],
): Promise<void> {
  await tx.$queryRaw`SELECT id FROM jogadores WHERE id = ANY(${ids}) FOR UPDATE`;
}
