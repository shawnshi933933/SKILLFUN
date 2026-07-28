import { useMutation, useQueryClient } from "@tanstack/react-query";
import { skillsApi, type CreateSkillInput } from "@/lib/api";

export function useCreateSkill() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSkillInput) => skillsApi.create(input),
    onSuccess: () => {
      // Invalidate the skills list so Market refreshes
      qc.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}
