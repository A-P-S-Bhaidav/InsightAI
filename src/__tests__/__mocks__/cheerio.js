module.exports = {
  load: (html) => {
    const $ = (selector) => {
      if (selector === 'a') {
        const links = [];
        const regex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
          links.push({ href: match[1], text: match[2] });
        }
        return {
          each: (cb) => {
            links.forEach((link, i) => {
              const el = {
                attr: (name) => name === 'href' ? link.href : null,
                text: () => link.text
              };
              // Mock jQuery wrapper for el since $(el) is used
              cb(i, el);
            });
          }
        };
      }
      // For $(el)
      if (selector && selector.attr) {
        return selector;
      }
      return { remove: () => {}, each: () => {}, text: () => '', first: () => ({ text: () => '' }), length: 0 };
    };
    return $;
  }
};
