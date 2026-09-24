import { z } from 'zod';

// Task creation
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt too long'),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

// User registration
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

// Onboarding update
export const onboardingSchema = z.object({
  hasCompletedOnboarding: z.boolean(),
});

// Dataset export
export const exportSchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
});

// Generic ID param validation
export const idParamSchema = z.object({
  id: z.string().min(1).max(100),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
