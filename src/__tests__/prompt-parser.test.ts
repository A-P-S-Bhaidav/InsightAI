import { parsePrompt } from '../lib/ai/prompt-parser';
import * as client from '../lib/ai/client';

jest.mock('../lib/ai/client', () => ({
  generateAIContent: jest.fn(),
}));

describe('prompt-parser.ts', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses basic prompt using fallback when API fails', async () => {
    (client.generateAIContent as jest.Mock).mockRejectedValue(new Error('API failure'));
    const result = await parsePrompt('Get me founders of AI startups');
    expect(result.dataType).toBe('Startup Founders');
    expect(result.columns).toContain('Title/Role');
  });

  it('extracts columns from prompt using fallback', async () => {
    (client.generateAIContent as jest.Mock).mockRejectedValue(new Error('API failure'));
    const result = await parsePrompt('Find software engineers with their email and linkedin');
    expect(result.columns).toContain('Email');
    expect(result.columns).toContain('LinkedIn URL');
  });

  it('detects data type correctly using fallback', async () => {
    (client.generateAIContent as jest.Mock).mockRejectedValue(new Error('API failure'));
    const result = await parsePrompt('Find product pricing');
    expect(result.dataType).toBe('Products');
  });

  it('parses prompt correctly when AI client succeeds', async () => {
    const mockResponse = JSON.stringify({
      dataType: 'Startup Founders',
      keywords: ['AI startup founders'],
      sources: ['linkedin.com'],
      outputFormat: 'table',
      filters: {},
      constraints: [],
      targetCount: 10,
      description: 'Test',
      columns: ['Name', 'Email'],
      needsClarification: false,
      clarifyingQuestion: null
    });
    
    (client.generateAIContent as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await parsePrompt('Some prompt');
    expect(result.dataType).toBe('Startup Founders');
    expect(result.columns).toEqual(['Name', 'Email']);
  });

  it('handles edge case of empty prompt using fallback', async () => {
    (client.generateAIContent as jest.Mock).mockRejectedValue(new Error('API failure'));
    const result = await parsePrompt('');
    expect(result.description).toBe('');
  });
});
