import { HassExercise } from '@/types'

export const year6HassExercises: HassExercise[] = [
  // History Exercise - Federation of Australia
  {
    id: 'year6-history-federation',
    title: 'The Birth of Modern Australia - Federation 1901',
    description: 'Discover how six separate colonies became one united nation in 1901.',
    subject: 'history',
    yearLevel: 6,
    difficulty: 'proficient',
    
    article: {
      id: 'article-federation',
      title: 'The Birth of Modern Australia - Federation 1901',
      content: `# The Birth of Modern Australia - Federation 1901

On January 1st, 1901, something amazing happened. The six separate **colonies** of Australia joined together to become one united country - the **Commonwealth of Australia**.

## Before Federation - The Colonies

Before 1901, Australia was not one country. Instead, there were six separate British colonies:
- New South Wales (1788)
- Tasmania (1825) 
- Western Australia (1829)
- South Australia (1836)
- Victoria (1851)
- Queensland (1859)

Each colony had its own government, laws, and even different railway tracks! This made it difficult for people and goods to move between colonies.

## Problems That Needed Solving

The colonies faced several problems that could be solved better by working together:

### Defence
Each colony had its own small army. If a powerful country attacked Australia, the separate colonies would be too weak to defend themselves.

### Trade and Transport
- Different colonies had different money systems
- Railway tracks were different sizes, so trains couldn't cross borders
- There were taxes (called **tariffs**) on goods moving between colonies

### Immigration
The colonies wanted to control who could come to Australia, but they needed to work together to have a strong policy.

### Communication
Each colony had its own postal system, making it hard to send mail across Australia.

## The Push for Federation

Some important Australians saw that the colonies would be stronger together than apart:

**Sir Henry Parkes** from New South Wales gave a famous speech in 1889 calling for the colonies to unite. He is often called the "Father of Federation."

**Sir Edmund Barton** became Australia's first Prime Minister. He worked hard to convince all the colonies to join together.

**Alfred Deakin** from Victoria also played a key role in creating our Constitution.

## The Constitution

Before federation could happen, the colonies needed to agree on a **Constitution** - a set of rules for how the new nation would work.

Key features of the Australian Constitution:
- Created a federal government in Canberra
- Let states keep some of their own powers
- Established the High Court
- Created the Australian Parliament with two houses

## January 1st, 1901 - Federation Day

On New Year's Day 1901, the Commonwealth of Australia was born! 

**Lord Hopetoun** became the first Governor-General, representing the British Queen.

**Sir Edmund Barton** became the first Prime Minister.

The ceremony took place in **Centennial Park, Sydney** because Canberra didn't exist yet!

## What Changed After Federation?

Federation brought many improvements:

✅ **One Government**: Australia had one national government to make decisions for the whole country

✅ **Common Currency**: All Australians used the same money

✅ **Better Defence**: Australia could defend itself more effectively

✅ **Free Trade**: No more taxes on goods moving between states

✅ **Standard Railways**: Eventually, railway tracks became the same size

✅ **White Australia Policy**: A unified immigration policy (though this was unfair and was later changed)

## The Federal System

Australia became a **federation**, which means:
- The federal government makes decisions about the whole country (defence, immigration, money)
- State governments keep control over some areas (schools, hospitals, police)
- Local councils handle community issues (parks, roads, rubbish collection)

## Why Federation Matters Today

Federation was crucial for Australia because it:
- Made us stronger and safer
- Created the modern Australia we know today  
- Showed that different groups could work together
- Gave us our democratic system of government

Today, we still celebrate Australia Day (January 26th) and remember that Federation Day (January 1st) as important moments in our nation's history.`,
      subject: 'history',
      yearLevel: 6,
      difficulty: 'proficient',
      readingTime: 15,
      wordCount: 580,
      topics: ['federation', 'australian-history', 'government', 'colonies', 'constitution'],
      culturalContext: ['historical', 'contemporary'],
      australianCurriculum: ['ACHASSK134', 'ACHASSK135', 'ACHASSK136'],
      mediaResources: [
        {
          id: 'federation-timeline',
          type: 'timeline',
          title: 'Timeline of Australian Federation',
          url: '/timelines/federation',
          description: 'Interactive timeline showing key events leading to Federation'
        },
        {
          id: 'constitution-document',
          type: 'image',
          title: 'The Australian Constitution',
          url: '/images/constitution-1901.jpg',
          description: 'The original Australian Constitution document from 1901'
        }
      ],
      interactiveElements: ['federation-map-comparison'],
      keyVocabulary: [
        {
          id: 'federation',
          term: 'Federation',
          definition: 'The joining together of separate states or colonies to form one united country',
          context: 'Australian political history',
          examples: ['The federation of Australia happened in 1901'],
          difficulty: 3,
          subject: 'history',
          yearLevel: 6
        },
        {
          id: 'colony',
          term: 'Colony',
          definition: 'A territory controlled by another country, usually far away',
          context: 'Colonial history',
          examples: ['Before 1901, New South Wales was a British colony'],
          difficulty: 2,
          subject: 'history',
          yearLevel: 6
        },
        {
          id: 'constitution',
          term: 'Constitution',
          definition: 'A set of fundamental rules and principles that govern a country',
          context: 'Government and law',
          examples: ['The Australian Constitution established our system of government'],
          difficulty: 4,
          subject: 'history',
          yearLevel: 6
        },
        {
          id: 'commonwealth',
          term: 'Commonwealth',
          definition: 'The official name for Australia after Federation in 1901',
          context: 'Australian political terminology',
          examples: ['The Commonwealth of Australia was established on January 1, 1901'],
          difficulty: 3,
          subject: 'history',
          yearLevel: 6
        }
      ],
      backgroundInfo: 'Federation was a peaceful process that created modern Australia. Unlike many countries, Australia became independent through negotiation rather than war.',
      discussionPrompts: [
        'What were the main benefits and challenges of Federation for ordinary Australians?',
        'How might Australia be different today if Federation had never happened?',
        'What can we learn from the Federation process about compromise and working together?',
        'How did Federation affect Aboriginal and Torres Strait Islander peoples?'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    
    questions: [
      {
        id: 'q1-federation-date',
        articleId: 'article-federation',
        type: 'multiple-choice',
        subject: 'history',
        question: 'When did the Federation of Australia take place?',
        options: [
          'January 26, 1901',
          'January 1, 1901', 
          'January 1, 1900',
          'December 31, 1900'
        ],
        correctAnswer: 'January 1, 1901',
        skillsAssessed: ['factual-recall', 'chronology'],
        bloomsTaxonomy: 'remember',
        points: 2,
        order: 1,
        difficulty: 'developing',
        estimatedTime: 1
      },
      {
        id: 'q2-problems-colonies',
        articleId: 'article-federation',
        type: 'analysis',
        subject: 'history',
        question: 'Analyse the main problems faced by the separate colonies before Federation. Explain how Federation helped solve these problems.',
        sampleAnswers: [
          'Defence: Small separate armies were weak, Federation created a stronger national defence',
          'Trade: Different money and railway systems, Federation created common currency and standards',
          'Communication: Separate postal systems, Federation unified communications'
        ],
        skillsAssessed: ['analysis', 'cause-effect', 'problem-solving'],
        bloomsTaxonomy: 'analyze',
        points: 8,
        order: 2,
        difficulty: 'proficient',
        estimatedTime: 6
      },
      {
        id: 'q3-key-figures',
        articleId: 'article-federation',
        type: 'comprehension',
        subject: 'history',
        question: 'Who were the three key figures mentioned in bringing about Federation, and what did each contribute?',
        sampleAnswers: [
          'Sir Henry Parkes - gave famous speech calling for federation, called "Father of Federation"',
          'Sir Edmund Barton - became first Prime Minister, worked to convince colonies',
          'Alfred Deakin - from Victoria, helped create the Constitution'
        ],
        skillsAssessed: ['comprehension', 'historical-figures'],
        bloomsTaxonomy: 'understand',
        points: 6,
        order: 3,
        difficulty: 'proficient',
        estimatedTime: 4
      },
      {
        id: 'q4-federal-system',
        articleId: 'article-federation',
        type: 'application',
        subject: 'history',
        question: 'The article explains Australia\'s federal system with three levels of government. Give one example of a responsibility for each level and explain why this division makes sense.',
        skillsAssessed: ['application', 'government-understanding', 'logical-reasoning'],
        bloomsTaxonomy: 'apply',
        hints: [
          'Think about what issues affect the whole country vs. just one state vs. just one community',
          'Consider which level of government would be best placed to handle different issues'
        ],
        points: 9,
        order: 4,
        difficulty: 'advanced',
        estimatedTime: 6
      },
      {
        id: 'q5-federation-evaluation',
        articleId: 'article-federation',
        type: 'evaluation',
        subject: 'history',
        question: 'Evaluate the success of Federation. What evidence from the article suggests Federation was beneficial for Australia? Can you think of any potential disadvantages?',
        skillsAssessed: ['evaluation', 'critical-thinking', 'evidence-analysis', 'balanced-argument'],
        bloomsTaxonomy: 'evaluate',
        hints: [
          'Look at what changed after Federation - were these changes positive?',
          'Think about what might have been lost when colonies gave up some independence',
          'Consider different perspectives - who benefited most and least?'
        ],
        points: 10,
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 8
      },
      {
        id: 'q6-historical-significance',
        articleId: 'article-federation',
        type: 'creative',
        subject: 'history',
        question: 'Imagine you are a newspaper reporter in 1901. Write a short article (100-150 words) explaining to readers what Federation means for their daily lives.',
        skillsAssessed: ['creative-writing', 'historical-empathy', 'communication', 'perspective-taking'],
        bloomsTaxonomy: 'create',
        hints: [
          'Think about what ordinary people in 1901 would care about most',
          'Use language that people in 1901 might understand',
          'Focus on practical changes that would affect daily life'
        ],
        points: 12,
        order: 6,
        difficulty: 'advanced',
        estimatedTime: 10
      }
    ],
    
    learningObjectives: [
      'Explain why and how the Australian colonies federated in 1901',
      'Identify key figures and events in the Federation movement',
      'Analyse the problems that Federation was designed to solve',
      'Understand the federal system of government created by Federation',
      'Evaluate the significance of Federation for modern Australia'
    ],
    
    assessmentCriteria: [
      'Demonstrates knowledge of Federation chronology and key events',
      'Explains causes and consequences of Federation',
      'Identifies and describes contributions of historical figures',
      'Shows understanding of federal system and levels of government',
      'Uses historical evidence to support arguments and evaluations'
    ],
    
    crossCurricularLinks: [
      'Civics - Australian government system',
      'Geography - states and territories of Australia',
      'English - persuasive writing and historical sources'
    ],
    
    estimatedDuration: 45,
    timeLimit: 60,
    
    extensionActivities: [
      {
        id: 'federation-debate',
        title: 'Federation Debate',
        description: 'Role-play a debate between colonists for and against Federation',
        type: 'presentation',
        instructions: [
          'Research arguments for and against Federation from different colonies',
          'Choose a role (NSW politician, WA farmer, Victorian businessman, etc.)',
          'Prepare a 2-minute speech from your character\'s perspective',
          'Participate in a class debate about whether to federate'
        ],
        duration: 30,
        difficulty: 'advanced'
      }
    ],
    
    tags: ['federation', 'australian-history', '1901', 'government', 'colonies', 'constitution'],
    totalPoints: 47,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Geography Exercise - Climate Change in Australia  
  {
    id: 'year6-geography-climate-change',
    title: 'Climate Change and Australia\'s Environment',
    description: 'Explore how climate change is affecting Australia\'s unique environment and what we can do about it.',
    subject: 'geography',
    yearLevel: 6,
    difficulty: 'proficient',
    
    article: {
      id: 'article-climate-change',
      title: 'Climate Change and Australia\'s Environment',
      content: `# Climate Change and Australia\'s Environment

Australia is experiencing the effects of **climate change** more than many other countries. Our unique environment and wildlife are facing serious challenges that require immediate action.

## What is Climate Change?

Climate change refers to long-term changes in global weather patterns, primarily caused by human activities that increase **greenhouse gases** in the atmosphere.

### The Greenhouse Effect
1. **Natural greenhouse effect**: Some gases in our atmosphere trap heat from the sun, keeping Earth warm enough for life
2. **Enhanced greenhouse effect**: Human activities add extra greenhouse gases, trapping more heat and making Earth warmer
3. **Main greenhouse gases**: Carbon dioxide (CO₂), methane (CH₄), and nitrous oxide (N₂O)

## Evidence of Climate Change in Australia

### Rising Temperatures
- Australia has warmed by about 1.4°C since 1910
- We're experiencing more frequent and intense **heatwaves**
- Summer temperatures regularly exceed previous records

### Changing Rainfall Patterns  
- Southern and eastern Australia are receiving less rainfall
- Northern Australia is experiencing more intense wet seasons
- **Droughts** are becoming longer and more severe

### Extreme Weather Events
- More frequent and intense **bushfires**
- Stronger cyclones and storms  
- Flash flooding in some areas
- Extended drought periods in others

## Impacts on Australia's Environment

### The Great Barrier Reef
One of Australia's most famous natural wonders is under serious threat:
- **Coral bleaching**: Rising ocean temperatures cause corals to expel their colorful algae and turn white
- **Ocean acidification**: CO₂ absorption makes oceans more acidic, damaging coral skeletons
- **Biodiversity loss**: Many fish and marine species lose their homes and food sources

### Australian Wildlife
Our unique animals face multiple challenges:
- **Habitat loss**: Bushfires and droughts destroy animal homes
- **Food scarcity**: Changes in plant growth affect animal food sources
- **Migration disruption**: Animals struggle to adapt to changing conditions
- **Species extinction**: Some species cannot adapt fast enough

### Forests and Vegetation
- **Bushfire risk**: Hotter, drier conditions increase fire danger
- **Tree stress**: Drought weakens trees, making them vulnerable to disease
- **Ecosystem shifts**: Plant communities change as conditions alter

### Water Resources
- **River system stress**: Lower rainfall affects river flows
- **Groundwater depletion**: Underground water sources are being overused
- **Water quality issues**: Higher temperatures and altered flows affect water quality

## Human Impacts

Climate change affects Australians in many ways:

### Agriculture
- **Crop yields**: Heat and drought reduce farm productivity  
- **Livestock stress**: Animals struggle in extreme heat
- **Changing seasons**: Planting and harvesting times shift
- **Economic costs**: Farmers face increased expenses and reduced income

### Urban Areas
- **Heat island effect**: Cities become dangerously hot
- **Infrastructure damage**: Roads and buildings suffer in extreme weather
- **Energy demand**: Air conditioning use increases dramatically
- **Health impacts**: Heat-related illnesses become more common

### Coastal Communities
- **Sea level rise**: Coastal erosion threatens homes and infrastructure
- **Storm surge**: Higher seas make storm damage worse
- **Beach erosion**: Popular beaches are disappearing
- **Saltwater intrusion**: Salt water contaminates fresh water supplies

## What's Being Done?

### Government Actions
- **Paris Agreement**: Australia committed to reduce greenhouse gas emissions
- **Renewable energy targets**: Increasing solar and wind power
- **Carbon pricing**: Making pollution more expensive
- **Research funding**: Supporting climate science and solutions

### Community Initiatives
- **Solar panels**: Many homes and businesses use solar power
- **Water conservation**: Communities reduce water waste
- **Tree planting**: Reforestation projects help absorb CO₂
- **Sustainable transport**: More people use bicycles and public transport

### Individual Actions
Every Australian can help by:
- Using less electricity and water
- Choosing sustainable transport options
- Reducing, reusing, and recycling waste  
- Supporting renewable energy
- Learning about and sharing climate science

## Australia's Opportunities

Despite the challenges, Australia has great potential to lead on climate action:

### Natural Advantages
- **Abundant sunshine**: Perfect for solar energy
- **Strong winds**: Great for wind power
- **Vast space**: Room for large renewable energy projects
- **Technological skills**: Smart people developing solutions

### Innovation Opportunities  
- **Battery storage**: Australian companies lead in energy storage
- **Hydrogen fuel**: Clean fuel made from renewable energy
- **Carbon capture**: Technology to remove CO₂ from the atmosphere
- **Sustainable agriculture**: New farming methods that work with the climate

## Looking to the Future

Climate change is one of the biggest challenges facing Australia, but it's also an opportunity to build a cleaner, more sustainable future. By working together and taking action now, we can protect our unique environment for future generations.

The choices we make today will determine what Australia looks like for our children and grandchildren. Every action counts, from individual choices to community projects to government policies.

Australia has always been a land of innovation and resilience. With that same spirit, we can tackle climate change and create a better future for all Australians.`,
      subject: 'geography',
      yearLevel: 6,
      difficulty: 'proficient',
      readingTime: 18,
      wordCount: 750,
      topics: ['climate-change', 'environment', 'sustainability', 'great-barrier-reef', 'renewable-energy'],
      culturalContext: ['contemporary'],
      australianCurriculum: ['ACHASSK137', 'ACHASSK138', 'ACHASSK139', 'ACHASSK140'],
      mediaResources: [
        {
          id: 'climate-data-charts',
          type: 'chart',
          title: 'Australian Climate Change Data',
          url: '/charts/climate-data',
          description: 'Interactive charts showing temperature and rainfall changes over time'
        },
        {
          id: 'barrier-reef-comparison',
          type: 'image',
          title: 'Great Barrier Reef - Before and After Bleaching',
          url: '/images/reef-bleaching.jpg',
          description: 'Side-by-side comparison showing coral bleaching effects'
        },
        {
          id: 'renewable-energy-map',
          type: 'interactive-map',
          title: 'Australian Renewable Energy Projects',
          url: '/maps/renewable-energy',
          description: 'Map showing solar and wind energy projects across Australia'
        }
      ],
      interactiveElements: ['carbon-footprint-calculator', 'climate-solutions-game'],
      keyVocabulary: [
        {
          id: 'climate-change',
          term: 'Climate Change',
          definition: 'Long-term changes in global weather patterns, mainly caused by human activities',
          context: 'Environmental science and geography',
          examples: ['Climate change is causing Australia to experience more extreme weather'],
          difficulty: 3,
          subject: 'geography',
          yearLevel: 6
        },
        {
          id: 'greenhouse-gases',
          term: 'Greenhouse Gases',
          definition: 'Gases in the atmosphere that trap heat from the sun, including carbon dioxide and methane',
          context: 'Environmental science',
          examples: ['Burning fossil fuels releases greenhouse gases into the atmosphere'],
          difficulty: 4,
          subject: 'geography',
          yearLevel: 6
        },
        {
          id: 'coral-bleaching',
          term: 'Coral Bleaching',
          definition: 'When coral polyps expel their colorful algae due to stress, usually from warm water',
          context: 'Marine biology and climate impacts',
          examples: ['The Great Barrier Reef has experienced severe coral bleaching in recent years'],
          difficulty: 4,
          subject: 'geography',
          yearLevel: 6
        },
        {
          id: 'renewable-energy',
          term: 'Renewable Energy',
          definition: 'Energy from sources that naturally replenish, like solar, wind, and hydroelectric power',
          context: 'Sustainable technology and energy',
          examples: ['Australia is increasing its use of renewable energy like solar and wind power'],
          difficulty: 3,
          subject: 'geography',
          yearLevel: 6
        }
      ],
      backgroundInfo: 'Australia is one of the countries most affected by climate change due to its geography, with impacts already visible across the continent.',
      discussionPrompts: [
        'What evidence of climate change have you noticed in your local area?',
        'How might climate change affect your future career choices?',
        'What are the most important actions Australia should take to address climate change?',
        'How can young people make a difference in addressing climate change?'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    
    questions: [
      {
        id: 'q1-greenhouse-effect',
        articleId: 'article-climate-change',
        type: 'comprehension',
        subject: 'geography',
        question: 'Explain the difference between the natural greenhouse effect and the enhanced greenhouse effect.',
        sampleAnswers: [
          'Natural greenhouse effect keeps Earth warm enough for life',
          'Enhanced greenhouse effect is caused by human activities adding extra greenhouse gases',
          'Enhanced effect traps too much heat, making Earth warmer than normal'
        ],
        skillsAssessed: ['comprehension', 'environmental-understanding'],
        bloomsTaxonomy: 'understand',
        points: 6,
        order: 1,
        difficulty: 'proficient',
        estimatedTime: 4
      },
      {
        id: 'q2-australia-evidence',
        articleId: 'article-climate-change',
        type: 'analysis',
        subject: 'geography',
        question: 'Analyse three pieces of evidence that show climate change is happening in Australia. For each piece of evidence, explain what is causing it.',
        skillsAssessed: ['analysis', 'evidence-evaluation', 'cause-effect'],
        bloomsTaxonomy: 'analyze',
        points: 9,
        order: 2,
        difficulty: 'proficient',
        estimatedTime: 6
      },
      {
        id: 'q3-barrier-reef',
        articleId: 'article-climate-change',
        type: 'source-analysis',
        subject: 'geography',
        question: 'Using evidence from the article, explain why the Great Barrier Reef is particularly vulnerable to climate change and what specific impacts it faces.',
        skillsAssessed: ['source-analysis', 'environmental-understanding', 'evidence-use'],
        bloomsTaxonomy: 'analyze',
        points: 8,
        order: 3,
        difficulty: 'proficient',
        estimatedTime: 5
      },
      {
        id: 'q4-human-impacts',
        articleId: 'article-climate-change',
        type: 'application',
        subject: 'geography',
        question: 'Choose one human impact of climate change mentioned in the article (agriculture, urban areas, or coastal communities). Explain how this impact might affect a specific Australian city or region you know about.',
        skillsAssessed: ['application', 'spatial-reasoning', 'local-connections'],
        bloomsTaxonomy: 'apply',
        hints: [
          'Think about specific places in Australia you know',
          'Consider how geography affects climate impacts',
          'Connect the general impacts to specific local examples'
        ],
        points: 8,
        order: 4,
        difficulty: 'advanced',
        estimatedTime: 6
      },
      {
        id: 'q5-solutions-evaluation',
        articleId: 'article-climate-change',
        type: 'evaluation',
        subject: 'geography',
        question: 'Evaluate the different types of climate change solutions mentioned in the article (government actions, community initiatives, individual actions). Which do you think will be most effective and why?',
        skillsAssessed: ['evaluation', 'critical-thinking', 'solution-assessment'],
        bloomsTaxonomy: 'evaluate',
        hints: [
          'Consider the scale and speed of different solutions',
          'Think about what has worked in other situations',
          'Consider multiple perspectives and evidence'
        ],
        points: 10,
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 7
      },
      {
        id: 'q6-future-australia',
        articleId: 'article-climate-change',
        type: 'creative',
        subject: 'geography',
        question: 'Create a plan for how your school or local community could become more sustainable and help address climate change. Include at least 5 specific actions and explain how each would help.',
        skillsAssessed: ['creative-thinking', 'planning', 'environmental-action', 'practical-application'],
        bloomsTaxonomy: 'create',
        hints: [
          'Think about what your school or community already does',
          'Consider actions that are realistic and achievable',
          'Include both immediate and longer-term actions',
          'Think about energy, waste, transport, and education'
        ],
        points: 15,
        order: 6,
        difficulty: 'advanced',
        estimatedTime: 10
      }
    ],
    
    learningObjectives: [
      'Explain the causes and effects of climate change in Australia',
      'Identify evidence of climate change in Australian environments',
      'Analyse the impacts of climate change on Australian ecosystems and human communities',
      'Evaluate different strategies for addressing climate change',
      'Develop plans for sustainable action at local and community levels'
    ],
    
    assessmentCriteria: [
      'Demonstrates understanding of climate change causes and processes',
      'Uses evidence to support explanations of climate change impacts',
      'Analyses connections between climate change and Australian environments',
      'Evaluates effectiveness of different climate solutions',
      'Proposes realistic and well-reasoned sustainability actions'
    ],
    
    crossCurricularLinks: [
      'Science - greenhouse effect and environmental systems',
      'Mathematics - interpreting climate data and graphs',
      'English - persuasive writing about environmental issues'
    ],
    
    estimatedDuration: 50,
    timeLimit: 65,
    
    extensionActivities: [
      {
        id: 'climate-action-project',
        title: 'School Climate Action Project',
        description: 'Design and implement a climate action project for your school',
        type: 'field-work',
        instructions: [
          'Conduct a climate audit of your school (energy use, waste, transport)',
          'Research best practice examples from other schools',
          'Design a climate action plan with specific, measurable goals',
          'Present your plan to school leadership',
          'Implement one action and monitor its effectiveness'
        ],
        duration: 120,
        difficulty: 'advanced'
      }
    ],
    
    tags: ['climate-change', 'environment', 'sustainability', 'great-barrier-reef', 'renewable-energy', 'geography'],
    totalPoints: 56,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },

  // Economics Exercise - Resources and Trade
  {
    id: 'year6-economics-resources-trade',
    title: 'Australia\'s Resources and Global Trade',
    description: 'Discover how Australia\'s natural resources connect us to the world through trade and commerce.',
    subject: 'economics',
    yearLevel: 6,
    difficulty: 'proficient',
    
    article: {
      id: 'article-resources-trade',
      title: 'Australia\'s Resources and Global Trade',
      content: `# Australia\'s Resources and Global Trade

Australia is often called "the lucky country" because of our incredible **natural resources**. These resources have made Australia wealthy and connected us to countries all around the world through **trade**.

## What Are Natural Resources?

Natural resources are materials found in nature that people can use to create goods and services. Australia is blessed with many different types:

### Mineral Resources
Australia has some of the world's largest deposits of valuable minerals:
- **Iron ore**: Used to make steel for buildings, cars, and machines
- **Coal**: Used for energy and making steel  
- **Gold**: Valuable metal used in jewelry, electronics, and investments
- **Bauxite**: Used to make aluminum for cans, planes, and building materials
- **Copper**: Essential for electrical wiring and plumbing
- **Lithium**: Critical for batteries in phones, laptops, and electric cars

### Energy Resources
- **Natural gas**: Clean-burning fuel for heating and electricity
- **Coal**: Still a major source of electricity in Australia
- **Uranium**: Used in nuclear power plants overseas
- **Renewable energy potential**: Abundant sun and wind for clean energy

### Agricultural Resources
- **Wheat**: One of Australia's major food exports
- **Beef**: High-quality meat exported worldwide
- **Wool**: Australian wool is prized for its quality
- **Dairy products**: Milk, cheese, and butter
- **Sugar**: Grown mainly in Queensland

## Where Are Our Resources?

Australia's resources are spread across the continent:

### Western Australia
- **Iron ore**: Pilbara region produces most of the world's iron ore
- **Gold**: Major goldfields around Kalgoorlie
- **Natural gas**: North West Shelf projects

### Queensland  
- **Coal**: Bowen Basin is a major coal-producing region
- **Bauxite**: Cape York Peninsula
- **Sugar cane**: Along the eastern coast

### New South Wales
- **Coal**: Hunter Valley region
- **Wheat and beef**: Across rural areas

### Victoria
- **Natural gas**: Bass Strait
- **Dairy**: Gippsland region
- **Wool**: Western districts

### South Australia
- **Wheat**: Across the state
- **Wine**: Barossa Valley and other regions
- **Copper**: Olympic Dam mine

### Northern Territory
- **Uranium**: Ranger mine (now closed) and Olympic Dam
- **Manganese**: Essential for steel production

### Tasmania
- **Timber**: Sustainable forestry
- **Hydroelectric power**: Clean energy from water

## What Is Trade?

**Trade** means buying and selling goods and services between different countries. Australia trades with many countries around the world.

### Exports
**Exports** are goods and services we sell to other countries:
- Iron ore to China and Japan for steel production
- Coal to Japan, China, and South Korea for energy
- Wheat to Indonesia, China, and Middle Eastern countries
- Beef to Japan, USA, and South Korea
- Education services to international students

### Imports  
**Imports** are goods and services we buy from other countries:
- Cars from Japan, Germany, and South Korea
- Electronics from China, Japan, and South Korea
- Clothing from China, Vietnam, and Bangladesh
- Coffee from Brazil and other tropical countries
- Machinery and equipment for our industries

## Our Major Trading Partners

### China
- **Australia's largest trading partner**
- Buys: Iron ore, coal, beef, wheat, wine
- Sells to us: Electronics, clothing, machinery

### Japan
- **Long-standing trade relationship**
- Buys: Iron ore, coal, beef, wheat
- Sells to us: Cars, electronics, machinery

### South Korea
- **Growing trade relationship** 
- Buys: Coal, iron ore, beef
- Sells to us: Cars, electronics, steel products

### United States
- **Important trade and security partner**
- Buys: Beef, wine, education services
- Sells to us: Technology, aircraft, entertainment

## How Trade Benefits Australia

### Economic Benefits
- **Jobs**: Mining, farming, and transport create millions of jobs
- **Income**: Export earnings help pay for imports and public services
- **Investment**: Foreign companies invest in Australian projects
- **Government revenue**: Taxes on trade fund schools, hospitals, and infrastructure

### Consumer Benefits
- **Choice**: We can buy products from around the world
- **Lower prices**: Competition keeps prices reasonable
- **Quality**: Access to the best products from different countries
- **Innovation**: New ideas and technologies from trading partners

## Challenges in Trade

### Price Volatility
- **Commodity prices** go up and down rapidly
- When prices fall, it affects jobs and government revenue
- Australia needs to diversify exports to reduce risk

### Environmental Concerns
- Mining and farming can impact the environment
- Need to balance economic benefits with environmental protection
- Climate change affects agricultural production

### Competition
- Other countries also produce similar resources
- Australia must remain competitive through efficiency and innovation
- Need to add value to raw materials rather than just exporting them

### Geopolitical Issues
- Trade disputes between major powers can affect Australia
- Need to maintain good relationships with all trading partners
- Diversifying trade relationships reduces dependence on any one country

## Value-Adding

Instead of just exporting **raw materials**, Australia is learning to add value:

### Examples of Value-Adding
- **Steel production**: Using our iron ore to make steel in Australia
- **Food processing**: Making beef jerky, canned goods, and prepared meals
- **Wine production**: Growing grapes and making world-class wine
- **Aluminum production**: Processing bauxite into finished aluminum products

### Benefits of Value-Adding
- **More jobs**: Processing creates employment opportunities
- **Higher profits**: Finished products sell for more than raw materials  
- **Economic diversification**: Less dependence on commodity prices
- **Skill development**: Workers learn advanced manufacturing skills

## The Future of Australian Trade

### Opportunities
- **Asia's growing middle class**: More demand for quality food and resources
- **Clean energy exports**: Hydrogen and renewable energy technology
- **Services trade**: Education, tourism, and professional services
- **Technology**: Using AI and robotics to make industries more efficient

### Challenges to Address
- **Sustainability**: Ensuring resource extraction doesn't harm the environment
- **Skills development**: Training workers for new technologies and industries
- **Infrastructure**: Building better ports, railways, and digital connections
- **Innovation**: Developing new products and services for export

## What This Means for Young Australians

Understanding resources and trade helps you appreciate:
- How Australia's economy works and your place in it
- Career opportunities in mining, agriculture, manufacturing, and services
- The importance of education and skills development
- Australia's role in the global economy
- The need to balance economic growth with environmental protection

Trade and resources will continue to shape Australia's future, and young Australians will play a key role in ensuring this benefits everyone while protecting our environment for future generations.`,
      subject: 'economics',
      yearLevel: 6,
      difficulty: 'proficient',
      readingTime: 20,
      wordCount: 950,
      topics: ['resources', 'trade', 'exports', 'imports', 'economy', 'mining'],
      culturalContext: ['contemporary'],
      australianCurriculum: ['ACHASSK140', 'ACHASSK141'],
      mediaResources: [
        {
          id: 'trade-flow-map',
          type: 'interactive-map',
          title: 'Australia\'s Trade Flows',
          url: '/maps/trade-flows',
          description: 'Interactive map showing imports and exports between Australia and trading partners'
        },
        {
          id: 'resource-locations',
          type: 'interactive-map',
          title: 'Australian Resource Locations',
          url: '/maps/resources',
          description: 'Map showing where different resources are found across Australia'
        },
        {
          id: 'trade-statistics',
          type: 'chart',
          title: 'Australian Trade Statistics',
          url: '/charts/trade-stats',
          description: 'Charts showing Australia\'s major exports and imports over time'
        }
      ],
      interactiveElements: ['trade-balance-calculator', 'resource-matching-game'],
      keyVocabulary: [
        {
          id: 'natural-resources',
          term: 'Natural Resources',
          definition: 'Materials found in nature that people can use to create goods and services',
          context: 'Economics and geography',
          examples: ['Australia\'s natural resources include iron ore, coal, and wheat'],
          difficulty: 2,
          subject: 'economics',
          yearLevel: 6
        },
        {
          id: 'trade',
          term: 'Trade',
          definition: 'The buying and selling of goods and services between different countries',
          context: 'International economics',
          examples: ['Australia trades iron ore with China in exchange for manufactured goods'],
          difficulty: 2,
          subject: 'economics',
          yearLevel: 6
        },
        {
          id: 'exports',
          term: 'Exports',
          definition: 'Goods and services that a country sells to other countries',
          context: 'International trade',
          examples: ['Australia\'s main exports include iron ore, coal, and beef'],
          difficulty: 3,
          subject: 'economics',
          yearLevel: 6
        },
        {
          id: 'imports',
          term: 'Imports',
          definition: 'Goods and services that a country buys from other countries',
          context: 'International trade',
          examples: ['Australia imports cars, electronics, and clothing from other countries'],
          difficulty: 3,
          subject: 'economics',
          yearLevel: 6
        },
        {
          id: 'value-adding',
          term: 'Value-Adding',
          definition: 'Processing raw materials to create more valuable finished products',
          context: 'Manufacturing and economics',
          examples: ['Making steel from iron ore is an example of value-adding'],
          difficulty: 4,
          subject: 'economics',
          yearLevel: 6
        }
      ],
      backgroundInfo: 'Australia\'s economy has historically been built on natural resource extraction and export, making us closely connected to global commodity markets.',
      discussionPrompts: [
        'How do Australia\'s natural resources affect your daily life?',
        'What are the advantages and disadvantages of relying heavily on resource exports?',
        'How might climate change affect Australia\'s role in global trade?',
        'What new industries or exports might be important for Australia\'s future?'
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    
    questions: [
      {
        id: 'q1-major-resources',
        articleId: 'article-resources-trade',
        type: 'comprehension',
        subject: 'economics',
        question: 'List Australia\'s three most important mineral resources mentioned in the article and explain what each is used for.',
        sampleAnswers: [
          'Iron ore - used to make steel for buildings, cars, and machines',
          'Coal - used for energy and making steel',
          'Gold - used in jewelry, electronics, and investments'
        ],
        skillsAssessed: ['comprehension', 'factual-recall'],
        bloomsTaxonomy: 'understand',
        points: 6,
        order: 1,
        difficulty: 'developing',
        estimatedTime: 3
      },
      {
        id: 'q2-trade-relationship',
        articleId: 'article-resources-trade',
        type: 'analysis',
        subject: 'economics',
        question: 'Analyse Australia\'s trade relationship with China. What does Australia export to China, what do we import, and why is this relationship important?',
        skillsAssessed: ['analysis', 'economic-relationships', 'trade-understanding'],
        bloomsTaxonomy: 'analyze',
        points: 8,
        order: 2,
        difficulty: 'proficient',
        estimatedTime: 5
      },
      {
        id: 'q3-benefits-challenges',
        articleId: 'article-resources-trade',
        type: 'evaluation',
        subject: 'economics',
        question: 'Compare the benefits and challenges of Australia\'s reliance on natural resource exports. Which do you think outweigh the other and why?',
        skillsAssessed: ['evaluation', 'critical-thinking', 'economic-analysis'],
        bloomsTaxonomy: 'evaluate',
        hints: [
          'Consider both economic and environmental factors',
          'Think about long-term vs short-term effects',
          'Consider what happens when resource prices change'
        ],
        points: 10,
        order: 3,
        difficulty: 'advanced',
        estimatedTime: 7
      },
      {
        id: 'q4-value-adding',
        articleId: 'article-resources-trade',
        type: 'application',
        subject: 'economics',
        question: 'Choose one Australian resource and explain how value-adding could be applied to it. What would be the benefits of this approach?',
        skillsAssessed: ['application', 'economic-thinking', 'innovation'],
        bloomsTaxonomy: 'apply',
        hints: [
          'Think about taking a raw material and processing it further',
          'Consider what products could be made from the resource',
          'Think about jobs, profits, and economic benefits'
        ],
        points: 8,
        order: 4,
        difficulty: 'proficient',
        estimatedTime: 5
      },
      {
        id: 'q5-future-trade',
        articleId: 'article-resources-trade',
        type: 'creative',
        subject: 'economics',
        question: 'Design a plan for how Australia could diversify its economy to be less dependent on traditional resource exports. Include at least three new industries or export opportunities.',
        skillsAssessed: ['creative-thinking', 'economic-planning', 'innovation', 'future-thinking'],
        bloomsTaxonomy: 'create',
        hints: [
          'Consider Australia\'s strengths beyond traditional resources',
          'Think about global trends like technology and sustainability',
          'Consider our geographic advantages and skilled workforce',
          'Think about services as well as goods'
        ],
        points: 12,
        order: 5,
        difficulty: 'advanced',
        estimatedTime: 8
      },
      {
        id: 'q6-local-connections',
        articleId: 'article-resources-trade',
        type: 'application',
        subject: 'economics',
        question: 'How does Australia\'s international trade affect your local community? Give specific examples of how global trade impacts jobs, products available, or the local economy where you live.',
        skillsAssessed: ['application', 'local-global-connections', 'economic-awareness'],
        bloomsTaxonomy: 'apply',
        hints: [
          'Think about local businesses that might be connected to exports or imports',
          'Consider the products you use and where they come from',
          'Think about jobs in your area that might be connected to trade'
        ],
        points: 8,
        order: 6,
        difficulty: 'proficient',
        estimatedTime: 5
      }
    ],
    
    learningObjectives: [
      'Identify Australia\'s major natural resources and their uses',
      'Explain how international trade works and its importance to Australia',
      'Analyse Australia\'s trading relationships with major partners',
      'Evaluate the benefits and challenges of resource-dependent economies',
      'Understand the concept of value-adding and economic diversification'
    ],
    
    assessmentCriteria: [
      'Demonstrates knowledge of Australian natural resources and their uses',
      'Explains trade relationships and their economic importance',
      'Analyses economic benefits and challenges using evidence',
      'Evaluates economic strategies and proposes realistic alternatives',
      'Makes connections between global trade and local communities'
    ],
    
    crossCurricularLinks: [
      'Geography - location of resources and trading partners',
      'Mathematics - interpreting trade statistics and economic data',
      'Science - understanding resource formation and extraction processes'
    ],
    
    estimatedDuration: 45,
    timeLimit: 60,
    
    extensionActivities: [
      {
        id: 'trade-simulation',
        title: 'International Trade Simulation',
        description: 'Role-play a trade negotiation between Australia and another country',
        type: 'presentation',
        instructions: [
          'Research a specific trade relationship (e.g., Australia-Japan)',
          'Form teams representing each country\'s interests',
          'Negotiate trade deals considering resources, needs, and economic factors',
          'Present your negotiated agreement to the class',
          'Reflect on the challenges of international trade negotiations'
        ],
        duration: 60,
        difficulty: 'advanced'
      }
    ],
    
    tags: ['resources', 'trade', 'exports', 'imports', 'economy', 'mining', 'agriculture'],
    totalPoints: 52,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]