import { describe, expect, it } from 'vitest';
import { calculateBugStats } from './statistics';
import type { BugEntry } from '$lib/storage/types';

describe('calculateBugStats', () => {
	it('counts named plush drops per variant', () => {
		const entries: BugEntry[] = [
			{
				id: '1',
				timestamp: '2026-05-02T00:00:00.000Z',
				rareDrops: 1,
				variant: 'small',
				rareDropType: 'rainbow_frogbert'
			},
			{
				id: '2',
				timestamp: '2026-05-02T00:00:01.000Z',
				rareDrops: 1,
				variant: 'small',
				rareDropType: 'small'
			},
			{
				id: '3',
				timestamp: '2026-05-02T00:00:02.000Z',
				rareDrops: 0,
				variant: 'small'
			}
		];

		const result = calculateBugStats(entries);
		expect('count' in result).toBe(false);
		if ('count' in result) {
			throw new Error('Expected grouped bug stats');
		}

		expect(result.small.totalRareDrops).toBe(2);
		expect(result.small.plushBreakdown).toEqual({
			rainbow_frogbert: 1,
			small: 1
		});
	});
});