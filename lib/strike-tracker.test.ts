import { describe, it, expect, beforeEach } from 'vitest';
import { trackStrike, getStrikeCount, isBlocked, resetStrikes } from './strike-tracker';

describe('Strike Tracker', () => {
  const testIdentifier = 'test-user-123';

  beforeEach(async () => {
    // Reset strikes before each test
    await resetStrikes(testIdentifier);
  });

  it('should start with zero strikes', async () => {
    const count = await getStrikeCount(testIdentifier);
    expect(count).toBe(0);
  });

  it('should increment strike count', async () => {
    await trackStrike(testIdentifier);
    const count = await getStrikeCount(testIdentifier);
    expect(count).toBe(1);
  });

  it('should track multiple strikes', async () => {
    await trackStrike(testIdentifier);
    await trackStrike(testIdentifier);
    await trackStrike(testIdentifier);
    const count = await getStrikeCount(testIdentifier);
    expect(count).toBe(3);
  });

  it('should block after 3 strikes', async () => {
    await trackStrike(testIdentifier);
    await trackStrike(testIdentifier);

    let blocked = await isBlocked(testIdentifier);
    expect(blocked).toBe(false);

    await trackStrike(testIdentifier);

    blocked = await isBlocked(testIdentifier);
    expect(blocked).toBe(true);
  });

  it('should reset strikes', async () => {
    await trackStrike(testIdentifier);
    await trackStrike(testIdentifier);
    await resetStrikes(testIdentifier);

    const count = await getStrikeCount(testIdentifier);
    expect(count).toBe(0);

    const blocked = await isBlocked(testIdentifier);
    expect(blocked).toBe(false);
  });

  it('should return correct strike count after tracking', async () => {
    const strikes1 = await trackStrike(testIdentifier);
    expect(strikes1).toBe(1);

    const strikes2 = await trackStrike(testIdentifier);
    expect(strikes2).toBe(2);
  });
});
