import { applyDecorators } from '@nestjs/common';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { MAX_ID } from '../../common/ids/max-id';
import { Required } from '../../common/validation/required';
import type { Formation } from '../../domain/lineup';
import { FORMATIONS, LINEUP_SIZE } from '../../domain/lineup';

const PLAYER_IDS_MESSAGE = `O campo player_ids deve ser uma lista de ${LINEUP_SIZE} ids distintos, inteiros positivos.`;

function PlayerIds(): PropertyDecorator {
  return applyDecorators(
    Required('player_ids'),
    IsArray({ message: PLAYER_IDS_MESSAGE }),
    ArrayMinSize(LINEUP_SIZE, { message: PLAYER_IDS_MESSAGE }),
    ArrayMaxSize(LINEUP_SIZE, { message: PLAYER_IDS_MESSAGE }),
    IsInt({ each: true, message: PLAYER_IDS_MESSAGE }),
    Min(1, { each: true, message: PLAYER_IDS_MESSAGE }),
    Max(MAX_ID, { each: true, message: PLAYER_IDS_MESSAGE }),
    ArrayUnique({ message: PLAYER_IDS_MESSAGE }),
  );
}

export class UpdateLineupDto {
  @Required('formation')
  @IsIn(FORMATIONS, {
    message: `O campo formation deve ser ${FORMATIONS.join(', ')}.`,
  })
  formation: Formation;

  @PlayerIds()
  player_ids: number[];
}
