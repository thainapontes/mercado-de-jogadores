import { BodyId } from '../../common/validation/required';
import { Satisfies } from '../../common/validation/satisfies';

export class CreateMatchDto {
  @BodyId('home_club_id')
  home_club_id: number;

  @BodyId('away_club_id')
  @Satisfies<CreateMatchDto>(
    'differentClubs',
    (awayClubId, dto) => awayClubId !== dto.home_club_id,
    'O mandante e o visitante devem ser clubes diferentes.',
  )
  away_club_id: number;
}
