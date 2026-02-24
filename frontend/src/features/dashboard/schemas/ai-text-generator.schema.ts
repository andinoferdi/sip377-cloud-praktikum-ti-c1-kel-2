import { z } from 'zod';

export const aiTextGeneratorSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required'),
});

export type AiTextGeneratorFormValues = z.infer<typeof aiTextGeneratorSchema>;
