import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getClientIdentifier } from './rate-limit';

describe('getClientIdentifier', () => {
  beforeEach(() => {
    // Clear any mocks
    vi.clearAllMocks();
  });

  it('should extract IP from x-vercel-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-vercel-forwarded-for': '192.168.1.1' },
    });
    const identifier = getClientIdentifier(req);
    expect(identifier).toContain('192.168.1.1');
  });

  it('should extract IP from cf-connecting-ip header (Cloudflare)', () => {
    const req = new Request('http://localhost', {
      headers: { 'cf-connecting-ip': '10.0.0.1' },
    });
    const identifier = getClientIdentifier(req);
    expect(identifier).toContain('10.0.0.1');
  });

  it('should extract IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '172.16.0.1, 192.168.1.1' },
    });
    const identifier = getClientIdentifier(req);
    // Should use first IP in list
    expect(identifier).toContain('172.16.0.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '203.0.113.1' },
    });
    const identifier = getClientIdentifier(req);
    expect(identifier).toContain('203.0.113.1');
  });

  it('should use "unknown" when no IP headers present', () => {
    const req = new Request('http://localhost');
    const identifier = getClientIdentifier(req);
    expect(identifier).toContain('unknown');
  });

  it('should include user-agent hash in identifier', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-real-ip': '192.168.1.1',
        'user-agent': 'Mozilla/5.0 Test Browser',
      },
    });
    const identifier = getClientIdentifier(req);
    // Should contain IP and underscore and hash
    expect(identifier).toMatch(/192\.168\.1\.1_[a-z0-9]+/);
  });

  it('should create different identifiers for different user-agents', () => {
    const req1 = new Request('http://localhost', {
      headers: {
        'x-real-ip': '192.168.1.1',
        'user-agent': 'Browser A',
      },
    });
    const req2 = new Request('http://localhost', {
      headers: {
        'x-real-ip': '192.168.1.1',
        'user-agent': 'Browser B',
      },
    });

    const id1 = getClientIdentifier(req1);
    const id2 = getClientIdentifier(req2);

    // Same IP but different user agents should produce different identifiers
    expect(id1).not.toBe(id2);
    expect(id1.split('_')[0]).toBe(id2.split('_')[0]); // Same IP part
  });

  it('should prioritize x-vercel-forwarded-for over other headers', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-vercel-forwarded-for': '1.1.1.1',
        'cf-connecting-ip': '2.2.2.2',
        'x-forwarded-for': '3.3.3.3',
        'x-real-ip': '4.4.4.4',
      },
    });
    const identifier = getClientIdentifier(req);
    expect(identifier).toContain('1.1.1.1');
  });

  it('should handle malformed x-forwarded-for header gracefully', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '',
      },
    });
    const identifier = getClientIdentifier(req);
    // Should fallback to unknown
    expect(identifier).toContain('unknown');
  });

  it('should trim whitespace from IP addresses', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
      },
    });
    const identifier = getClientIdentifier(req);
    expect(identifier).toContain('192.168.1.1');
    expect(identifier).not.toMatch(/\s/); // No whitespace
  });

  it('should create consistent identifiers for same IP and user-agent', () => {
    const createReq = () =>
      new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.100',
          'user-agent': 'Consistent Browser',
        },
      });

    const id1 = getClientIdentifier(createReq());
    const id2 = getClientIdentifier(createReq());

    expect(id1).toBe(id2);
  });
});

// Note: We're not testing the actual rate limiting logic with Redis/Memory
// because it would require mocking complex dependencies or actual Redis instance.
// The in-memory implementation and Upstash integration should be tested in integration tests.

describe('rate-limit module exports', () => {
  it('should export required limiters', async () => {
    const { analyzeItemLimiter, marketResearchLimiter, generalLimiter } = await import(
      './rate-limit'
    );

    expect(analyzeItemLimiter).toBeDefined();
    expect(marketResearchLimiter).toBeDefined();
    expect(generalLimiter).toBeDefined();
  });

  it('should export rateLimit function', async () => {
    const { rateLimit } = await import('./rate-limit');
    expect(typeof rateLimit).toBe('function');
  });

  it('should export getClientIdentifier function', async () => {
    const { getClientIdentifier } = await import('./rate-limit');
    expect(typeof getClientIdentifier).toBe('function');
  });
});
