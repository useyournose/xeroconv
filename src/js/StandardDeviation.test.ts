import {expect, test} from 'bun:test';
import StandardDeviation from '../js/StandardDeviation';

test('[300,150,450] m/s become 300', () => {
    expect(StandardDeviation([300,150,450])).toBe(122.47448713915891);
});