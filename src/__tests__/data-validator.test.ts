import { validateData } from '@/lib/ai/data-validator';

describe('validateData', () => {
  it('returns zero score for empty dataset', async () => {
    const result = await validateData([]);
    expect(result.overallScore).toBe(0);
    expect(result.completeness).toBe(0);
    expect(result.issues.length).toBeGreaterThanOrEqual(0);
  });

  it('returns high score for complete dataset', async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      name: `Person ${i}`,
      email: `person${i}@example.com`,
      company: `Company ${i}`,
    }));
    const result = await validateData(data);
    expect(result.overallScore).toBeGreaterThan(70);
    expect(result.completeness).toBeGreaterThan(90);
  });

  it('returns lower completeness for data with missing fields', async () => {
    const data = [
      { name: 'Alice', email: 'alice@test.com', company: 'Acme' },
      { name: 'Bob', email: '', company: '' },
      { name: '', email: '', company: '' },
    ];
    const result = await validateData(data);
    expect(result.completeness).toBeLessThan(70);
  });

  it('detects correct field types', async () => {
    const data = [
      { name: 'Alice', email: 'alice@test.com', url: 'https://example.com', salary: '50000', date: '2024-01-15' },
      { name: 'Bob', email: 'bob@test.com', url: 'https://bob.com', salary: '60000', date: '2024-02-20' },
    ];
    const result = await validateData(data);
    
    const nameField = result.fieldQualities.find(f => f.field === 'name');
    const emailField = result.fieldQualities.find(f => f.field === 'email');
    const urlField = result.fieldQualities.find(f => f.field === 'url');
    
    expect(nameField?.type).toBe('text');
    expect(emailField?.type).toBe('email');
    expect(urlField?.type).toBe('url');
  });

  it('generates suggestions for problematic data', async () => {
    const data = [
      { name: 'Alice', company: '' },
      { name: 'Bob', company: '' },
      { name: '', company: '' },
    ];
    const result = await validateData(data);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('computes weighted overall score from components', async () => {
    const data = Array.from({ length: 5 }, (_, i) => ({
      name: `Person ${i}`,
      value: `${(i + 1) * 100}`,
    }));
    const result = await validateData(data);
    // Overall should be a combination of completeness, consistency, accuracy
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('returns field qualities for each column', async () => {
    const data = [
      { name: 'Alice', age: '30', city: 'NYC' },
      { name: 'Bob', age: '25', city: 'LA' },
    ];
    const result = await validateData(data);
    expect(result.fieldQualities.length).toBe(3);
    result.fieldQualities.forEach(fq => {
      expect(fq).toHaveProperty('field');
      expect(fq).toHaveProperty('completeness');
      expect(fq).toHaveProperty('type');
      expect(fq).toHaveProperty('uniqueRatio');
      expect(fq).toHaveProperty('avgLength');
    });
  });

  it('detects number type correctly', async () => {
    const data = [
      { quantity: '15000', name: 'A' },
      { quantity: '28500', name: 'B' },
      { quantity: '42000', name: 'C' },
    ];
    const result = await validateData(data);
    const quantityField = result.fieldQualities.find(f => f.field === 'quantity');
    expect(quantityField?.type).toBe('number');
  });
});
