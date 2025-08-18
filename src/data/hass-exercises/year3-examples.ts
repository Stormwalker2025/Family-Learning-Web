import { HassExercise } from '@/types'

export const year3HassExercises: HassExercise[] = [
  // History Exercise - Aboriginal Culture
  {
    id: 'year3-history-aboriginal-culture',
    title: 'The First Australians - Aboriginal and Torres Strait Islander People',
    description: 'Learn about the rich culture and traditions of Australia\'s First People.',
    subject: 'history',
    yearLevel: 3,
    difficulty: 'developing',
    
    article: {
      id: 'article-aboriginal-culture',
      title: 'The First Australians',
      content: `# The First Australians

Aboriginal and Torres Strait Islander people have lived in Australia for over 65,000 years. They were the **first people** to call Australia home.

## Living with the Land

The Aboriginal people lived in harmony with the land. They knew which plants were good to eat and which animals to hunt. They took only what they needed and shared everything with their group.

Different groups lived in different parts of Australia. Some lived by the sea and ate fish and shellfish. Others lived in the desert and found water in special places called rock holes.

## Dreamtime Stories

Aboriginal people have special stories called **Dreamtime stories**. These stories tell us about how the land, animals, and people were created. Each story teaches important lessons about how to live and care for the country.

One famous Dreamtime story is about the Rainbow Serpent, a giant snake that made the rivers and mountains as it moved across the land.

## Art and Culture

Aboriginal people are famous for their beautiful art. They paint on rocks, bark, and sand. Their paintings often show animals, people, and Dreamtime stories.

They also make music with special instruments like the **didgeridoo**, which is a long wooden tube that makes deep sounds when you blow into it.

## Today

Today, Aboriginal and Torres Strait Islander people still live all across Australia. They work in many different jobs and live in cities and towns, just like other Australians. They are also working hard to keep their culture and languages alive for future generations.

We can all learn from Aboriginal people about caring for our environment and living together peacefully.`,
      subject: 'history',
      yearLevel: 3,
      difficulty: 'developing',
      readingTime: 8,
      wordCount: 280,
      topics: ['aboriginal-culture', 'dreamtime', 'first-australians', 'traditional-life'],
      culturalContext: ['indigenous'],
      australianCurriculum: ['ACHASSK061', 'ACHASSK062'],
      mediaResources: [
        {
          id: 'aboriginal-art-gallery',
          type: 'image',
          title: 'Aboriginal Rock Art',
          url: '/images/aboriginal-art.jpg',
          description: 'Ancient rock paintings showing traditional Aboriginal art'
        }
      ],
      interactiveElements: ['australia-map-aboriginal-groups'],
      keyVocabulary: [
        {
          id: 'dreamtime',
          term: 'Dreamtime',
          definition: 'Special stories that Aboriginal people tell about how the world was created',
          context: 'Aboriginal culture and spirituality',
          examples: ['The Rainbow Serpent is a famous Dreamtime story'],
          difficulty: 2,
          subject: 'history',
          yearLevel: 3
        },
        {
          id: 'didgeridoo',
          term: 'Didgeridoo',
          definition: 'A long wooden musical instrument played by blowing air through it',
          context: 'Aboriginal musical instruments',
          examples: ['Aboriginal people play the didgeridoo during ceremonies'],
          difficulty: 2,
          subject: 'history',
          yearLevel: 3
        }
      ],
      backgroundInfo: 'Aboriginal and Torres Strait Islander people are the Indigenous peoples of Australia with the world\'s oldest continuous culture.',
      discussionPrompts: [
        'What can we learn from Aboriginal people about caring for the environment?',
        'How are Dreamtime stories similar to other stories you know?',
        'What makes Aboriginal art special and unique?'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    
    questions: [
      {
        id: 'q1-aboriginal-time',
        articleId: 'article-aboriginal-culture',
        type: 'multiple-choice',
        subject: 'history',
        question: 'How long have Aboriginal people lived in Australia?',
        options: [
          'About 200 years',
          'About 1,000 years', 
          'Over 65,000 years',
          'About 10,000 years'
        ],
        correctAnswer: 'Over 65,000 years',
        skillsAssessed: ['factual-recall', 'reading-comprehension'],
        bloomsTaxonomy: 'remember',
        points: 2,
        order: 1,
        difficulty: 'developing',
        estimatedTime: 1
      },
      {
        id: 'q2-dreamtime-stories',
        articleId: 'article-aboriginal-culture',
        type: 'comprehension',
        subject: 'history',
        question: 'What are Dreamtime stories and why are they important to Aboriginal people?',
        correctAnswer: 'Dreamtime stories are special stories that tell about how the land, animals, and people were created. They teach important lessons about how to live and care for the country.',
        skillsAssessed: ['comprehension', 'cultural-understanding'],
        bloomsTaxonomy: 'understand',
        points: 4,
        order: 2,
        difficulty: 'developing',
        estimatedTime: 3
      },
      {
        id: 'q3-living-harmony',
        articleId: 'article-aboriginal-culture',
        type: 'application',
        subject: 'history',
        question: 'The article says Aboriginal people "lived in harmony with the land." Give two examples of how they did this.',
        sampleAnswers: [
          'They knew which plants were good to eat',
          'They took only what they needed',
          'They shared everything with their group',
          'They found water in special places'
        ],
        skillsAssessed: ['application', 'environmental-awareness'],
        bloomsTaxonomy: 'apply',
        points: 4,
        order: 3,
        difficulty: 'developing',
        estimatedTime: 3
      },
      {
        id: 'q4-aboriginal-today',
        articleId: 'article-aboriginal-culture',
        type: 'analysis',
        subject: 'history',
        question: 'How has life changed for Aboriginal people from long ago to today? What has stayed the same?',
        skillsAssessed: ['analysis', 'compare-contrast', 'cultural-continuity'],
        bloomsTaxonomy: 'analyze',
        points: 6,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 5
      }
    ],
    
    learningObjectives: [
      'Understand that Aboriginal and Torres Strait Islander peoples are Australia\'s First Peoples',
      'Recognise the significance of Country and culture to Aboriginal peoples',
      'Identify ways Aboriginal people lived sustainably with their environment',
      'Appreciate the continuing presence of Aboriginal culture in modern Australia'
    ],
    
    assessmentCriteria: [
      'Demonstrates understanding of Aboriginal peoples as Australia\'s First Peoples',
      'Shows awareness of traditional Aboriginal ways of life',
      'Recognises the importance of Dreamtime stories and culture',
      'Uses appropriate terminology when discussing Aboriginal culture'
    ],
    
    crossCurricularLinks: ['Geography - places and environments', 'English - oral storytelling'],
    
    estimatedDuration: 25,
    timeLimit: 35,
    
    tags: ['aboriginal', 'indigenous', 'culture', 'dreamtime', 'first-australians'],
    totalPoints: 16,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Geography Exercise - Australian States and Territories
  {
    id: 'year3-geography-states-territories',
    title: 'Our Australian States and Territories',
    description: 'Explore the different states and territories that make up Australia.',
    subject: 'geography',
    yearLevel: 3,
    difficulty: 'developing',
    
    article: {
      id: 'article-states-territories',
      title: 'Our Australian States and Territories',
      content: `# Our Australian States and Territories

Australia is a very big country made up of **six states** and **two territories**. Each state and territory has its own capital city and special features.

## The Six States

### New South Wales (NSW)
- **Capital:** Sydney
- **Famous for:** Sydney Harbour Bridge, Sydney Opera House, beautiful beaches
- **Size:** About 800,000 square kilometres

### Victoria (VIC) 
- **Capital:** Melbourne
- **Famous for:** Melbourne Cup horse race, great coffee, street art
- **Size:** About 240,000 square kilometres (the smallest mainland state)

### Queensland (QLD)
- **Capital:** Brisbane  
- **Famous for:** Great Barrier Reef, Gold Coast theme parks, tropical weather
- **Size:** About 1.7 million square kilometres

### Western Australia (WA)
- **Capital:** Perth
- **Famous for:** Mining, beautiful wildflowers, long beaches
- **Size:** About 2.5 million square kilometres (the biggest state!)

### South Australia (SA)
- **Capital:** Adelaide
- **Famous for:** Wine regions, the Flinders Ranges, festivals
- **Size:** About 980,000 square kilometres

### Tasmania (TAS)
- **Capital:** Hobart
- **Famous for:** MONA museum, Cradle Mountain, clean air
- **Size:** About 68,000 square kilometres (an island state!)

## The Two Territories

### Australian Capital Territory (ACT)
- **Capital:** Canberra (also Australia's national capital!)
- **Famous for:** Parliament House, national museums, planned city
- **Size:** About 2,400 square kilometres (the smallest!)

### Northern Territory (NT)
- **Capital:** Darwin
- **Famous for:** Uluru (Ayers Rock), crocodiles, hot weather  
- **Size:** About 1.3 million square kilometres

## Our National Capital

**Canberra** in the Australian Capital Territory is where our Prime Minister works. It's where Parliament House is located and where important decisions are made for all of Australia.

## Fun Facts
- You can drive from one state to another, but you need to take a boat or plane to get to Tasmania!
- The Northern Territory and Queensland are closest to the equator, so they're the hottest parts of Australia.
- Western Australia is so big that it takes up about one-third of the whole country!`,
      subject: 'geography',
      yearLevel: 3,
      difficulty: 'developing',
      readingTime: 10,
      wordCount: 350,
      topics: ['australian-states', 'geography', 'capital-cities', 'australian-locations'],
      culturalContext: ['contemporary'],
      australianCurriculum: ['ACHASSK066', 'ACHASSK067'],
      mediaResources: [
        {
          id: 'australia-states-map',
          type: 'interactive-map',
          title: 'Interactive Map of Australian States and Territories',
          url: '/maps/australia-states',
          description: 'Click on each state to learn more about it'
        }
      ],
      interactiveElements: ['australia-states-quiz-map'],
      keyVocabulary: [
        {
          id: 'state',
          term: 'State',
          definition: 'A large area of Australia with its own government and capital city',
          context: 'Australian political geography',
          examples: ['New South Wales is a state in Australia'],
          difficulty: 2,
          subject: 'geography',
          yearLevel: 3
        },
        {
          id: 'territory',
          term: 'Territory',
          definition: 'An area of Australia that is controlled by the national government',
          context: 'Australian political geography', 
          examples: ['The Australian Capital Territory contains Canberra'],
          difficulty: 3,
          subject: 'geography',
          yearLevel: 3
        },
        {
          id: 'capital-city',
          term: 'Capital City',
          definition: 'The most important city in a state or territory where the government is based',
          context: 'Cities and government',
          examples: ['Melbourne is the capital city of Victoria'],
          difficulty: 2,
          subject: 'geography',
          yearLevel: 3
        }
      ],
      backgroundInfo: 'Australia is a federation, which means the states and territories work together under one national government.',
      discussionPrompts: [
        'Which state or territory would you most like to visit and why?',
        'What makes your state or territory special?',
        'How do you think the size of a state affects the people living there?'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    
    questions: [
      {
        id: 'q1-count-states',
        articleId: 'article-states-territories',
        type: 'multiple-choice',
        subject: 'geography',
        question: 'How many states does Australia have?',
        options: ['4', '5', '6', '8'],
        correctAnswer: '6',
        skillsAssessed: ['factual-recall'],
        bloomsTaxonomy: 'remember',
        points: 2,
        order: 1,
        difficulty: 'foundation',
        estimatedTime: 1
      },
      {
        id: 'q2-biggest-state',
        articleId: 'article-states-territories',
        type: 'multiple-choice',
        subject: 'geography',
        question: 'Which is the biggest state in Australia?',
        options: ['Queensland', 'New South Wales', 'Western Australia', 'Northern Territory'],
        correctAnswer: 'Western Australia',
        skillsAssessed: ['factual-recall', 'comparison'],
        bloomsTaxonomy: 'remember',
        points: 2,
        order: 2,
        difficulty: 'developing',
        estimatedTime: 2
      },
      {
        id: 'q3-national-capital',
        articleId: 'article-states-territories', 
        type: 'short-answer',
        subject: 'geography',
        question: 'What is Australia\'s national capital city and which territory is it in?',
        correctAnswer: 'Canberra, Australian Capital Territory',
        skillsAssessed: ['factual-recall', 'reading-comprehension'],
        bloomsTaxonomy: 'remember',
        points: 3,
        order: 3,
        difficulty: 'developing',
        estimatedTime: 2
      },
      {
        id: 'q4-map-skills',
        articleId: 'article-states-territories',
        type: 'map-skills',
        subject: 'geography',
        question: 'Match each capital city with its state or territory.',
        correctAnswer: {
          'Sydney': 'New South Wales',
          'Melbourne': 'Victoria', 
          'Brisbane': 'Queensland',
          'Perth': 'Western Australia',
          'Adelaide': 'South Australia',
          'Hobart': 'Tasmania',
          'Canberra': 'Australian Capital Territory',
          'Darwin': 'Northern Territory'
        },
        skillsAssessed: ['map-skills', 'spatial-awareness'],
        bloomsTaxonomy: 'understand',
        points: 8,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 5
      },
      {
        id: 'q5-island-state',
        articleId: 'article-states-territories',
        type: 'comprehension',
        subject: 'geography',
        question: 'Which state is an island? What makes it different from the other states?',
        sampleAnswers: [
          'Tasmania is an island state',
          'You need to take a boat or plane to get there',
          'It\'s separated from the mainland by water'
        ],
        skillsAssessed: ['comprehension', 'geographical-features'],
        bloomsTaxonomy: 'understand',
        points: 4,
        order: 5,
        difficulty: 'developing',
        estimatedTime: 3
      }
    ],
    
    learningObjectives: [
      'Identify the six states and two territories of Australia',
      'Name the capital city of each state and territory',
      'Understand that Canberra is Australia\'s national capital',
      'Compare the relative sizes of different states and territories',
      'Use simple maps to locate Australian places'
    ],
    
    assessmentCriteria: [
      'Correctly identifies Australian states and territories',
      'Matches capital cities with their states/territories',
      'Shows understanding of Australia\'s political geography',
      'Demonstrates basic map reading skills'
    ],
    
    crossCurricularLinks: ['Mathematics - measurement and comparison of areas'],
    
    estimatedDuration: 30,
    timeLimit: 40,
    
    tags: ['states', 'territories', 'capitals', 'geography', 'australia', 'map-skills'],
    totalPoints: 19,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Civics Exercise - Rules and Laws
  {
    id: 'year3-civics-rules-laws',
    title: 'Rules and Laws in Our Community',
    description: 'Learn about why we have rules and laws, and how they help us live together safely.',
    subject: 'civics',
    yearLevel: 3,
    difficulty: 'developing',
    
    article: {
      id: 'article-rules-laws',
      title: 'Rules and Laws in Our Community',
      content: `# Rules and Laws in Our Community

Every day we follow many different **rules** and **laws**. They help us live together safely and fairly.

## What are Rules?

Rules are instructions that tell us what we should and shouldn't do. We have rules everywhere:

### At Home
- Put toys away after playing
- Say "please" and "thank you"
- Help with family chores
- Be kind to brothers and sisters

### At School  
- Listen when the teacher is talking
- Walk, don't run, in the hallways
- Share equipment with others
- Keep the playground safe

### In Sports
- Take turns fairly
- Don't hurt other players
- Follow the referee's decisions
- Be a good sport when you win or lose

## What are Laws?

Laws are special rules made by the government that **everyone** in Australia must follow. Breaking a law can get you in serious trouble.

Some important laws include:
- Don't hurt other people
- Don't take things that belong to others
- Drive safely and wear seatbelts in cars
- Don't damage other people's property

## Why Do We Need Rules and Laws?

Rules and laws help us in many ways:

1. **Safety** - They keep us safe from harm
2. **Fairness** - They make sure everyone is treated fairly
3. **Order** - They help everything run smoothly
4. **Respect** - They help us respect each other and our community

## Who Makes the Rules?

Different people make different rules:
- **Parents** make rules at home
- **Teachers** make rules at school  
- **Sports coaches** make rules for games
- **Government** makes laws for everyone

## What Happens When Rules Are Broken?

When someone breaks a rule, there are usually **consequences**:
- At home: You might lose privileges or have extra chores
- At school: You might miss recess or have a timeout
- In sports: You might sit out for part of the game
- Breaking laws: Police might give you a fine or worse

## Being a Good Citizen

Good citizens follow rules and laws because they understand that this helps everyone live together happily and safely. Even when no one is watching, good citizens do the right thing.`,
      subject: 'civics',
      yearLevel: 3,
      difficulty: 'developing',
      readingTime: 8,
      wordCount: 320,
      topics: ['rules', 'laws', 'community', 'citizenship', 'consequences'],
      culturalContext: ['contemporary'],
      australianCurriculum: ['ACHASSK070', 'ACHASSK071'],
      mediaResources: [
        {
          id: 'community-rules-poster',
          type: 'image',
          title: 'Community Rules Poster',
          url: '/images/community-rules.jpg', 
          description: 'Visual guide showing different rules in various settings'
        }
      ],
      interactiveElements: ['rules-sorting-game'],
      keyVocabulary: [
        {
          id: 'rules',
          term: 'Rules',
          definition: 'Instructions that tell us what we should and shouldn\'t do in different places',
          context: 'Community and social behaviour',
          examples: ['School rules help keep everyone safe and learning'],
          difficulty: 1,
          subject: 'civics',
          yearLevel: 3
        },
        {
          id: 'laws',
          term: 'Laws',
          definition: 'Special rules made by the government that everyone must follow',
          context: 'Government and legal system',
          examples: ['It is against the law to steal things from others'],
          difficulty: 2,
          subject: 'civics',
          yearLevel: 3
        },
        {
          id: 'consequences',
          term: 'Consequences',
          definition: 'What happens as a result of your actions, especially when you break rules',
          context: 'Behaviour and responsibility',
          examples: ['The consequence of not doing homework might be missing recess'],
          difficulty: 2,
          subject: 'civics',
          yearLevel: 3
        },
        {
          id: 'citizen',
          term: 'Citizen',
          definition: 'A person who belongs to a community or country and has rights and responsibilities',
          context: 'Citizenship and community membership',
          examples: ['Good citizens follow rules and help their community'],
          difficulty: 3,
          subject: 'civics',
          yearLevel: 3
        }
      ],
      backgroundInfo: 'Rules and laws form the foundation of how people live together in organised societies. They exist at every level from family to nation.',
      discussionPrompts: [
        'What rules do you think are most important in your family?',
        'Why is it important to follow rules even when no one is watching?', 
        'How would your school be different if there were no rules?',
        'What makes a rule fair or unfair?'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    
    questions: [
      {
        id: 'q1-difference-rules-laws',
        articleId: 'article-rules-laws',
        type: 'comprehension',
        subject: 'civics',
        question: 'What is the difference between rules and laws?',
        sampleAnswers: [
          'Rules are made by different people in different places',
          'Laws are made by the government for everyone',
          'Laws are more serious than rules',
          'Breaking laws has more serious consequences'
        ],
        skillsAssessed: ['comprehension', 'compare-contrast'],
        bloomsTaxonomy: 'understand',
        points: 4,
        order: 1,
        difficulty: 'developing',
        estimatedTime: 3
      },
      {
        id: 'q2-why-need-rules',
        articleId: 'article-rules-laws',
        type: 'multiple-choice',
        subject: 'civics',
        question: 'According to the article, which is NOT a reason why we need rules and laws?',
        options: [
          'To keep us safe from harm',
          'To make sure everyone is treated fairly', 
          'To make life more difficult',
          'To help us respect each other'
        ],
        correctAnswer: 'To make life more difficult',
        skillsAssessed: ['comprehension', 'critical-thinking'],
        bloomsTaxonomy: 'understand',
        points: 3,
        order: 2,
        difficulty: 'developing',
        estimatedTime: 2
      },
      {
        id: 'q3-rule-makers',
        articleId: 'article-rules-laws',
        type: 'application',
        subject: 'civics',
        question: 'Give an example of a rule and identify who would make this rule.',
        sampleAnswers: [
          'Bedtime at 8pm - Parents make this rule',
          'No running in hallways - Teachers make this rule',
          'No hands in soccer - Sports coaches make this rule',
          'Wear seatbelts in cars - Government makes this law'
        ],
        skillsAssessed: ['application', 'understanding-authority'],
        bloomsTaxonomy: 'apply',
        points: 4,
        order: 3,
        difficulty: 'proficient',
        estimatedTime: 3
      },
      {
        id: 'q4-good-citizen',
        articleId: 'article-rules-laws',
        type: 'evaluation',
        subject: 'civics',
        question: 'The article says good citizens follow rules and laws even when no one is watching. Do you agree? Explain your thinking.',
        skillsAssessed: ['evaluation', 'moral-reasoning', 'personal-reflection'],
        bloomsTaxonomy: 'evaluate',
        hints: [
          'Think about why rules exist',
          'Consider how communities work best',
          'What happens if people only follow rules when they might get caught?'
        ],
        points: 6,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 5
      },
      {
        id: 'q5-create-rule',
        articleId: 'article-rules-laws',
        type: 'creative',
        subject: 'civics',
        question: 'Your class is going on a field trip to the zoo. Create three important rules for this trip and explain why each rule is needed.',
        skillsAssessed: ['creative-thinking', 'rule-creation', 'safety-awareness'],
        bloomsTaxonomy: 'create',
        hints: [
          'Think about safety at the zoo',
          'Consider how to be respectful to animals and other visitors',
          'What would help the trip run smoothly?'
        ],
        points: 8,
        order: 5,
        difficulty: 'proficient',
        estimatedTime: 6
      }
    ],
    
    learningObjectives: [
      'Distinguish between rules and laws',
      'Understand why rules and laws are necessary in communities',
      'Identify who makes different types of rules',
      'Recognise the consequences of breaking rules and laws',
      'Demonstrate understanding of good citizenship'
    ],
    
    assessmentCriteria: [
      'Shows understanding of the difference between rules and laws',
      'Explains the purposes of rules and laws in communities',
      'Identifies appropriate rule-makers for different contexts',
      'Demonstrates awareness of personal responsibility and citizenship'
    ],
    
    crossCurricularLinks: ['English - persuasive writing about rules', 'Personal Development - respect and responsibility'],
    
    estimatedDuration: 35,
    timeLimit: 45,
    
    tags: ['rules', 'laws', 'community', 'citizenship', 'civics', 'consequences'],
    totalPoints: 25,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]