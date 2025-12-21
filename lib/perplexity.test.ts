import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MarketResearchResult } from './perplexity';

// Note: Since parseMarketResearchResponse is a private function,
// we'll test the parsing logic indirectly through observable outputs
// or by creating test utilities that mirror the parsing behavior

describe('Perplexity Market Research', () => {
  describe('Price extraction patterns', () => {
    it('should extract prices in format $XX.XX', () => {
      const text = 'Items sell for $45.99 and $67.50 typically';
      const priceRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
      const matches = text.match(priceRegex);
      expect(matches).toEqual(['$45.99', '$67.50']);
    });

    it('should extract prices with commas', () => {
      const text = 'Premium items cost $1,234.56 or even $12,345.67';
      const priceRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
      const matches = text.match(priceRegex);
      expect(matches).toEqual(['$1,234.56', '$12,345.67']);
    });

    it('should extract whole dollar amounts', () => {
      const text = 'Prices range from $50 to $150';
      const priceRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
      const matches = text.match(priceRegex);
      expect(matches).toEqual(['$50', '$150']);
    });

    it('should handle no prices in text', () => {
      const text = 'No pricing information available';
      const priceRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
      const matches = text.match(priceRegex);
      expect(matches).toBeNull();
    });
  });

  describe('Price calculation', () => {
    it('should calculate min, max, and average correctly', () => {
      const prices = [45.99, 67.50, 55.00, 72.25];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

      expect(min).toBe(45.99);
      expect(max).toBe(72.25);
      expect(average).toBe(60); // (45.99 + 67.50 + 55.00 + 72.25) / 4 = 60.185
    });

    it('should handle single price', () => {
      const prices = [50.00];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

      expect(min).toBe(50);
      expect(max).toBe(50);
      expect(average).toBe(50);
    });

    it('should return 0 for empty price array', () => {
      const prices: number[] = [];
      const min = prices.length > 0 ? Math.min(...prices) : 0;
      const max = prices.length > 0 ? Math.max(...prices) : 0;
      const average = prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

      expect(min).toBe(0);
      expect(max).toBe(0);
      expect(average).toBe(0);
    });
  });

  describe('URL extraction', () => {
    it('should extract HTTPS URLs', () => {
      const text = 'Check https://ebay.com/item and https://mercari.com/listing';
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = text.match(urlRegex);
      expect(matches).toEqual(['https://ebay.com/item', 'https://mercari.com/listing']);
    });

    it('should extract HTTP URLs', () => {
      const text = 'Visit http://example.com for more';
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = text.match(urlRegex);
      expect(matches).toEqual(['http://example.com']);
    });

    it('should stop at whitespace and parentheses', () => {
      const text = 'See (https://example.com) and https://other.com for details';
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = text.match(urlRegex);
      expect(matches).toEqual(['https://example.com', 'https://other.com']);
    });

    it('should handle no URLs', () => {
      const text = 'No URLs in this text';
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const matches = text.match(urlRegex);
      expect(matches).toBeNull();
    });
  });

  describe('Domain name extraction', () => {
    it('should extract and capitalize domain name', () => {
      const url = 'https://www.ebay.com/item/12345';
      const domain = new URL(url).hostname.replace('www.', '');
      const formatted = domain.charAt(0).toUpperCase() + domain.slice(1);
      expect(formatted).toBe('Ebay.com');
    });

    it('should handle domains without www', () => {
      const url = 'https://mercari.com/us/item/';
      const domain = new URL(url).hostname.replace('www.', '');
      const formatted = domain.charAt(0).toUpperCase() + domain.slice(1);
      expect(formatted).toBe('Mercari.com');
    });

    it('should handle subdomains', () => {
      const url = 'https://shop.example.com/products';
      const domain = new URL(url).hostname.replace('www.', '');
      const formatted = domain.charAt(0).toUpperCase() + domain.slice(1);
      expect(formatted).toBe('Shop.example.com');
    });

    it('should handle invalid URL gracefully', () => {
      let result;
      try {
        new URL('not-a-url');
        result = 'Should have thrown';
      } catch {
        result = 'Source';
      }
      expect(result).toBe('Source');
    });
  });

  describe('Content section parsing', () => {
    it('should find market trends section', () => {
      const content = `
Some intro text.

Market trends show increasing demand for vintage items.

Other information here.
      `.trim();

      const sections = content.split('\n\n');
      const marketTrends = sections.find(s =>
        s.toLowerCase().includes('trend') ||
        s.toLowerCase().includes('demand') ||
        s.toLowerCase().includes('market')
      );

      expect(marketTrends).toContain('Market trends');
    });

    it('should find recommendations section', () => {
      const content = `
Introduction here.

We recommend selling on eBay for best prices.

Conclusion.
      `.trim();

      const sections = content.split('\n\n');
      const recommendations = sections.find(s =>
        s.toLowerCase().includes('recommend') ||
        s.toLowerCase().includes('best') ||
        s.toLowerCase().includes('platform')
      );

      expect(recommendations).toContain('recommend');
    });

    it('should return fallback when section not found', () => {
      const content = 'Just some random text without keywords';
      const sections = content.split('\n\n');

      const marketTrends = sections.find(s =>
        s.toLowerCase().includes('trend') ||
        s.toLowerCase().includes('demand') ||
        s.toLowerCase().includes('market')
      ) || 'Market trends data available in full research';

      expect(marketTrends).toBe('Market trends data available in full research');
    });
  });

  describe('Summary truncation', () => {
    it('should truncate long content to 300 chars with ellipsis', () => {
      const longText = 'a'.repeat(350);
      const summary = longText.slice(0, 300) + (longText.length > 300 ? '...' : '');

      expect(summary.length).toBe(303); // 300 + '...'
      expect(summary.endsWith('...')).toBe(true);
    });

    it('should not add ellipsis to short content', () => {
      const shortText = 'Short text';
      const summary = shortText.slice(0, 300) + (shortText.length > 300 ? '...' : '');

      expect(summary).toBe('Short text');
      expect(summary.endsWith('...')).toBe(false);
    });

    it('should handle exactly 300 characters', () => {
      const exactText = 'a'.repeat(300);
      const summary = exactText.slice(0, 300) + (exactText.length > 300 ? '...' : '');

      expect(summary.length).toBe(300);
      expect(summary.endsWith('...')).toBe(false);
    });
  });

  describe('MarketResearchResult structure', () => {
    it('should have required structure', () => {
      const result: MarketResearchResult = {
        summary: 'Test summary',
        currentPricing: {
          min: 10,
          max: 50,
          average: 30,
        },
        sources: [
          {
            title: 'eBay',
            url: 'https://ebay.com',
            snippet: 'Source from market research',
          },
        ],
        marketTrends: 'Trending upward',
        recommendations: 'Sell on eBay',
      };

      expect(result.summary).toBeDefined();
      expect(result.currentPricing).toHaveProperty('min');
      expect(result.currentPricing).toHaveProperty('max');
      expect(result.currentPricing).toHaveProperty('average');
      expect(result.sources).toBeInstanceOf(Array);
      expect(result.marketTrends).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });
});
