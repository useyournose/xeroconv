import get_ke from '../js/get_ke.mjs';

test('300 m/s and 158grains become 460.73', () => {
    expect(get_ke(300,158)).toBe("460.73");
});