import type { Position } from '../../domain/types';
import {
  IntegerBetween,
  PlayerAgility,
  PlayerName,
  PlayerPosition,
} from './player-decorators';
import { AGE_MAX, AGE_MIN } from './player-rules';

export class UpdatePlayerDto {
  @PlayerName()
  name: string;

  @PlayerPosition()
  position: Position;

  @PlayerAgility()
  agility: number;

  @IntegerBetween('age', AGE_MIN, AGE_MAX)
  age: number;
}
