import { describe, it, expect } from 'vitest';
import { checkInputRelevance } from './utils';

describe('checkInputRelevance', () => {
  it('should reject empty input', () => {
    const result = checkInputRelevance('', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('cannot be empty');
  });

  it('should reject repeated characters', () => {
    const result = checkInputRelevance('aaaaaaaaaaa', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('appears to be invalid');
  });

  it('should reject keyboard spam', () => {
    const result = checkInputRelevance('asdfasdfasdf', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('appears to be invalid');
  });

  it('should reject excessive special characters', () => {
    const result = checkInputRelevance('!@#$%^&*()!@#$', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('appears to be invalid');
  });

  it('should reject only numbers for text fields', () => {
    const result = checkInputRelevance('12345678', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('appears to be invalid');
  });

  it('should reject single character input', () => {
    const result = checkInputRelevance('a', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('appears to be invalid');
  });

  it('should reject URLs', () => {
    const result = checkInputRelevance('https://example.com', 'Item name');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('should not contain URLs');
  });

  it('should reject email addresses', () => {
    const result = checkInputRelevance('test@example.com', 'Brand');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('should not contain');
  });

  it('should reject filtered content markers', () => {
    const result = checkInputRelevance('[FILTERED] text', 'Description');
    expect(result.isRelevant).toBe(false);
    expect(result.reason).toContain('contains invalid content');
  });

  it('should accept valid item names', () => {
    const result = checkInputRelevance('Nike Air Max 90', 'Item name');
    expect(result.isRelevant).toBe(true);
  });

  it('should accept valid brand names', () => {
    const result = checkInputRelevance('Apple', 'Brand');
    expect(result.isRelevant).toBe(true);
  });

  it('should accept valid descriptions', () => {
    const result = checkInputRelevance('Gently used iPhone 13 Pro in excellent condition', 'Description');
    expect(result.isRelevant).toBe(true);
  });

  it('should accept category names', () => {
    const result = checkInputRelevance('Electronics', 'Category');
    expect(result.isRelevant).toBe(true);
  });

  it('should accept 2-character names as minimum', () => {
    const result = checkInputRelevance('AB', 'Item name');
    expect(result.isRelevant).toBe(true);
  });

  it('should handle edge cases gracefully', () => {
    expect(checkInputRelevance(null as any, 'Field').isRelevant).toBe(false);
    expect(checkInputRelevance(undefined as any, 'Field').isRelevant).toBe(false);
    expect(checkInputRelevance(123 as any, 'Field').isRelevant).toBe(false);
  });
});
