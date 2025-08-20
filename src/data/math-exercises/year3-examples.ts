import { MathExercise, MathConcept, MathQuestion } from '@/types'

// Year 3 数学练习数据 - 澳洲小学数学核心概念
export const year3MathExercises: MathExercise[] = [
  {
    id: 'math-year3-place-value-1',
    title: 'Place Value Adventures - Hundreds, Tens, Ones',
    description:
      'Understanding place value in three-digit numbers using Australian contexts',
    topic: 'place-value',
    yearLevel: 3,
    difficulty: 'foundation',
    timeLimit: 15,
    totalPoints: 100,
    requiredTools: ['place-value-chart', 'calculator'],
    learningObjectives: [
      'Understand the value of digits in hundreds, tens, and ones places',
      'Read and write three-digit numbers',
      'Compare three-digit numbers using place value',
    ],
    tags: ['numbers', 'place-value', 'australian-context'],
    conceptIntro: {
      id: 'place-value-concept-year3',
      topic: 'place-value',
      title: 'Understanding Place Value',
      explanation:
        'In our number system, the position of a digit tells us its value. In the number 345, the 3 is in the hundreds place (worth 300), the 4 is in the tens place (worth 40), and the 5 is in the ones place (worth 5).',
      examples: [
        {
          id: 'pv-example-1',
          description: 'Brisbane Population',
          problem:
            'Brisbane has about 2,500,000 people. What is the value of the 5?',
          solution:
            'The 5 is in the hundred thousands place, so its value is 500,000',
          steps: [
            {
              id: 'step1',
              stepNumber: 1,
              description: 'Identify the position of the digit 5',
              result: 'The 5 is in the hundred thousands place',
            },
            {
              id: 'step2',
              stepNumber: 2,
              description: 'Calculate the place value',
              calculation: '5 × 100,000 = 500,000',
              result: '500,000',
            },
          ],
        },
      ],
      keyTerms: [
        {
          term: 'Hundreds place',
          definition: 'The third digit from the right in a number',
        },
        {
          term: 'Tens place',
          definition: 'The second digit from the right in a number',
        },
        {
          term: 'Ones place',
          definition: 'The first digit from the right in a number',
        },
        {
          term: 'Place value',
          definition: 'The value of a digit based on its position in a number',
        },
      ],
      visualAids: [
        {
          id: 'place-value-chart',
          type: 'interactive',
          title: 'Place Value Chart',
          description:
            'Interactive chart showing hundreds, tens, and ones columns',
          interactiveData: {
            type: 'place-value-chart',
            columns: ['hundreds', 'tens', 'ones'],
          },
        },
      ],
      realWorldApplications: [
        'Counting money in dollars and cents',
        'Understanding addresses and phone numbers',
        'Reading scores in sports games',
        'Understanding distances between Australian cities',
      ],
    },
    questions: [
      {
        id: 'pv-q1',
        exerciseId: 'math-year3-place-value-1',
        type: 'multiple-choice',
        question: 'In the number 247, what is the value of the digit 4?',
        instructions:
          'Look at the position of the digit 4 and determine its place value.',
        problemData: {
          number: 247,
          targetDigit: 4,
          context: "Melbourne's tram routes",
        },
        correctAnswer: '40',
        possibleAnswers: ['4', '40', '400', '4000'],
        hints: [
          'The digit 4 is in the tens place',
          'In the tens place, each digit represents groups of ten',
        ],
        explanation:
          'The digit 4 is in the tens place, so its value is 4 × 10 = 40.',
        points: 20,
        order: 1,
        difficulty: 'foundation',
        estimatedTime: 2,
        requiredTools: ['place-value-chart'],
      },
      {
        id: 'pv-q2',
        exerciseId: 'math-year3-place-value-1',
        type: 'place-value-builder',
        question: 'Build the number 583 using the place value chart.',
        instructions:
          'Drag the correct digits to the hundreds, tens, and ones places.',
        problemData: {
          targetNumber: 583,
          availableDigits: [5, 8, 3, 1, 9, 2],
          context: 'Number of students at Sunshine Primary School',
        },
        correctAnswer: { hundreds: 5, tens: 8, ones: 3 },
        hints: [
          '583 means 5 hundreds, 8 tens, and 3 ones',
          'Start with the biggest place value first',
        ],
        explanation:
          '583 = 500 + 80 + 3, so we need 5 in hundreds, 8 in tens, and 3 in ones.',
        points: 25,
        order: 2,
        difficulty: 'developing',
        estimatedTime: 3,
        requiredTools: ['place-value-chart'],
      },
      {
        id: 'pv-q3',
        exerciseId: 'math-year3-place-value-1',
        type: 'input-answer',
        question: 'Write 600 + 70 + 9 as a single number.',
        instructions: 'Add the place values together to form one number.',
        problemData: {
          expandedForm: [600, 70, 9],
          context: 'Distance in kilometres from Sydney to Canberra',
        },
        correctAnswer: '679',
        tolerance: 0,
        hints: [
          'Add each place value: hundreds + tens + ones',
          '600 + 70 + 9 = ?',
        ],
        explanation:
          '600 + 70 + 9 = 679. This is how we write numbers in standard form.',
        points: 20,
        order: 3,
        difficulty: 'foundation',
        estimatedTime: 2,
        requiredTools: ['calculator'],
      },
      {
        id: 'pv-q4',
        exerciseId: 'math-year3-place-value-1',
        type: 'true-false',
        question: 'In the number 359, the digit 3 has a value of 30.',
        instructions: 'Think about what place the digit 3 is in.',
        problemData: {
          number: 359,
          statement: 'The digit 3 has a value of 30',
          context: 'Number of days in a year',
        },
        correctAnswer: false,
        hints: [
          'Look at which place the digit 3 is in',
          'The digit 3 is in the hundreds place, not the tens place',
        ],
        explanation:
          'False. The digit 3 is in the hundreds place, so its value is 300, not 30.',
        points: 15,
        order: 4,
        difficulty: 'foundation',
        estimatedTime: 2,
        requiredTools: ['place-value-chart'],
      },
      {
        id: 'pv-q5',
        exerciseId: 'math-year3-place-value-1',
        type: 'multiple-choice',
        question: 'Which number is greater: 234 or 243?',
        instructions:
          'Compare the numbers by looking at each place value from left to right.',
        problemData: {
          numbers: [234, 243],
          context: 'Points scored in two different cricket matches',
        },
        correctAnswer: '243',
        possibleAnswers: ['234', '243', 'They are equal', 'Cannot tell'],
        hints: [
          'Start comparing from the hundreds place',
          'If the hundreds are the same, look at the tens place',
        ],
        explanation:
          'Both numbers have 2 hundreds, but 243 has 4 tens while 234 has 3 tens, so 243 > 234.',
        points: 20,
        order: 5,
        difficulty: 'developing',
        estimatedTime: 3,
        requiredTools: ['place-value-chart'],
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },

  {
    id: 'math-year3-fractions-1',
    title: 'Pizza Party Fractions - Halves, Thirds, Quarters',
    description:
      'Understanding basic fractions through sharing and visual representations',
    topic: 'fractions',
    yearLevel: 3,
    difficulty: 'foundation',
    timeLimit: 20,
    totalPoints: 100,
    requiredTools: ['fraction-bar'],
    learningObjectives: [
      'Recognise and name unit fractions (1/2, 1/3, 1/4)',
      'Understand fractions as equal parts of a whole',
      'Compare simple fractions visually',
    ],
    tags: ['fractions', 'visual-learning', 'food-context'],
    conceptIntro: {
      id: 'fractions-concept-year3',
      topic: 'fractions',
      title: 'Understanding Fractions',
      explanation:
        'A fraction shows equal parts of a whole. When we share something fairly, we create fractions. 1/2 means 1 out of 2 equal parts.',
      examples: [
        {
          id: 'frac-example-1',
          description: 'Sharing a Pizza',
          problem:
            'Tom and Sarah share a pizza equally. What fraction does each person get?',
          solution: 'Each person gets 1/2 of the pizza',
          steps: [
            {
              id: 'step1',
              stepNumber: 1,
              description: 'Count the number of people sharing',
              result: '2 people',
            },
            {
              id: 'step2',
              stepNumber: 2,
              description: 'Divide the pizza into equal parts',
              result: '2 equal parts',
            },
            {
              id: 'step3',
              stepNumber: 3,
              description: 'Each person gets one part',
              result: '1 out of 2 parts = 1/2',
            },
          ],
        },
      ],
      keyTerms: [
        {
          term: 'Fraction',
          definition: 'A number that represents part of a whole',
        },
        {
          term: 'Numerator',
          definition: 'The top number in a fraction (how many parts we have)',
        },
        {
          term: 'Denominator',
          definition:
            'The bottom number in a fraction (how many equal parts in total)',
        },
        {
          term: 'Unit fraction',
          definition: 'A fraction with 1 as the numerator, like 1/2, 1/3, 1/4',
        },
      ],
      visualAids: [
        {
          id: 'fraction-circles',
          type: 'interactive',
          title: 'Fraction Circles',
          description: 'Interactive circles showing different fractions',
          interactiveData: {
            type: 'fraction-circles',
            fractions: ['1/2', '1/3', '1/4'],
          },
        },
      ],
      realWorldApplications: [
        'Sharing food equally at parties',
        'Dividing time (half an hour, quarter of an hour)',
        'Sharing money fairly',
        'Understanding sports scores and timing',
      ],
    },
    questions: [
      {
        id: 'frac-q1',
        exerciseId: 'math-year3-fractions-1',
        type: 'fraction-visual',
        question: 'Look at this chocolate bar. What fraction is shaded?',
        instructions: 'Count the shaded parts and the total parts.',
        problemData: {
          visualType: 'rectangle',
          totalParts: 4,
          shadedParts: 1,
          context: 'A chocolate bar divided into equal pieces',
        },
        correctAnswer: '1/4',
        possibleAnswers: ['1/2', '1/3', '1/4', '2/4'],
        hints: [
          'Count how many parts are shaded',
          'Count how many parts there are in total',
          'The fraction is shaded parts over total parts',
        ],
        explanation:
          'There is 1 shaded part out of 4 equal parts, so the fraction is 1/4.',
        points: 20,
        order: 1,
        difficulty: 'foundation',
        estimatedTime: 3,
        requiredTools: ['fraction-bar'],
      },
      {
        id: 'frac-q2',
        exerciseId: 'math-year3-fractions-1',
        type: 'drag-drop',
        question: 'Match each fraction to its correct visual representation.',
        instructions: 'Drag each fraction name to the matching picture.',
        problemData: {
          fractions: ['1/2', '1/3', '1/4'],
          visuals: [
            { id: 'half-circle', type: 'circle', shaded: 1, total: 2 },
            { id: 'third-rectangle', type: 'rectangle', shaded: 1, total: 3 },
            { id: 'quarter-square', type: 'square', shaded: 1, total: 4 },
          ],
          context: 'Different shapes showing fractions',
        },
        correctAnswer: {
          '1/2': 'half-circle',
          '1/3': 'third-rectangle',
          '1/4': 'quarter-square',
        },
        hints: [
          '1/2 means 1 out of 2 equal parts',
          '1/3 means 1 out of 3 equal parts',
          '1/4 means 1 out of 4 equal parts',
        ],
        explanation:
          'Each fraction matches the visual with the same number of total parts and one shaded part.',
        points: 30,
        order: 2,
        difficulty: 'developing',
        estimatedTime: 5,
        requiredTools: ['fraction-bar'],
      },
      {
        id: 'frac-q3',
        exerciseId: 'math-year3-fractions-1',
        type: 'multiple-choice',
        question:
          'Three friends share a cake equally. What fraction does each friend get?',
        instructions:
          'Think about how to divide one whole cake among three people.',
        problemData: {
          totalItems: 1,
          numberOfPeople: 3,
          context: 'Birthday cake sharing at a party',
        },
        correctAnswer: '1/3',
        possibleAnswers: ['1/2', '1/3', '3/1', '2/3'],
        hints: [
          'There are 3 friends sharing',
          'Each friend gets an equal part',
          'One cake divided by 3 friends = ?',
        ],
        explanation:
          'When 3 friends share 1 cake equally, each friend gets 1/3 of the cake.',
        points: 20,
        order: 3,
        difficulty: 'foundation',
        estimatedTime: 3,
        requiredTools: [],
      },
      {
        id: 'frac-q4',
        exerciseId: 'math-year3-fractions-1',
        type: 'true-false',
        question: '1/2 is bigger than 1/4.',
        instructions:
          'Think about which fraction represents a larger part of the same whole.',
        problemData: {
          fraction1: { numerator: 1, denominator: 2 },
          fraction2: { numerator: 1, denominator: 4 },
          context: 'Comparing pizza slices',
        },
        correctAnswer: true,
        hints: [
          'Imagine a pizza cut into 2 pieces vs 4 pieces',
          '1/2 means 1 out of 2 parts, 1/4 means 1 out of 4 parts',
          'Bigger pieces or smaller pieces?',
        ],
        explanation:
          'True. 1/2 (half) is larger than 1/4 (quarter). When you divide something into fewer parts, each part is bigger.',
        points: 15,
        order: 4,
        difficulty: 'developing',
        estimatedTime: 3,
        requiredTools: ['fraction-bar'],
      },
      {
        id: 'frac-q5',
        exerciseId: 'math-year3-fractions-1',
        type: 'drawing',
        question: 'Draw and shade 1/2 of this rectangle.',
        instructions:
          'Divide the rectangle into 2 equal parts and shade 1 part.',
        problemData: {
          shape: 'rectangle',
          targetFraction: { numerator: 1, denominator: 2 },
          width: 6,
          height: 3,
          context: 'Drawing fractions of shapes',
        },
        correctAnswer: {
          divisions: 2,
          shadedParts: 1,
          pattern: 'half',
        },
        hints: [
          'Divide the rectangle into 2 equal parts',
          'Shade exactly 1 of those parts',
          'Make sure both parts are the same size',
        ],
        explanation:
          'Divide the rectangle into 2 equal parts and shade 1 part. This shows 1/2.',
        points: 15,
        order: 5,
        difficulty: 'developing',
        estimatedTime: 4,
        requiredTools: ['shape-drawer'],
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },

  {
    id: 'math-year3-money-1',
    title: 'Australian Money - Dollars and Cents',
    description:
      'Working with Australian currency - counting, adding, and making change',
    topic: 'decimals',
    yearLevel: 3,
    difficulty: 'foundation',
    timeLimit: 25,
    totalPoints: 100,
    requiredTools: ['calculator'],
    learningObjectives: [
      'Recognise Australian coins and notes',
      'Count money using dollars and cents',
      'Add and subtract money amounts',
      'Solve simple money problems',
    ],
    tags: ['money', 'decimals', 'australian-currency', 'real-world'],
    conceptIntro: {
      id: 'money-concept-year3',
      topic: 'money',
      title: 'Australian Money',
      explanation:
        'Australia uses dollars and cents. 100 cents = $1. We write money amounts with a dollar sign and decimal point, like $3.50 (3 dollars and 50 cents).',
      examples: [
        {
          id: 'money-example-1',
          description: 'Counting Coins',
          problem:
            'You have 2 × $1 coins, 1 × 50c coin, and 3 × 10c coins. How much money do you have?',
          solution: '$2.80',
          steps: [
            {
              id: 'step1',
              stepNumber: 1,
              description: 'Count the $1 coins',
              calculation: '2 × $1 = $2.00',
              result: '$2.00',
            },
            {
              id: 'step2',
              stepNumber: 2,
              description: 'Add the 50c coin',
              calculation: '$2.00 + 50c = $2.50',
              result: '$2.50',
            },
            {
              id: 'step3',
              stepNumber: 3,
              description: 'Add the 10c coins',
              calculation: '$2.50 + 30c = $2.80',
              result: '$2.80',
            },
          ],
        },
      ],
      keyTerms: [
        {
          term: 'Dollar',
          definition: 'The main unit of Australian currency, written as $',
        },
        {
          term: 'Cent',
          definition: 'Smaller unit of Australian currency, 100 cents = $1',
        },
        {
          term: 'Decimal point',
          definition:
            'The dot that separates dollars from cents in money amounts',
        },
        {
          term: 'Change',
          definition:
            'Money given back when you pay more than the cost of an item',
        },
      ],
      visualAids: [
        {
          id: 'australian-money',
          type: 'interactive',
          title: 'Australian Coins and Notes',
          description: 'Interactive display of Australian currency',
          interactiveData: {
            type: 'money-display',
            currency: 'AUD',
            denominations: ['$1', '50c', '20c', '10c', '5c'],
          },
        },
      ],
      realWorldApplications: [
        'Buying snacks at the school canteen',
        'Saving pocket money in a piggy bank',
        'Going shopping with parents',
        'Understanding prices at the local shop',
      ],
    },
    questions: [
      {
        id: 'money-q1',
        exerciseId: 'math-year3-money-1',
        type: 'multiple-choice',
        question: 'How much is 1 × $1 coin + 2 × 50c coins + 1 × 20c coin?',
        instructions: 'Add up all the coin values.',
        problemData: {
          coins: [
            { denomination: 100, count: 1 }, // $1 = 100c
            { denomination: 50, count: 2 }, // 50c
            { denomination: 20, count: 1 }, // 20c
          ],
          context: 'Counting pocket money',
        },
        correctAnswer: '$2.20',
        possibleAnswers: ['$2.20', '$2.70', '$1.70', '$3.20'],
        unit: { name: 'Australian Dollar', symbol: '$', type: 'money' },
        hints: [
          '$1 coin = 100c',
          '2 × 50c = 100c',
          'Add all amounts: 100c + 100c + 20c = 220c = $2.20',
        ],
        explanation: '$1 + (2 × 50c) + 20c = 100c + 100c + 20c = 220c = $2.20',
        points: 25,
        order: 1,
        difficulty: 'foundation',
        estimatedTime: 4,
        requiredTools: ['calculator'],
      },
      {
        id: 'money-q2',
        exerciseId: 'math-year3-money-1',
        type: 'input-answer',
        question:
          'You buy a drink for $1.50 and pay with a $2 coin. How much change do you get?',
        instructions: 'Subtract the cost from the amount paid.',
        problemData: {
          itemCost: 1.5,
          amountPaid: 2.0,
          context: 'Buying a drink at the school canteen',
        },
        correctAnswer: '$0.50',
        tolerance: 0,
        unit: { name: 'Australian Dollar', symbol: '$', type: 'money' },
        hints: [
          'Change = Amount paid - Cost of item',
          '$2.00 - $1.50 = ?',
          'Think about what coins you would get as change',
        ],
        explanation:
          'Change = $2.00 - $1.50 = $0.50. You would get one 50c coin as change.',
        points: 20,
        order: 2,
        difficulty: 'developing',
        estimatedTime: 3,
        requiredTools: ['calculator'],
      },
      {
        id: 'money-q3',
        exerciseId: 'math-year3-money-1',
        type: 'drag-drop',
        question: 'Make exactly $3.75 using the fewest coins possible.',
        instructions:
          'Drag coins to make the target amount with the smallest number of coins.',
        problemData: {
          targetAmount: 3.75,
          availableCoins: [
            { denomination: 200, unlimited: true }, // $2
            { denomination: 100, unlimited: true }, // $1
            { denomination: 50, unlimited: true }, // 50c
            { denomination: 20, unlimited: true }, // 20c
            { denomination: 10, unlimited: true }, // 10c
            { denomination: 5, unlimited: true }, // 5c
          ],
          context: 'Paying for school lunch with exact change',
        },
        correctAnswer: [
          { denomination: 200, count: 1 }, // $2
          { denomination: 100, count: 1 }, // $1
          { denomination: 50, count: 1 }, // 50c
          { denomination: 20, count: 1 }, // 20c
          { denomination: 5, count: 1 }, // 5c
        ],
        hints: [
          'Start with the largest coins first',
          'Use $2 + $1 + 50c + 20c + 5c',
          'Check: $2.00 + $1.00 + 50c + 20c + 5c = $3.75',
        ],
        explanation:
          'The fewest coins: $2 + $1 + 50c + 20c + 5c = $3.75 (5 coins total)',
        points: 30,
        order: 3,
        difficulty: 'proficient',
        estimatedTime: 5,
        requiredTools: [],
      },
      {
        id: 'money-q4',
        exerciseId: 'math-year3-money-1',
        type: 'multiple-choice',
        question: 'Which amount is greater: $2.80 or $2.08?',
        instructions: 'Compare the dollar amounts and then the cent amounts.',
        problemData: {
          amount1: 2.8,
          amount2: 2.08,
          context: 'Comparing prices of two different snacks',
        },
        correctAnswer: '$2.80',
        possibleAnswers: ['$2.80', '$2.08', 'They are equal', 'Cannot tell'],
        hints: [
          'Both amounts have $2, so compare the cents',
          '80 cents vs 8 cents',
          'Which is bigger: 80c or 8c?',
        ],
        explanation:
          '$2.80 is greater than $2.08 because 80 cents is more than 8 cents (or 08 cents).',
        points: 15,
        order: 4,
        difficulty: 'foundation',
        estimatedTime: 2,
        requiredTools: [],
      },
      {
        id: 'money-q5',
        exerciseId: 'math-year3-money-1',
        type: 'calculation',
        question:
          'Sarah has $4.25. She buys a pencil for $1.20 and an eraser for $0.85. How much money does she have left?',
        instructions: 'Add the costs, then subtract from the total amount.',
        problemData: {
          startingAmount: 4.25,
          purchases: [
            { item: 'pencil', cost: 1.2 },
            { item: 'eraser', cost: 0.85 },
          ],
          context: 'Shopping for school supplies',
        },
        correctAnswer: '$2.20',
        tolerance: 0.01,
        unit: { name: 'Australian Dollar', symbol: '$', type: 'money' },
        hints: [
          'First, add the costs: $1.20 + $0.85',
          "Then subtract from Sarah's money: $4.25 - total cost",
          'Step by step: $4.25 - $2.05 = ?',
        ],
        explanation:
          'Total spent: $1.20 + $0.85 = $2.05. Money left: $4.25 - $2.05 = $2.20.',
        points: 10,
        order: 5,
        difficulty: 'developing',
        estimatedTime: 4,
        requiredTools: ['calculator'],
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
]
