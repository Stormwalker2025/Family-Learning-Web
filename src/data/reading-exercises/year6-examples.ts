import { ReadingExercise } from '@/types'

export const year6ReadingExercises: ReadingExercise[] = [
  {
    id: 'year6-history-1',
    title: 'The First Australians',
    description: 'Learn about Aboriginal and Torres Strait Islander peoples',
    article: {
      id: 'article-year6-1',
      title: 'The First Australians',
      content: `Aboriginal and Torres Strait Islander peoples are the first inhabitants of Australia, having lived on this continent for over 65,000 years. Their rich cultures and traditions are among the oldest continuing cultures in the world.

Before European settlement in 1788, there were hundreds of different Aboriginal groups across Australia, each with their own languages, customs, and territories. The Torres Strait Islander peoples lived on the islands between mainland Australia and Papua New Guinea. Together, these groups had sophisticated systems of land management, including controlled burning practices that helped prevent bushfires.

The Dreamtime, or Dreaming, is central to Aboriginal spirituality. It refers to the time when ancestral spirits travelled across the land, creating mountains, rivers, plants, and animals. These stories are passed down through generations and help explain the natural world and moral codes.

Traditional Aboriginal art includes rock paintings, some of which are over 40,000 years old, making them among the world's oldest art forms. The use of natural ochres and pigments created vibrant images that told stories of the Dreamtime, recorded important events, and mapped the landscape.

Today, Aboriginal and Torres Strait Islander peoples continue to maintain their cultural practices while also contributing significantly to modern Australian society in areas such as art, sport, politics, and environmental conservation.`,
      wordCount: 201,
      readingTime: 5,
      yearLevel: 6,
      difficulty: 'medium',
      topic: 'history',
      vocabulary: [
        'inhabitants',
        'sophisticated',
        'ancestral',
        'ochres',
        'pigments',
        'conservation',
      ],
      source: 'Adapted from Australian Curriculum resources',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    questions: [
      {
        id: 'q1-year6-1',
        articleId: 'article-year6-1',
        type: 'multiple-choice',
        question:
          'How long have Aboriginal and Torres Strait Islander peoples lived in Australia?',
        options: [
          'Over 40,000 years',
          'Over 50,000 years',
          'Over 65,000 years',
          'Over 70,000 years',
        ],
        correctAnswer: 'Over 65,000 years',
        explanation:
          'The text states that Aboriginal and Torres Strait Islander peoples have lived on this continent for over 65,000 years.',
        points: 1,
        order: 1,
        difficulty: 'easy',
      },
      {
        id: 'q2-year6-1',
        articleId: 'article-year6-1',
        type: 'true-false',
        question:
          'All Aboriginal groups had the same language and customs before European settlement.',
        correctAnswer: 'false',
        explanation:
          'The text clearly states there were hundreds of different Aboriginal groups, each with their own languages, customs, and territories.',
        points: 1,
        order: 2,
        difficulty: 'medium',
      },
      {
        id: 'q3-year6-1',
        articleId: 'article-year6-1',
        type: 'short-answer',
        question:
          'What is the Dreamtime and why is it important to Aboriginal culture?',
        instructions:
          'Write 2-3 sentences explaining the Dreamtime and its significance.',
        correctAnswer:
          'The Dreamtime refers to the time when ancestral spirits travelled across the land, creating natural features. It is central to Aboriginal spirituality and helps explain the natural world and moral codes through stories passed down through generations.',
        explanation:
          'A good answer should mention both what the Dreamtime is (ancestral spirits creating the land) and its cultural importance (spirituality, explaining the world, moral guidance).',
        points: 3,
        order: 3,
        difficulty: 'hard',
      },
      {
        id: 'q4-year6-1',
        articleId: 'article-year6-1',
        type: 'sentence-completion',
        question:
          'Traditional Aboriginal art includes _____ paintings, some of which are over _____ years old, using natural _____ and _____.',
        correctAnswer: 'rock, 40,000, ochres, pigments',
        explanation:
          'The text mentions rock paintings over 40,000 years old, created using natural ochres and pigments.',
        points: 2,
        order: 4,
        difficulty: 'medium',
      },
      {
        id: 'q5-year6-1',
        articleId: 'article-year6-1',
        type: 'matching',
        question: 'Match each concept with its correct description:',
        matchingOptions: [
          {
            id: 'statement1',
            content: 'Controlled burning practices',
            type: 'statement',
          },
          {
            id: 'statement2',
            content: 'Torres Strait Islander peoples',
            type: 'statement',
          },
          {
            id: 'statement3',
            content: 'Natural ochres and pigments',
            type: 'statement',
          },
          {
            id: 'option1',
            content: 'Used to create traditional Aboriginal art',
            type: 'option',
          },
          {
            id: 'option2',
            content: 'Lived on islands between Australia and Papua New Guinea',
            type: 'option',
          },
          {
            id: 'option3',
            content: 'Helped prevent bushfires as part of land management',
            type: 'option',
          },
        ],
        correctAnswer:
          '{"statement1":"option3","statement2":"option2","statement3":"option1"}',
        explanation:
          'Each statement matches with its corresponding description based on the information in the text.',
        points: 3,
        order: 5,
        difficulty: 'medium',
      },
    ],
    yearLevel: 6,
    totalPoints: 10,
    timeLimit: 25,
    tags: [
      'history',
      'aboriginal',
      'torres-strait-islander',
      'culture',
      'australia',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 'year6-environment-2',
    title: 'Protecting the Great Barrier Reef',
    description:
      "Learn about Australia's most famous coral reef and conservation efforts",
    article: {
      id: 'article-year6-2',
      title: 'Protecting the Great Barrier Reef',
      content: `The Great Barrier Reef, located off the coast of Queensland, is the world's largest coral reef system. Stretching over 2,300 kilometres, it is so massive that it can be seen from space. This natural wonder is home to thousands of species of fish, corals, molluscs, and other marine life.

The reef was formed over millions of years by tiny coral polyps. These small creatures build calcium carbonate skeletons that, over time, create the large reef structures we see today. The reef supports not only marine biodiversity but also provides livelihoods for thousands of Australians through tourism and fishing industries.

However, the Great Barrier Reef faces serious threats. Climate change is causing ocean temperatures to rise, leading to coral bleaching events where corals lose their vibrant colours and may die. Water pollution from agricultural runoff introduces harmful chemicals and nutrients that can damage coral health. Additionally, the crown-of-thorns starfish, a natural predator of coral, sometimes appears in large numbers and causes significant damage.

Scientists and conservationists are working hard to protect this UNESCO World Heritage site. They monitor water quality, conduct research into coral resilience, and work with farmers to reduce agricultural runoff. Marine parks have been established to limit fishing and boating activities in sensitive areas.

Tourism also plays a crucial role in conservation. Many tour operators follow strict environmental guidelines and educate visitors about reef protection. Revenue from eco-tourism helps fund conservation programs and provides economic incentives for local communities to protect the reef.`,
      wordCount: 250,
      readingTime: 6,
      yearLevel: 6,
      difficulty: 'medium',
      topic: 'environment',
      vocabulary: [
        'biodiversity',
        'calcium carbonate',
        'coral bleaching',
        'resilience',
        'agricultural runoff',
        'eco-tourism',
      ],
      source: 'Great Barrier Reef Marine Park Authority',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    questions: [
      {
        id: 'q1-year6-2',
        articleId: 'article-year6-2',
        type: 'multiple-choice',
        question: 'How long is the Great Barrier Reef?',
        options: [
          'Over 1,300 kilometres',
          'Over 2,300 kilometres',
          'Over 3,300 kilometres',
          'Over 4,300 kilometres',
        ],
        correctAnswer: 'Over 2,300 kilometres',
        explanation:
          'The text states that the reef stretches over 2,300 kilometres.',
        points: 1,
        order: 1,
        difficulty: 'easy',
      },
      {
        id: 'q2-year6-2',
        articleId: 'article-year6-2',
        type: 'true-false',
        question:
          'The Great Barrier Reef was formed quickly over just a few thousand years.',
        correctAnswer: 'false',
        explanation:
          'The text states that the reef was formed over millions of years, not just a few thousand.',
        points: 1,
        order: 2,
        difficulty: 'easy',
      },
      {
        id: 'q3-year6-2',
        articleId: 'article-year6-2',
        type: 'short-answer',
        question:
          'List three major threats to the Great Barrier Reef mentioned in the article.',
        instructions: 'Identify three specific threats discussed in the text.',
        correctAnswer:
          'Climate change/coral bleaching, water pollution/agricultural runoff, crown-of-thorns starfish',
        explanation:
          'The three main threats mentioned are climate change causing coral bleaching, water pollution from agricultural runoff, and crown-of-thorns starfish outbreaks.',
        points: 3,
        order: 3,
        difficulty: 'medium',
      },
      {
        id: 'q4-year6-2',
        articleId: 'article-year6-2',
        type: 'true-false',
        question:
          'Tourism always has a negative impact on the Great Barrier Reef.',
        correctAnswer: 'false',
        explanation:
          'The text explains that tourism can play a crucial role in conservation through eco-tourism, environmental guidelines, and funding conservation programs.',
        points: 1,
        order: 4,
        difficulty: 'medium',
      },
      {
        id: 'q5-year6-2',
        articleId: 'article-year6-2',
        type: 'sentence-completion',
        question:
          'The reef is formed by tiny _____ that build _____ skeletons over millions of years.',
        correctAnswer: 'coral polyps, calcium carbonate',
        explanation:
          'The text explains that coral polyps build calcium carbonate skeletons that form the reef structures.',
        points: 2,
        order: 5,
        difficulty: 'medium',
      },
    ],
    yearLevel: 6,
    totalPoints: 8,
    timeLimit: 20,
    tags: [
      'environment',
      'conservation',
      'great-barrier-reef',
      'queensland',
      'marine-life',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 'year6-science-3',
    title: 'Renewable Energy in Australia',
    description: 'Discover how Australia is using renewable energy sources',
    article: {
      id: 'article-year6-3',
      title: 'Renewable Energy in Australia',
      content: `Australia is increasingly turning to renewable energy sources to meet its electricity needs and reduce greenhouse gas emissions. The country's vast landscape and climate conditions make it ideal for generating clean energy from natural sources.

Solar power is one of Australia's most promising renewable energy sources. With over 300 sunny days per year in many regions, Australia receives more solar radiation than almost any other country. Large solar farms with thousands of photovoltaic panels are being built across the continent, while rooftop solar installations on homes and businesses continue to grow rapidly.

Wind energy is another significant contributor to Australia's renewable energy mix. Wind farms are strategically located in areas with consistent wind patterns, such as coastal regions and elevated areas. Modern wind turbines can generate electricity even in moderate wind conditions, making them increasingly efficient.

Hydroelectric power has been used in Australia for over a century. The Snowy Mountains Scheme, completed in the 1970s, remains one of the country's largest renewable energy projects. It uses the force of flowing water to generate electricity while also providing irrigation water for agriculture.

Emerging technologies like wave and geothermal energy are also being explored. Wave energy harnesses the power of ocean waves, particularly suitable for Australia's extensive coastline. Geothermal energy taps into the Earth's natural heat from underground hot springs and heated rocks.

The transition to renewable energy creates numerous job opportunities in manufacturing, installation, and maintenance of renewable energy systems. It also helps Australia reduce its dependence on fossil fuels and contributes to global efforts to address climate change.`,
      wordCount: 265,
      readingTime: 6,
      yearLevel: 6,
      difficulty: 'hard',
      topic: 'science',
      vocabulary: [
        'photovoltaic',
        'turbines',
        'hydroelectric',
        'geothermal',
        'fossil fuels',
        'greenhouse gas emissions',
      ],
      source: 'Australian Renewable Energy Agency',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    questions: [
      {
        id: 'q1-year6-3',
        articleId: 'article-year6-3',
        type: 'multiple-choice',
        question:
          'How many sunny days per year do many regions of Australia receive?',
        options: [
          'Over 200 days',
          'Over 250 days',
          'Over 300 days',
          'Over 350 days',
        ],
        correctAnswer: 'Over 300 days',
        explanation:
          'The text states that many regions of Australia have over 300 sunny days per year.',
        points: 1,
        order: 1,
        difficulty: 'easy',
      },
      {
        id: 'q2-year6-3',
        articleId: 'article-year6-3',
        type: 'matching',
        question: 'Match each renewable energy source with its description:',
        matchingOptions: [
          {
            id: 'statement1',
            content: 'Solar power',
            type: 'statement',
          },
          {
            id: 'statement2',
            content: 'Wind energy',
            type: 'statement',
          },
          {
            id: 'statement3',
            content: 'Hydroelectric power',
            type: 'statement',
          },
          {
            id: 'statement4',
            content: 'Geothermal energy',
            type: 'statement',
          },
          {
            id: 'option1',
            content: 'Uses photovoltaic panels to convert sunlight',
            type: 'option',
          },
          {
            id: 'option2',
            content: 'Harnesses the force of flowing water',
            type: 'option',
          },
          {
            id: 'option3',
            content: "Taps into Earth's natural underground heat",
            type: 'option',
          },
          {
            id: 'option4',
            content: 'Uses turbines in areas with consistent wind patterns',
            type: 'option',
          },
        ],
        correctAnswer:
          '{"statement1":"option1","statement2":"option4","statement3":"option2","statement4":"option3"}',
        explanation:
          'Each energy source is matched with its correct method of generation as described in the text.',
        points: 4,
        order: 2,
        difficulty: 'medium',
      },
      {
        id: 'q3-year6-3',
        articleId: 'article-year6-3',
        type: 'short-answer',
        question:
          'What was the Snowy Mountains Scheme and when was it completed?',
        instructions: 'Provide details about this renewable energy project.',
        correctAnswer:
          "The Snowy Mountains Scheme was one of Australia's largest renewable energy projects that uses flowing water to generate electricity and provide irrigation water. It was completed in the 1970s.",
        explanation:
          'A complete answer should mention both what the scheme does (hydroelectric power and irrigation) and when it was finished.',
        points: 2,
        order: 3,
        difficulty: 'medium',
      },
      {
        id: 'q4-year6-3',
        articleId: 'article-year6-3',
        type: 'true-false',
        question:
          'Wave energy and geothermal energy are well-established renewable energy sources in Australia.',
        correctAnswer: 'false',
        explanation:
          'The text describes these as "emerging technologies" that are "being explored", indicating they are not yet well-established.',
        points: 1,
        order: 4,
        difficulty: 'medium',
      },
      {
        id: 'q5-year6-3',
        articleId: 'article-year6-3',
        type: 'sentence-completion',
        question:
          'The transition to renewable energy creates job opportunities in _____, _____, and _____ of renewable energy systems.',
        correctAnswer: 'manufacturing, installation, maintenance',
        explanation:
          'The text lists these three areas where renewable energy creates job opportunities.',
        points: 3,
        order: 5,
        difficulty: 'easy',
      },
    ],
    yearLevel: 6,
    totalPoints: 11,
    timeLimit: 25,
    tags: [
      'science',
      'renewable-energy',
      'environment',
      'technology',
      'australia',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
