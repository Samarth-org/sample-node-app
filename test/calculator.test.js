const { add, subtract, multiply, divide } = require('../src/calculator');
describe('Calculator', () => {
    test('adds two numbers',           () => expect(add(2, 3)).toBe(5));
    test('subtracts two numbers',      () => expect(subtract(5, 3)).toBe(2));
    test('multiplies two numbers',     () => expect(multiply(4, 3)).toBe(12));
    test('divides two numbers',        () => expect(divide(10, 2)).toBe(5));
    test('throws on division by zero', () => expect(() => divide(5, 0)).toThrow('Division by zero'));
});