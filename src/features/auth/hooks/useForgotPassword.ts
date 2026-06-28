import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../api/authApi';
import type { ForgotPasswordInput } from '../api/authApi';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}
