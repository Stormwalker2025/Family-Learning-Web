import { ReadingExercise } from '@/types'

export const year3ReadingExercises: ReadingExercise[] = [
  {
    id: 'year3-animals-1',
    title: 'Amazing Australian Animals',
    description: 'Learn about unique animals found in Australia',
    article: {
      id: 'article-year3-1',
      title: 'Amazing Australian Animals',
      content: `Australia is home to many unique animals that cannot be found anywhere else in the world. The kangaroo is perhaps the most famous Australian animal. These marsupials can hop at speeds of up to 60 kilometres per hour!

Another fascinating animal is the koala. Despite what many people think, koalas are not bears. They are marsupials, just like kangaroos. Koalas spend most of their time sleeping in eucalyptus trees and eat only eucalyptus leaves.

The platypus is one of the strangest animals on Earth. It has a bill like a duck, a tail like a beaver, and it lays eggs even though it's a mammal. When European scientists first saw a platypus, they thought it was fake!

Wombats are another unique Australian animal. They are excellent diggers and live in burrows underground. Their poo is cube-shaped, which helps prevent it from rolling away from their territory.`,
      wordCount: 145,
      readingTime: 3,
      yearLevel: 3,
      difficulty: 'easy',
      topic: 'animals',
      vocabulary: ['marsupials', 'unique', 'eucalyptus', 'territory', 'burrows'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    questions: [
      {
        id: 'q1-year3-1',
        articleId: 'article-year3-1',
        type: 'multiple-choice',
        question: 'How fast can kangaroos hop?',
        options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
        correctAnswer: '60 km/h',
        explanation: 'The text states that kangaroos can hop at speeds of up to 60 kilometres per hour.',
        points: 1,
        order: 1,
        difficulty: 'easy'
      },
      {
        id: 'q2-year3-1',
        articleId: 'article-year3-1',
        type: 'true-false',
        question: 'Koalas are a type of bear.',
        correctAnswer: 'false',
        explanation: 'The text clearly states that koalas are not bears, they are marsupials.',
        points: 1,
        order: 2,
        difficulty: 'easy'
      },
      {
        id: 'q3-year3-1',
        articleId: 'article-year3-1',
        type: 'short-answer',
        question: 'What do koalas eat?',
        correctAnswer: 'eucalyptus leaves',
        explanation: 'According to the text, koalas eat only eucalyptus leaves.',
        points: 1,
        order: 3,
        difficulty: 'easy'
      },
      {
        id: 'q4-year3-1',
        articleId: 'article-year3-1',
        type: 'sentence-completion',
        question: 'The platypus has a bill like a _____, a tail like a _____, and it _____ eggs.',
        correctAnswer: 'duck, beaver, lays',
        explanation: 'These are the three characteristics mentioned in the text about the platypus.',
        points: 2,
        order: 4,
        difficulty: 'medium'
      }
    ],
    yearLevel: 3,
    totalPoints: 5,
    timeLimit: 15,
    tags: ['animals', 'australia', 'nature'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  {
    id: 'year3-family-2',
    title: 'My Australian Family',
    description: 'Read about a typical Australian family',
    article: {
      id: 'article-year3-2',
      title: 'My Australian Family',
      content: `Hi! My name is Emma and I live in Brisbane with my family. Brisbane is a big city in Queensland, Australia. Our house has a large backyard where we like to have barbecues on weekends.

My mum works as a teacher at the local primary school. She teaches Year 2 students and loves her job. My dad is a park ranger who takes care of the national parks around Brisbane. He knows lots about Australian wildlife.

I have a younger brother named Jack who is 6 years old. He loves playing cricket in our backyard. We also have a pet dog called Blue, who is an Australian Cattle Dog. Blue loves to chase balls and swim in the pool.

On Sundays, our family often goes to the beach at the Gold Coast. It takes about an hour to drive there from Brisbane. We build sandcastles, swim in the ocean, and sometimes we see dolphins!`,
      wordCount: 158,
      readingTime: 3,
      yearLevel: 3,
      difficulty: 'easy',
      topic: 'family',
      vocabulary: ['barbecues', 'primary school', 'national parks', 'wildlife', 'sandcastles'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    questions: [
      {
        id: 'q1-year3-2',
        articleId: 'article-year3-2',
        type: 'multiple-choice',
        question: 'Where does Emma live?',
        options: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
        correctAnswer: 'Brisbane',
        explanation: 'Emma clearly states that she lives in Brisbane with her family.',
        points: 1,
        order: 1,
        difficulty: 'easy'
      },
      {
        id: 'q2-year3-2',
        articleId: 'article-year3-2',
        type: 'short-answer',
        question: 'What is Emma\'s mum\'s job?',
        correctAnswer: 'teacher',
        explanation: 'The text states that Emma\'s mum works as a teacher at the local primary school.',
        points: 1,
        order: 2,
        difficulty: 'easy'
      },
      {
        id: 'q3-year3-2',
        articleId: 'article-year3-2',
        type: 'true-false',
        question: 'Jack is older than Emma.',
        correctAnswer: 'false',
        explanation: 'The text says Jack is Emma\'s younger brother, so he is not older than Emma.',
        points: 1,
        order: 3,
        difficulty: 'easy'
      },
      {
        id: 'q4-year3-2',
        articleId: 'article-year3-2',
        type: 'multiple-choice',
        question: 'How long does it take to drive from Brisbane to the Gold Coast?',
        options: ['30 minutes', '45 minutes', '1 hour', '2 hours'],
        correctAnswer: '1 hour',
        explanation: 'The text mentions it takes about an hour to drive to the Gold Coast from Brisbane.',
        points: 1,
        order: 4,
        difficulty: 'easy'
      }
    ],
    yearLevel: 3,
    totalPoints: 4,
    timeLimit: 12,
    tags: ['family', 'australia', 'brisbane', 'daily-life'],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'year3-school-3',
    title: 'My School Day',
    description: 'Learn about a day at an Australian primary school',
    article: {
      id: 'article-year3-3',
      title: 'My School Day',
      content: `My name is Tom and I go to Sunshine Primary School in Melbourne. Our school day starts at 9:00 AM and finishes at 3:30 PM. I take the school bus to get there because my house is too far to walk.

In the morning, we have literacy time where we practice reading and writing. My favourite subject is maths because I love solving number problems. We also have art class twice a week, and I enjoy painting pictures of Australian animals.

At 11:00 AM, we have morning tea break. I usually eat an apple and drink some water. Then we play in the playground until the bell rings. My friends and I love playing on the monkey bars and the slide.

After lunch, we often have PE (Physical Education) or science lessons. In science, we are learning about plants and how they grow. We planted some seeds in little pots and we water them every day to watch them grow.

The best part of my day is when my mum picks me up from school. She always asks me what I learned, and I tell her about all the fun activities we did.`,
      wordCount: 188,
      readingTime: 4,
      yearLevel: 3,
      difficulty: 'easy',
      topic: 'school',
      vocabulary: ['literacy', 'monkey bars', 'Physical Education', 'planted', 'activities'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    questions: [
      {
        id: 'q1-year3-3',
        articleId: 'article-year3-3',
        type: 'multiple-choice',
        question: 'What time does Tom\'s school day start?',
        options: ['8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM'],
        correctAnswer: '9:00 AM',
        explanation: 'The text clearly states that the school day starts at 9:00 AM.',
        points: 1,
        order: 1,
        difficulty: 'easy'
      },
      {
        id: 'q2-year3-3',
        articleId: 'article-year3-3',
        type: 'short-answer',
        question: 'What is Tom\'s favourite subject?',
        correctAnswer: 'maths',
        explanation: 'Tom states that his favourite subject is maths because he loves solving number problems.',
        points: 1,
        order: 2,
        difficulty: 'easy'
      },
      {
        id: 'q3-year3-3',
        articleId: 'article-year3-3',
        type: 'true-false',
        question: 'Tom walks to school every day.',
        correctAnswer: 'false',
        explanation: 'The text says Tom takes the school bus because his house is too far to walk.',
        points: 1,
        order: 3,
        difficulty: 'easy'
      },
      {
        id: 'q4-year3-3',
        articleId: 'article-year3-3',
        type: 'sentence-completion',
        question: 'In science class, the students planted _____ in little _____ and water them every day.',
        correctAnswer: 'seeds, pots',
        explanation: 'The text mentions they planted seeds in little pots and water them every day.',
        points: 2,
        order: 4,
        difficulty: 'medium'
      }
    ],
    yearLevel: 3,
    totalPoints: 5,
    timeLimit: 15,
    tags: ['school', 'education', 'daily-life', 'melbourne'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]