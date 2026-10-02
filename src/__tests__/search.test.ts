import { extractInternalLinks } from '../lib/ai/search';

describe('search.ts - extractInternalLinks', () => {
  it('extracts internal links correctly', () => {
    const html = `
      <html>
        <body>
          <a href="/about">About Us</a>
          <a href="https://example.com/contact">Contact</a>
          <a href="https://other.com/link">External</a>
        </body>
      </html>
    `;
    const links = extractInternalLinks(html, 'https://example.com');
    expect(links.length).toBe(2);
    expect(links).toContain('https://example.com/about');
    expect(links).toContain('https://example.com/contact');
  });

  it('ignores mailto and javascript links', () => {
    const html = `
      <a href="mailto:test@test.com">Email</a>
      <a href="javascript:void(0)">Click</a>
      <a href="/team">Team</a>
    `;
    const links = extractInternalLinks(html, 'https://example.com');
    expect(links.length).toBe(1);
    expect(links).toContain('https://example.com/team');
  });

  it('limits the number of returned links', () => {
    const html = Array.from({ length: 20 })
      .map((_, i) => `<a href="/page${i}">Page ${i}</a>`)
      .join('');
    
    const links = extractInternalLinks(html, 'https://example.com', 5);
    expect(links.length).toBe(5);
  });

  it('prioritizes high value keywords', () => {
    const html = `
      <a href="/login">Login</a>
      <a href="/about">About</a>
      <a href="/cart">Cart</a>
      <a href="/contact">Contact</a>
    `;
    const links = extractInternalLinks(html, 'https://example.com');
    // About and Contact should have higher scores, appearing earlier
    expect(links[0]).toMatch(/about|contact/);
    expect(links[1]).toMatch(/about|contact/);
  });
  
  it('handles malformed URLs gracefully', () => {
    const html = `
      <a href="http://">Malformed</a>
      <a href="/valid">Valid</a>
    `;
    const links = extractInternalLinks(html, 'https://example.com');
    expect(links).toContain('https://example.com/valid');
  });
});
