import { processPipeline } from '@/lib/scraper/pipeline';

describe('processPipeline', () => {
  it('decodes HTML entities in values', () => {
    const result = processPipeline([
      { name: 'AT&amp;T', description: '&lt;b&gt;telecom&lt;/b&gt;' }
    ]);
    expect(result.data[0].name).toBe('AT&T');
    expect(result.data[0].description).toBe('<b>telecom</b>');
    expect(result.stats.entitiesDecoded).toBeGreaterThan(0);
  });

  it('normalizes URLs by stripping tracking params', () => {
    const result = processPipeline([
      { url: 'https://example.com/page?utm_source=google&utm_medium=cpc&id=123' }
    ]);
    expect(result.data[0].url).toBe('https://example.com/page?id=123');
  });

  it('strips trailing slashes from URLs', () => {
    const result = processPipeline([
      { url: 'https://example.com/page/' }
    ]);
    expect(result.data[0].url).toBe('https://example.com/page');
  });

  it('removes fuzzy duplicates (case-insensitive, whitespace-normalized)', () => {
    const result = processPipeline([
      { name: 'John Doe', company: 'Acme Corp' },
      { name: 'john doe', company: 'acme corp' },
      { name: 'Jane Smith', company: 'Beta Inc' },
    ]);
    expect(result.data.length).toBe(2);
    expect(result.stats.duplicatesRemoved).toBe(1);
  });

  it('strips markdown artifacts from LLM output', () => {
    const result = processPipeline([
      { name: '**John Doe**', title: '*Engineer*', code: '`ABC123`' }
    ]);
    expect(result.data[0].name).toBe('John Doe');
    expect(result.data[0].title).toBe('Engineer');
    expect(result.data[0].code).toBe('ABC123');
  });

  it('removes empty records', () => {
    const result = processPipeline([
      { name: 'Valid', company: 'Acme' },
      { name: '', company: '' },
      { name: null as unknown as string, company: undefined as unknown as string },
    ]);
    expect(result.data.length).toBe(1);
    expect(result.stats.invalidRemoved).toBe(2);
  });

  it('normalizes emails to lowercase', () => {
    const result = processPipeline(
      [{ email: 'John.Doe@Example.COM' }],
      { normalizeCase: true }
    );
    expect(result.data[0].email).toBe('john.doe@example.com');
  });

  it('trims whitespace and normalizes multi-spaces', () => {
    const result = processPipeline([
      { name: '  John   Doe  ', company: '  Acme  Corp  ' }
    ]);
    expect(result.data[0].name).toBe('John Doe');
    expect(result.data[0].company).toBe('Acme Corp');
  });

  it('preserves non-string values unchanged', () => {
    const result = processPipeline([
      { name: 'John', count: 42, active: true }
    ]);
    expect(result.data[0].count).toBe(42);
    expect(result.data[0].active).toBe(true);
  });

  it('reports pipeline stats correctly', () => {
    const result = processPipeline([
      { name: 'A' }, { name: 'B' }, { name: 'A' }
    ]);
    expect(result.stats.inputCount).toBe(3);
    expect(result.stats.outputCount).toBe(2);
    expect(result.stats.duplicatesRemoved).toBe(1);
  });

  it('handles empty input', () => {
    const result = processPipeline([]);
    expect(result.data).toEqual([]);
    expect(result.stats.inputCount).toBe(0);
    expect(result.stats.outputCount).toBe(0);
  });

  it('respects config overrides', () => {
    const result = processPipeline(
      [{ name: 'A' }, { name: 'A' }],
      { removeDuplicates: false }
    );
    expect(result.data.length).toBe(2);
  });

  it('decodes numeric HTML entities', () => {
    const result = processPipeline([
      { name: '&#169; 2024 &#8211; All Rights' }
    ]);
    expect(result.data[0].name).toBe('© 2024 – All Rights');
  });
});
