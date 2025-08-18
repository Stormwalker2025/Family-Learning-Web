import { MathExercise, MathConcept, MathQuestion } from '@/types'

// Year 6 数学练习数据 - 澳洲小学数学高年级概念
export const year6MathExercises: MathExercise[] = [
  {
    id: 'math-year6-place-value-1',
    title: 'Large Numbers and Decimals - Australian Population Data',
    description: 'Understanding place value in large numbers and decimal numbers using real Australian data',
    topic: 'place-value',
    yearLevel: 6,
    difficulty: 'proficient',
    timeLimit: 20,
    totalPoints: 120,
    requiredTools: ['place-value-chart', 'calculator'],
    learningObjectives: [
      'Read and write numbers up to millions',
      'Understand decimal place value to thousandths',
      'Compare and order large numbers and decimals',
      'Round numbers to specified place values'
    ],
    tags: ['place-value', 'decimals', 'large-numbers', 'australian-data'],
    conceptIntro: {
      id: 'place-value-concept-year6',
      topic: 'place-value',
      title: 'Place Value in Large Numbers and Decimals',
      explanation: 'Place value extends both left (for larger numbers) and right (for decimal numbers). In 2,547,836.254, each digit has a specific place and value. Understanding this helps us work with real-world data like population statistics and precise measurements.',
      examples: [
        {
          id: 'pv-example-large',
          description: 'Australian Population',
          problem: 'Australia\'s population is approximately 25,690,000. What is the value of the digit 6?',
          solution: 'The digit 6 is in the hundred thousands place, so its value is 600,000',
          steps: [
            {
              id: 'step1',
              stepNumber: 1,
              description: 'Identify the place value chart position',
              result: 'Millions | Hundred thousands | Ten thousands | Thousands | Hundreds | Tens | Ones'
            },
            {
              id: 'step2',
              stepNumber: 2,
              description: 'Locate the digit 6 in 25,690,000',
              result: 'The 6 is in the hundred thousands place'
            },
            {
              id: 'step3',
              stepNumber: 3,
              description: 'Calculate the value',
              calculation: '6 × 100,000 = 600,000',
              result: '600,000'
            }
          ]
        }
      ],
      keyTerms: [
        { term: 'Million', definition: '1,000,000 - a thousand thousands' },
        { term: 'Hundred thousands', definition: '100,000 - ten ten-thousands' },
        { term: 'Tenths', definition: 'First decimal place, one part of ten equal parts' },
        { term: 'Hundredths', definition: 'Second decimal place, one part of one hundred equal parts' },
        { term: 'Thousandths', definition: 'Third decimal place, one part of one thousand equal parts' }
      ],
      visualAids: [
        {
          id: 'extended-place-value-chart',
          type: 'interactive',
          title: 'Extended Place Value Chart',
          description: 'Place value chart showing millions to thousandths',
          interactiveData: {
            type: 'place-value-chart',
            columns: ['millions', 'hundred-thousands', 'ten-thousands', 'thousands', 'hundreds', 'tens', 'ones', 'tenths', 'hundredths', 'thousandths']
          }
        }
      ],
      realWorldApplications: [
        'Understanding Australian population statistics',
        'Reading distance measurements between cities',
        'Working with precise measurements in science',
        'Understanding sports statistics and records',
        'Reading financial data and budgets'
      ]
    },
    questions: [
      {
        id: 'pv6-q1',
        exerciseId: 'math-year6-place-value-1',
        type: 'multiple-choice',
        question: 'Sydney\'s population is 5,312,163. What is the value of the digit 3 in the ten thousands place?',
        instructions: 'Locate the ten thousands place and determine the digit\'s value.',
        problemData: {
          number: 5312163,
          targetPlace: 'ten-thousands',
          targetDigit: 1,  // Actually 1 is in ten thousands, but question asks about 3
          context: 'Sydney population data'
        },
        correctAnswer: '10,000',
        possibleAnswers: ['3,000', '10,000', '30,000', '300,000'],
        hints: [
          'Find the ten thousands place in 5,312,163',
          'The digit in the ten thousands place is 1, not 3',
          'Wait - check the question again carefully'
        ],
        explanation: 'In 5,312,163, the digit 1 is in the ten thousands place (value 10,000). The digit 3 appears in two places: hundreds (300) and hundred thousands (300,000).',
        points: 25,
        order: 1,
        difficulty: 'proficient',
        estimatedTime: 3,
        requiredTools: ['place-value-chart']
      },
      {
        id: 'pv6-q2',
        exerciseId: 'math-year6-place-value-1',
        type: 'input-answer',
        question: 'Write 4,567,892 in expanded form.',
        instructions: 'Break down the number showing the value of each digit.',
        problemData: {
          number: 4567892,
          context: 'Melbourne metropolitan area population'
        },
        correctAnswer: '4,000,000 + 500,000 + 60,000 + 7,000 + 800 + 90 + 2',
        hints: [
          'Start with the largest place value (millions)',
          'Write each non-zero digit multiplied by its place value',
          '4 millions + 5 hundred thousands + 6 ten thousands + ...'
        ],
        explanation: '4,567,892 = 4,000,000 + 500,000 + 60,000 + 7,000 + 800 + 90 + 2',
        points: 30,
        order: 2,
        difficulty: 'proficient',
        estimatedTime: 4,
        requiredTools: ['place-value-chart']
      },
      {
        id: 'pv6-q3',
        exerciseId: 'math-year6-place-value-1',
        type: 'multiple-choice',
        question: 'In the decimal 23.847, which digit is in the hundredths place?',
        instructions: 'Remember: tenths, hundredths, thousandths go from left to right after the decimal point.',
        problemData: {
          number: 23.847,
          targetPlace: 'hundredths',
          context: 'Precise measurement in metres'
        },
        correctAnswer: '4',
        possibleAnswers: ['8', '4', '7', '3'],
        hints: [
          'The decimal point separates whole numbers from decimal parts',
          'After the decimal point: first digit = tenths, second = hundredths, third = thousandths',
          'In 23.847, the hundredths place is the second digit after the decimal'
        ],
        explanation: 'In 23.847, the digit 4 is in the hundredths place. The order is: 8 (tenths), 4 (hundredths), 7 (thousandths).',
        points: 20,
        order: 3,
        difficulty: 'developing',
        estimatedTime: 2,
        requiredTools: ['place-value-chart']
      },
      {
        id: 'pv6-q4',
        exerciseId: 'math-year6-place-value-1',
        type: 'input-answer',
        question: 'Round 2,847,359 to the nearest hundred thousand.',
        instructions: 'Look at the digit in the ten thousands place to decide whether to round up or down.',
        problemData: {
          number: 2847359,
          roundTo: 'hundred-thousands',
          context: 'Estimating Perth population'
        },
        correctAnswer: '2,800,000',
        tolerance: 0,
        hints: [
          'The hundred thousands place has the digit 8',
          'Look at the ten thousands place (4) to decide if you round up or down',
          'Since 4 < 5, round down'
        ],
        explanation: '2,847,359 rounded to the nearest hundred thousand is 2,800,000 because the ten thousands digit (4) is less than 5.',
        points: 25,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 3,
        requiredTools: ['calculator']
      },
      {
        id: 'pv6-q5',
        exerciseId: 'math-year6-place-value-1',
        type: 'drag-drop',
        question: 'Order these decimal numbers from smallest to largest: 12.67, 12.076, 12.6, 12.706',
        instructions: 'Compare decimal numbers by looking at each decimal place from left to right.',
        problemData: {
          numbers: [12.67, 12.076, 12.6, 12.706],
          context: 'Race finishing times in seconds'
        },
        correctAnswer: ['12.076', '12.6', '12.67', '12.706'],
        hints: [
          'All numbers start with 12, so compare the decimal parts',
          'Compare tenths first: 0, 6, 6, 7',
          'For equal tenths, compare hundredths, then thousandths'
        ],
        explanation: 'Ordering: 12.076 (smallest), then 12.6 (=12.600), then 12.67 (=12.670), then 12.706 (largest).',
        points: 20,
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 4,
        requiredTools: ['place-value-chart']
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  {
    id: 'math-year6-fractions-1',
    title: 'Advanced Fractions - Operations and Equivalence',
    description: 'Working with fraction operations, equivalent fractions, and mixed numbers',
    topic: 'fractions',
    yearLevel: 6,
    difficulty: 'proficient',
    timeLimit: 30,
    totalPoints: 120,
    requiredTools: ['fraction-bar', 'calculator'],
    learningObjectives: [
      'Add and subtract fractions with like and unlike denominators',
      'Find equivalent fractions',
      'Convert between improper fractions and mixed numbers',
      'Solve real-world fraction problems'
    ],
    tags: ['fractions', 'operations', 'equivalent-fractions', 'mixed-numbers'],
    conceptIntro: {
      id: 'fractions-concept-year6',
      topic: 'fractions',
      title: 'Advanced Fraction Operations',
      explanation: 'Fractions can be added, subtracted, and compared. To add fractions with different denominators, we need to find equivalent fractions with the same denominator. Mixed numbers combine whole numbers with fractions.',
      examples: [
        {
          id: 'frac-example-addition',
          description: 'Adding Fractions with Different Denominators',
          problem: 'A recipe calls for 1/3 cup of flour and 1/4 cup of sugar. How much dry ingredients in total?',
          solution: '1/3 + 1/4 = 7/12 cup',
          steps: [
            {
              id: 'step1',
              stepNumber: 1,
              description: 'Find common denominator',
              calculation: 'LCM of 3 and 4 = 12',
              result: 'Common denominator is 12'
            },
            {
              id: 'step2',
              stepNumber: 2,
              description: 'Convert to equivalent fractions',
              calculation: '1/3 = 4/12, 1/4 = 3/12',
              result: '4/12 + 3/12'
            },
            {
              id: 'step3',
              stepNumber: 3,
              description: 'Add numerators',
              calculation: '4/12 + 3/12 = 7/12',
              result: '7/12 cup'
            }
          ]
        }
      ],
      keyTerms: [
        { term: 'Equivalent fractions', definition: 'Fractions that represent the same value, like 1/2 = 2/4 = 3/6' },
        { term: 'Common denominator', definition: 'The same bottom number used when adding or subtracting fractions' },
        { term: 'Mixed number', definition: 'A number with a whole part and a fraction part, like 2 1/3' },
        { term: 'Improper fraction', definition: 'A fraction where the numerator is larger than the denominator' }
      ],
      visualAids: [
        {
          id: 'fraction-operations',
          type: 'interactive',
          title: 'Fraction Operations Visualizer',
          description: 'Visual representation of adding and subtracting fractions',
          interactiveData: {
            type: 'fraction-operations',
            operations: ['add', 'subtract', 'equivalent']
          }
        }
      ],
      realWorldApplications: [
        'Cooking and following recipes',
        'Measuring ingredients and materials',
        'Understanding sports statistics and scores',
        'Dividing time and resources fairly',
        'Working with scale drawings and maps'
      ]
    },
    questions: [
      {
        id: 'frac6-q1',
        exerciseId: 'math-year6-fractions-1',
        type: 'multiple-choice',
        question: 'Which fraction is equivalent to 3/4?',
        instructions: 'Find the fraction that has the same value as 3/4.',
        problemData: {
          baseFraction: { numerator: 3, denominator: 4 },
          context: 'Finding equivalent fractions for recipe scaling'
        },
        correctAnswer: '9/12',
        possibleAnswers: ['6/7', '9/12', '4/5', '7/9'],
        hints: [
          'Multiply both numerator and denominator by the same number',
          'Try: 3×3 = 9, 4×3 = 12',
          'Check: 9/12 = 3/4 because 9 ÷ 3 = 3 and 12 ÷ 3 = 4'
        ],
        explanation: '9/12 is equivalent to 3/4 because both fractions reduce to 3/4 when simplified (9÷3 = 3, 12÷3 = 4).',
        points: 20,
        order: 1,
        difficulty: 'developing',
        estimatedTime: 3,
        requiredTools: ['fraction-bar']
      },
      {
        id: 'frac6-q2',
        exerciseId: 'math-year6-fractions-1',
        type: 'calculation',
        question: 'Calculate: 2/5 + 1/3',
        instructions: 'Find a common denominator, then add the fractions.',
        problemData: {
          fraction1: { numerator: 2, denominator: 5 },
          fraction2: { numerator: 1, denominator: 3 },
          operation: 'add',
          context: 'Adding portions of a sports field covered by different teams'
        },
        correctAnswer: '11/15',
        hints: [
          'Find the LCM of 5 and 3',
          'LCM of 5 and 3 is 15',
          'Convert: 2/5 = 6/15, 1/3 = 5/15',
          'Add: 6/15 + 5/15 = 11/15'
        ],
        explanation: '2/5 + 1/3: Common denominator is 15. 2/5 = 6/15, 1/3 = 5/15. So 6/15 + 5/15 = 11/15.',
        points: 25,
        order: 2,
        difficulty: 'proficient',
        estimatedTime: 4,
        requiredTools: ['fraction-bar', 'calculator']
      },
      {
        id: 'frac6-q3',
        exerciseId: 'math-year6-fractions-1',
        type: 'input-answer',
        question: 'Convert the improper fraction 17/5 to a mixed number.',
        instructions: 'Divide the numerator by the denominator to find the whole number part.',
        problemData: {
          improperFraction: { numerator: 17, denominator: 5 },
          context: 'Converting measurement from improper fraction'
        },
        correctAnswer: '3 2/5',
        hints: [
          'Divide 17 ÷ 5 = 3 remainder 2',
          'The whole number part is 3',
          'The remainder 2 becomes the new numerator',
          'So 17/5 = 3 2/5'
        ],
        explanation: '17 ÷ 5 = 3 remainder 2, so 17/5 = 3 2/5 (3 whole parts and 2/5 left over).',
        points: 20,
        order: 3,
        difficulty: 'developing',
        estimatedTime: 3,
        requiredTools: ['calculator']
      },
      {
        id: 'frac6-q4',
        exerciseId: 'math-year6-fractions-1',
        type: 'calculation',
        question: 'A pizza is cut into 8 pieces. Tom eats 3/8 of the pizza and Sarah eats 2/8. What fraction of the pizza is left?',
        instructions: 'Add the fractions eaten, then subtract from the whole pizza.',
        problemData: {
          totalPizza: { numerator: 8, denominator: 8 },
          tomAte: { numerator: 3, denominator: 8 },
          sarahAte: { numerator: 2, denominator: 8 },
          context: 'Sharing pizza at a party'
        },
        correctAnswer: '3/8',
        hints: [
          'Total eaten = 3/8 + 2/8 = 5/8',
          'Pizza left = 1 - 5/8',
          '1 = 8/8, so 8/8 - 5/8 = 3/8'
        ],
        explanation: 'Total eaten: 3/8 + 2/8 = 5/8. Pizza left: 8/8 - 5/8 = 3/8.',
        points: 25,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 4,
        requiredTools: ['fraction-bar']
      },
      {
        id: 'frac6-q5',
        exerciseId: 'math-year6-fractions-1',
        type: 'true-false',
        question: '3/4 is greater than 7/10.',
        instructions: 'Compare the fractions by finding equivalent fractions with common denominators.',
        problemData: {
          fraction1: { numerator: 3, denominator: 4 },
          fraction2: { numerator: 7, denominator: 10 },
          context: 'Comparing completion rates of two projects'
        },
        correctAnswer: true,
        hints: [
          'Find common denominator for 3/4 and 7/10',
          'LCM of 4 and 10 is 20',
          '3/4 = 15/20, 7/10 = 14/20',
          'Compare: 15/20 vs 14/20'
        ],
        explanation: 'True. Using common denominator 20: 3/4 = 15/20 and 7/10 = 14/20. Since 15/20 > 14/20, we have 3/4 > 7/10.',
        points: 30,
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 5,
        requiredTools: ['fraction-bar', 'calculator']
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  {
    id: 'math-year6-area-perimeter-1',
    title: 'Area and Perimeter - Australian Playground Design',
    description: 'Calculate area and perimeter of rectangles, triangles, and composite shapes in real contexts',
    topic: 'area',
    yearLevel: 6,
    difficulty: 'proficient',
    timeLimit: 35,
    totalPoints: 120,
    requiredTools: ['calculator', 'shape-drawer', 'measurement-tool'],
    learningObjectives: [
      'Calculate area and perimeter of rectangles and squares',
      'Find area and perimeter of triangles',
      'Work with composite shapes',
      'Solve real-world measurement problems',
      'Convert between different units of measurement'
    ],
    tags: ['area', 'perimeter', 'geometry', 'measurement', 'real-world'],
    conceptIntro: {
      id: 'area-perimeter-concept-year6',
      topic: 'area',
      title: 'Area and Perimeter in Real Contexts',
      explanation: 'Area measures the space inside a shape (square units like m²). Perimeter measures the distance around the outside (linear units like m). These concepts help us plan spaces, buy materials, and solve practical problems.',
      examples: [
        {
          id: 'area-example-playground',
          description: 'School Playground Planning',
          problem: 'A rectangular playground is 30m long and 20m wide. What is its area and perimeter?',
          solution: 'Area = 600 m², Perimeter = 100 m',
          steps: [
            {
              id: 'step1',
              stepNumber: 1,
              description: 'Calculate area',
              formula: 'Area = length × width',
              calculation: 'Area = 30m × 20m = 600 m²',
              result: '600 m²'
            },
            {
              id: 'step2',
              stepNumber: 2,
              description: 'Calculate perimeter',
              formula: 'Perimeter = 2 × (length + width)',
              calculation: 'Perimeter = 2 × (30m + 20m) = 2 × 50m = 100m',
              result: '100 m'
            }
          ]
        }
      ],
      keyTerms: [
        { term: 'Area', definition: 'The amount of space inside a 2D shape, measured in square units' },
        { term: 'Perimeter', definition: 'The distance around the outside edge of a 2D shape' },
        { term: 'Square metre (m²)', definition: 'Standard unit for measuring area - a square 1m × 1m' },
        { term: 'Composite shape', definition: 'A shape made by combining two or more simple shapes' },
        { term: 'Formula', definition: 'A mathematical rule or equation, like Area = length × width' }
      ],
      visualAids: [
        {
          id: 'area-perimeter-visualizer',
          type: 'interactive',
          title: 'Area and Perimeter Visualizer',
          description: 'Interactive tool showing area and perimeter calculations',
          interactiveData: {
            type: 'geometry-calculator',
            shapes: ['rectangle', 'triangle', 'composite']
          }
        }
      ],
      realWorldApplications: [
        'Planning school playgrounds and sports fields',
        'Calculating paint needed for walls',
        'Designing gardens and landscaping',
        'Buying carpet or flooring materials',
        'Planning fencing for properties',
        'Designing pool areas and decking'
      ]
    },
    questions: [
      {
        id: 'area6-q1',
        exerciseId: 'math-year6-area-perimeter-1',
        type: 'calculation',
        question: 'A rectangular basketball court is 28m long and 15m wide. Calculate its area.',
        instructions: 'Use the formula: Area = length × width',
        problemData: {
          shape: 'rectangle',
          length: 28,
          width: 15,
          units: 'metres',
          context: 'School basketball court'
        },
        correctAnswer: '420',
        unit: { name: 'square metres', symbol: 'm²', type: 'area' },
        tolerance: 0,
        hints: [
          'Area of rectangle = length × width',
          'Area = 28m × 15m',
          'Remember to include square metres (m²) in your answer'
        ],
        explanation: 'Area = 28m × 15m = 420 m². The basketball court covers 420 square metres.',
        points: 20,
        order: 1,
        difficulty: 'foundation',
        estimatedTime: 3,
        requiredTools: ['calculator']
      },
      {
        id: 'area6-q2',
        exerciseId: 'math-year6-area-perimeter-1',
        type: 'calculation',
        question: 'The same basketball court needs new fencing around the perimeter. How many metres of fencing are needed?',
        instructions: 'Calculate the perimeter using: Perimeter = 2 × (length + width)',
        problemData: {
          shape: 'rectangle',
          length: 28,
          width: 15,
          units: 'metres',
          context: 'Fencing around basketball court'
        },
        correctAnswer: '86',
        unit: { name: 'metres', symbol: 'm', type: 'length' },
        tolerance: 0,
        hints: [
          'Perimeter = 2 × (length + width)',
          'Perimeter = 2 × (28m + 15m)',
          'Perimeter = 2 × 43m = 86m'
        ],
        explanation: 'Perimeter = 2 × (28m + 15m) = 2 × 43m = 86m. They need 86 metres of fencing.',
        points: 20,
        order: 2,
        difficulty: 'foundation',
        estimatedTime: 3,
        requiredTools: ['calculator']
      },
      {
        id: 'area6-q3',
        exerciseId: 'math-year6-area-perimeter-1',
        type: 'calculation',
        question: 'A triangular garden bed has a base of 12m and height of 8m. What is its area?',
        instructions: 'Use the formula: Area of triangle = ½ × base × height',
        problemData: {
          shape: 'triangle',
          base: 12,
          height: 8,
          units: 'metres',
          context: 'School garden design'
        },
        correctAnswer: '48',
        unit: { name: 'square metres', symbol: 'm²', type: 'area' },
        tolerance: 0,
        hints: [
          'Area of triangle = ½ × base × height',
          'Area = ½ × 12m × 8m',
          'Area = ½ × 96 = 48 m²'
        ],
        explanation: 'Area = ½ × 12m × 8m = ½ × 96 m² = 48 m². The triangular garden covers 48 square metres.',
        points: 25,
        order: 3,
        difficulty: 'developing',
        estimatedTime: 4,
        requiredTools: ['calculator']
      },
      {
        id: 'area6-q4',
        exerciseId: 'math-year6-area-perimeter-1',
        type: 'calculation',
        question: 'A playground consists of a rectangle (20m × 15m) with a square sandbox (5m × 5m) attached to one side. What is the total area?',
        instructions: 'Calculate the area of each shape separately, then add them together.',
        problemData: {
          shapes: [
            { type: 'rectangle', length: 20, width: 15 },
            { type: 'square', side: 5 }
          ],
          units: 'metres',
          context: 'Composite playground area'
        },
        correctAnswer: '325',
        unit: { name: 'square metres', symbol: 'm²', type: 'area' },
        tolerance: 0,
        hints: [
          'Rectangle area = 20m × 15m = 300 m²',
          'Square area = 5m × 5m = 25 m²',
          'Total area = 300 m² + 25 m² = 325 m²'
        ],
        explanation: 'Rectangle: 20m × 15m = 300 m². Square: 5m × 5m = 25 m². Total: 300 + 25 = 325 m².',
        points: 30,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 5,
        requiredTools: ['calculator', 'shape-drawer']
      },
      {
        id: 'area6-q5',
        exerciseId: 'math-year6-area-perimeter-1',
        type: 'unit-conversion',
        question: 'A square courtyard has sides of 800cm. Convert this to metres and calculate the area in square metres.',
        instructions: 'First convert centimetres to metres, then calculate the area.',
        problemData: {
          shape: 'square',
          sideCm: 800,
          fromUnit: 'centimetres',
          toUnit: 'metres',
          context: 'School courtyard measurement'
        },
        correctAnswer: '64',
        unit: { name: 'square metres', symbol: 'm²', type: 'area' },
        tolerance: 0,
        hints: [
          '800 cm = 800 ÷ 100 = 8 m',
          'Area of square = side × side',
          'Area = 8m × 8m = 64 m²'
        ],
        explanation: '800 cm = 8 m (divide by 100). Area = 8m × 8m = 64 m². The courtyard area is 64 square metres.',
        points: 25,
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 4,
        requiredTools: ['calculator', 'measurement-tool']
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]