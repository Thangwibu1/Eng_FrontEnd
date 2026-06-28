import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../api/authApi';
import type { LoginInput } from '../api/authApi';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
