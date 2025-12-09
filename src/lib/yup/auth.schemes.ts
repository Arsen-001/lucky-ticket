import type { Dictionary } from '@/types/types/project.types';
import * as yup from 'yup';
import { GlobalConstants } from '@/constants/global.constants';

export const getLoginSchema = (t: Dictionary) => {
  return yup.object({
    email: yup
      .string()
      .required(t('email or username is required'))
      .trim()
      .min(3, t('too short'))
      .max(255, t('too long')),
    password: yup
      .string()
      .required(t('password is required'))
      .min(
        6,
        t('confirm password required', {
          num: GlobalConstants.minPasswordLength,
        })
      ),
  });
};

export const getRegisterSchema = (t: Dictionary) =>
  yup.object({
    email: yup.string().required(t('email required')).email(t('invalid email')),
    username: yup
      .string()
      .required(t('username required'))
      .min(3, t('too short')),
    phone: yup
      .string()
      .required(t('phone number required'))
      .min(6, t('invalid phone number')),
    password: yup
      .string()
      .required(t('password required'))
      .min(
        6,
        t('min length is {num}', { num: GlobalConstants.minPasswordLength })
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('passwords must match'))
      .required(t('confirm password required')),
  });

export const getForgotPasswordSchema = (t: Dictionary) =>
  yup.object({
    email: yup.string().required(t('email required')).email(t('invalid email')),
  });

export const getResetPasswordSchema = (t: Dictionary) =>
  yup.object({
    password: yup
      .string()
      .required(t('password is required'))
      .min(
        8,
        t('min length is {num}', { num: GlobalConstants.minPasswordLength })
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('passwords must match'))
      .required(t('confirm password required')),
  });

export const getTwoFactorSchema = (t: Dictionary) =>
  yup.object({
    code: yup
      .string()
      .required(t('code is required'))
      .matches(/^\d{6}$/, t('code must be 6 digits')),
  });
