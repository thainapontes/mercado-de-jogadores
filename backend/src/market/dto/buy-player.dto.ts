import { applyDecorators } from '@nestjs/common';
import { IsString } from 'class-validator';
import { parseApiDateTime } from '../../common/dates/api-date-time';
import { BodyId, Required } from '../../common/validation/required';
import { Satisfies } from '../../common/validation/satisfies';

function ApiDateTime(field: string): PropertyDecorator {
  const message = `O campo ${field} deve ser uma data e hora real no formato AAAA-MM-DDTHH:MM-03:00.`;
  return applyDecorators(
    Required(field),
    IsString({ message }),
    Satisfies(
      'apiDateTime',
      (value: string) => parseApiDateTime(value) !== null,
      message,
    ),
  );
}

export class BuyPlayerDto {
  @BodyId('club_id')
  club_id: number;

  @ApiDateTime('loyalty_until')
  loyalty_until: string;
}

export interface PurchaseOrder {
  clubId: number;
  loyaltyUntil: Date;
}

export function toPurchaseOrder(dto: BuyPlayerDto): PurchaseOrder {
  return {
    clubId: dto.club_id,
    loyaltyUntil: parseApiDateTime(dto.loyalty_until) as Date,
  };
}
