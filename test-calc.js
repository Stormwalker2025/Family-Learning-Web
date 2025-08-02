// Test calculation function
function calculateAnswer(expression) {
    try {
        // Replace various multiplication and division symbols
        const cleanExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\\times/g, '*')
            .replace(/\\div/g, '/')
            .replace(/−/g, '-')  // Replace Unicode minus with ASCII minus
            .replace(/\s+/g, '');
            
        // Basic security check - only allow numbers and basic operators
        if (!/^[\d+\-*/().\s]+$/.test(cleanExpression)) {
            console.log('Invalid expression:', cleanExpression);
            return 'Invalid';
        }
            
        return eval(cleanExpression);
    } catch (error) {
        return 'Error: ' + error.message;
    }
}

// Test cases
const testCases = [
    '56 − 29',
    '24 + 18',
    '7 × 6',
    '42 ÷ 7'
];

console.log('Testing calculation function:');
testCases.forEach(expr => {
    const result = calculateAnswer(expr);
    console.log(`${expr} = ${result}`);
});