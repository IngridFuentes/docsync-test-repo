/**
 * Simple Calculator API
 */

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
    return a + b;
}

/**
 * Multiplies two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
function multiply(a, b) {
    return a * b;
}

/**
 * Divides two numbers
 * @param {number} a - Numerator
 * @param {number} b - Denominator
 * @returns {number} Result of division
 */
function divide(a, b) {
    if (b === 0) throw new Error('Cannot divide by zero');
    return a / b;
}

module.exports = { add, multiply, divide };