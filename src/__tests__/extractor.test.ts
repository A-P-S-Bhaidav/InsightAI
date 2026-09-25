import { mergeRecords } from '@/lib/ai/extractor';

describe('mergeRecords', () => {
  const columns = ['Name', 'Company', 'Email'];

  it('removes duplicates based on first 3 columns', () => {
    const records = [
      { Name: 'Alice', Company: 'Acme', Email: 'alice@acme.com', _source: 'a' },
      { Name: 'Alice', Company: 'Acme', Email: 'alice@acme.com', _source: 'b' },
      { Name: 'Bob', Company: 'Beta', Email: 'bob@beta.com', _source: 'a' },
    ];
    const result = mergeRecords(records, columns);
    expect(result).toHaveLength(2);
  });

  it('keeps unique records', () => {
    const records = [
      { Name: 'Alice', Company: 'Acme', Email: 'a@a.com', _source: 'x' },
      { Name: 'Bob', Company: 'Beta', Email: 'b@b.com', _source: 'x' },
      { Name: 'Charlie', Company: 'Gamma', Email: 'c@c.com', _source: 'x' },
    ];
    const result = mergeRecords(records, columns);
    expect(result).toHaveLength(3);
  });

  it('handles empty input', () => {
    expect(mergeRecords([], columns)).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const records = [
      { Name: 'Alice', Company: 'Acme', Email: 'a@a.com', _source: 'x' },
      { Name: 'alice', Company: 'acme', Email: 'A@a.com', _source: 'y' },
    ];
    const result = mergeRecords(records, columns);
    expect(result).toHaveLength(1);
  });
});
