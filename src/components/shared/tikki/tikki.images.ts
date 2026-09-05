import bronzeIdle from '@assets/images/tikki/bronze-idle.webp';
import bronzeHappy from '@assets/images/tikki/bronze-happy.webp';
import bronzeJump from '@assets/images/tikki/bronze-jump.webp';
import bronzeSad from '@assets/images/tikki/bronze-sad.webp';
import bronzeThink from '@assets/images/tikki/bronze-think.webp';
import silverIdle from '@assets/images/tikki/silver-idle.webp';
import silverHappy from '@assets/images/tikki/silver-happy.webp';
import silverJump from '@assets/images/tikki/silver-jump.webp';
import silverSad from '@assets/images/tikki/silver-sad.webp';
import silverThink from '@assets/images/tikki/silver-think.webp';
import goldIdle from '@assets/images/tikki/gold-idle.webp';
import goldHappy from '@assets/images/tikki/gold-happy.webp';
import goldJump from '@assets/images/tikki/gold-jump.webp';
import goldSad from '@assets/images/tikki/gold-sad.webp';
import goldThink from '@assets/images/tikki/gold-think.webp';
import platinumIdle from '@assets/images/tikki/platinum-idle.webp';
import platinumHappy from '@assets/images/tikki/platinum-happy.webp';
import platinumJump from '@assets/images/tikki/platinum-jump.webp';
import platinumSad from '@assets/images/tikki/platinum-sad.webp';
import platinumThink from '@assets/images/tikki/platinum-think.webp';
import diamondIdle from '@assets/images/tikki/diamond-idle.webp';
import diamondHappy from '@assets/images/tikki/diamond-happy.webp';
import diamondJump from '@assets/images/tikki/diamond-jump.webp';
import diamondSad from '@assets/images/tikki/diamond-sad.webp';
import diamondThink from '@assets/images/tikki/diamond-think.webp';

import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { TikkiTier } from './tikki.constants';

/**
 * Тикки одного тира в пяти состояниях. Сняты с рига персонажа, поэтому все
 * пятеро стоят на одном месте и одного размера — тир отличается только цветом
 * металла, а поза не сдвигает ни пикселя вокруг.
 *
 * Что чем сказано:
 * - `idle` — обычное состояние сцены;
 * - `happy` — кадр нажатия;
 * - `jump` — кликер набит доверху, доход встал: «забирай»;
 * - `sad` — брать нечего;
 * - `think` — пока не занят: снят с рига вместе с остальными и ждёт состояния,
 *   которому подойдёт (вопрос над головой — это «что дальше», а не «пусто»).
 */
export interface TikkiPoses {
  idle: typeof bronzeIdle;
  happy: typeof bronzeHappy;
  jump: typeof bronzeJump;
  sad: typeof bronzeSad;
  think: typeof bronzeThink;
}

export const tikkiImages: Record<TikkiTier, TikkiPoses> = {
  [TicketsEnum.BRONZE]: {
    idle: bronzeIdle,
    happy: bronzeHappy,
    jump: bronzeJump,
    sad: bronzeSad,
    think: bronzeThink,
  },
  [TicketsEnum.SILVER]: {
    idle: silverIdle,
    happy: silverHappy,
    jump: silverJump,
    sad: silverSad,
    think: silverThink,
  },
  [TicketsEnum.GOLD]: {
    idle: goldIdle,
    happy: goldHappy,
    jump: goldJump,
    sad: goldSad,
    think: goldThink,
  },
  [TicketsEnum.PLATINUM]: {
    idle: platinumIdle,
    happy: platinumHappy,
    jump: platinumJump,
    sad: platinumSad,
    think: platinumThink,
  },
  [TicketsEnum.DIAMOND]: {
    idle: diamondIdle,
    happy: diamondHappy,
    jump: diamondJump,
    sad: diamondSad,
    think: diamondThink,
  },
};
