import {expect, test, afterEach} from 'bun:test';
import { Unit_System, Unit_Velocity  } from './_types'

test('metric unit', () => {
    expect(Unit_System[0]).toBe('metric');
});

test('imperial unit', () => {
    expect(Unit_System[1]).toBe('imperial');
});

test('imperial velocity', () => {
    expect(Unit_Velocity.imperial).toBe('fps')
})
test('imperial velocity from system', () => {
    expect(Unit_Velocity[Unit_System[1] as keyof typeof Unit_Velocity]).toBe('fps')
})

test('metric velocity', () => {
    expect(Unit_Velocity[Unit_System[0] as keyof typeof Unit_Velocity]).toBe('m/s')
})