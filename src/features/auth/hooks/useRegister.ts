import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '../api/authApi';
import type { RegisterInput } from '../api/authApi';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
