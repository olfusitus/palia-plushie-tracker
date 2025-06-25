import { describe, it, expect } from 'vitest';
import { buildDistanceHistogramData } from './chartData';

describe('buildDistanceHistogramData', () => {
  it('should create correct histogram data for simple input', () => {
    const input = [1, 2, 3, 7, 8, 12];
    const result = buildDistanceHistogramData(input, 5);
    expect(result.data.labels).toEqual(['0-4', '5-9', '10-14']);
    expect(result.data.datasets[0].data).toEqual([3, 2, 1]);
  });

  it('should handle empty input', () => {
    const result = buildDistanceHistogramData([], 5);
    expect(result.data.labels).toEqual(['0-4']);
    expect(result.data.datasets[0].data).toEqual([0]);
  });
}); 