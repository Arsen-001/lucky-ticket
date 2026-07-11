import type { Dictionary } from '@/types/types/i18n.types';
import * as yup from 'yup';
import { GlobalConstants } from '@/constants/global.constants';

export const getUsernameSchema = (t: Dictionary) =>
  yup.object({
    username: yup
      .string()
      .required(t('username required'))
      .min(GlobalConstants.usernameMinLength, t('too short'))
      .max(GlobalConstants.usernameMaxLength, t('too long'))
      .matches(GlobalConstants.usernamePattern, t('invalid username characters')),
  });
