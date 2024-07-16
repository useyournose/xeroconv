const get_ke = require('../js/get_ke');

test('300 m/s and 158grains become 460.73', () => {
    expect(get_ke(300,158)).toBe("460.73");
});