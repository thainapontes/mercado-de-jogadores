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
