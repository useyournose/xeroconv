import {expect, test} from '@jest/globals';
import getdatestring from '../js/getdatestring.mjs';

test('convert western time, capital month', () => {
    const probe = "JULI 02,2024 17:08";
    const expected = ["02-07-2024","17:08:00"];
    const [resultdate,resulttime] = getdatestring(probe);
    expect(resultdate).toBe(expected[0]);
    expect(resulttime).toBe(expected[1]);
});

test('convert western time', () => {
    const probe = "Juli 02,2024 17:08";
    const expected = ["02-07-2024","17:08:00"];
    const [resultdate,resulttime] = getdatestring(probe);
    expect(resultdate).toBe(expected[0]);
    expect(resulttime).toBe(expected[1]);
});

test('convert western time, tiny month', () => {
    const probe = "juli 02,2024 17:08";
    const expected = ["02-07-2024","17:08:00"];
    const [resultdate,resulttime] = getdatestring(probe);
    expect(resultdate).toBe(expected[0]);
    expect(resulttime).toBe(expected[1]);
});

test('convert western time, universal month', () => {
    const probe = "April 02,2024 17:08";
    const expected = ["02-04-2024","17:08:00"];
    const [resultdate,resulttime] = getdatestring(probe);
    expect(resultdate).toBe(expected[0]);
    expect(resulttime).toBe(expected[1]);
});

test('convert US time', () => {
    const probe = "April 6,2024 at 1:36 PM";
    const expected = ["06-04-2024","13:36:00"];
    const [resultdate,resulttime] = getdatestring(probe);
    expect(resultdate).toBe(expected[0]);
    expect(resulttime).toBe(expected[1]);
});
