import { createTaskSchema, registerSchema } from '@/lib/validations';

describe('createTaskSchema', () => {
  it('accepts valid input', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test Task',
      prompt: 'Get me data about startups in AI',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createTaskSchema.safeParse({
      title: '',
      prompt: 'Get me data about startups',
    });
    expect(result.success).toBe(false);
  });

  it('rejects prompt shorter than 10 chars', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test',
      prompt: 'Hi',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title longer than 200 chars', () => {
    const result = createTaskSchema.safeParse({
      title: 'x'.repeat(201),
      prompt: 'Valid prompt here for testing',
    });
    expect(result.success).toBe(false);
  });

  it('defaults priority to medium', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test Task',
      prompt: 'Get data about AI startups',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('medium');
    }
  });

  it('accepts valid priority values', () => {
    for (const p of ['low', 'medium', 'high']) {
      const result = createTaskSchema.safeParse({
        title: 'Test', prompt: 'Get me startup data please', priority: p,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid priority', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test', prompt: 'Get me startup data please', priority: 'urgent',
    });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test', prompt: 'Get me startup data please',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'John', email: 'not-an-email', password: 'Password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      name: 'John', email: 'john@test.com', password: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      name: 'John', email: 'john@test.com', password: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      name: 'John', email: 'john@test.com', password: 'Pass1',
    });
    expect(result.success).toBe(false);
  });
});
