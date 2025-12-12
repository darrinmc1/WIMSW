import { describe, it, expect, beforeEach } from 'vitest';
import { generateCacheKey } from './cache';

describe('Cache Utilities', () => {
  describe('generateCacheKey', () => {
    it('should generate consistent keys for same data', () => {
      const data = { name: 'Nike Shoes', brand: 'Nike', category: 'Shoes' };
      const key1 = generateCacheKey('test', data);
      const key2 = generateCacheKey('test', data);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different data', () => {
      const data1 = { name: 'Nike Shoes', brand: 'Nike' };
      const data2 = { name: 'Adidas Shoes', brand: 'Adidas' };

      const key1 = generateCacheKey('test', data1);
      const key2 = generateCacheKey('test', data2);

      expect(key1).not.toBe(key2);
    });

    it('should include prefix in key', () => {
      const data = { name: 'Test' };
      const key1 = generateCacheKey('prefix1', data);
      const key2 = generateCacheKey('prefix2', data);

      expect(key1).toContain('prefix1');
      expect(key2).toContain('prefix2');
      expect(key1).not.toBe(key2);
    });

    it('should be order-independent for object keys', () => {
      const data1 = { name: 'Test', brand: 'Brand', category: 'Category' };
      const data2 = { category: 'Category', name: 'Test', brand: 'Brand' };

      const key1 = generateCacheKey('test', data1);
      const key2 = generateCacheKey('test', data2);

      expect(key1).toBe(key2);
    });

    it('should generate short, URL-safe keys', () => {
      const data = { name: 'Long item name with spaces', brand: 'Brand Name' };
      const key = generateCacheKey('test', data);

      // Key should be relatively short
      expect(key.length).toBeLessThan(50);
      // Key should only contain alphanumeric and colons
      expect(key).toMatch(/^[a-z0-9:-]+$/);
    });

    it('should handle nested objects', () => {
      const data = {
        item: { name: 'Test', details: { brand: 'Nike' } },
        price: 50,
      };
      const key = generateCacheKey('test', data);

      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should handle arrays', () => {
      const data = {
        tags: ['vintage', 'nike', 'shoes'],
        sizes: [8, 9, 10],
      };
      const key = generateCacheKey('test', data);

      expect(key).toBeTruthy();
    });

    it('should handle special characters in data', () => {
      const data = {
        name: 'Item with "quotes" and special chars!@#',
        description: 'Multi\nline\ntext',
      };
      const key = generateCacheKey('test', data);

      expect(key).toBeTruthy();
      expect(key).toMatch(/^[a-z0-9:-]+$/);
    });

    it('should generate unique keys for similar but different data', () => {
      const keys = new Set();

      for (let i = 0; i < 100; i++) {
        const key = generateCacheKey('test', { index: i });
        keys.add(key);
      }

      // All 100 keys should be unique
      expect(keys.size).toBe(100);
    });
  });

  describe('Cache key collision resistance', () => {
    it('should avoid collisions for similar items', () => {
      const items = [
        { name: 'Nike Air Max', brand: 'Nike', condition: 'Good' },
        { name: 'Nike Air Max', brand: 'Nike', condition: 'Excellent' },
        { name: 'Nike Air Max 90', brand: 'Nike', condition: 'Good' },
        { name: 'Nike Air', brand: 'Nike', condition: 'Good' },
      ];

      const keys = items.map(item => generateCacheKey('market-research', item));
      const uniqueKeys = new Set(keys);

      expect(uniqueKeys.size).toBe(items.length);
    });

    it('should differentiate between local and shipping preferences', () => {
      const data = { name: 'Item', brand: 'Brand' };

      const key1 = generateCacheKey('test', { ...data, isLocalOnly: true });
      const key2 = generateCacheKey('test', { ...data, isLocalOnly: false });

      expect(key1).not.toBe(key2);
    });
  });
});
