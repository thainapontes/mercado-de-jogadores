import type { Condition } from '../../domain/types';
import { PlayerCondition } from './player-decorators';

export class UpdateConditionDto {
  @PlayerCondition()
  condition: Condition;
}
