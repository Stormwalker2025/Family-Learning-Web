/**
 * Australian Vocabulary Data
 * 澳洲本地化词汇数据集
 */

export interface VocabularyData {
  word: string
  definition: string
  chineseDefinition: string
  partOfSpeech: string
  pronunciation: string
  difficulty: number
  yearLevel: number
  category: string
  example: string
  synonyms: string[]
  antonyms: string[]
  tags: string[]
  source: string
}

// Year 3 (8岁 August) 词汇数据
export const year3Vocabulary: VocabularyData[] = [
  // 澳洲动物主题
  {
    word: 'kangaroo',
    definition: 'A large Australian animal that hops on strong back legs',
    chineseDefinition: '袋鼠，一种用强壮的后腿跳跃的大型澳洲动物',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˌkæŋɡəˈruː/',
    difficulty: 1,
    yearLevel: 3,
    category: 'Animals',
    example: 'The kangaroo hopped across the field with her joey.',
    synonyms: ['roo'],
    antonyms: [],
    tags: ['australian', 'marsupial', 'native'],
    source: 'Queensland',
  },
  {
    word: 'koala',
    definition:
      'A small grey Australian animal that lives in trees and eats eucalyptus leaves',
    chineseDefinition: '考拉，生活在树上、吃桉树叶的小型灰色澳洲动物',
    partOfSpeech: 'NOUN',
    pronunciation: '/koʊˈɑːlə/',
    difficulty: 1,
    yearLevel: 3,
    category: 'Animals',
    example: 'The koala slept in the eucalyptus tree all day.',
    synonyms: ['koala bear'],
    antonyms: [],
    tags: ['australian', 'marsupial', 'eucalyptus'],
    source: 'Queensland',
  },
  {
    word: 'wombat',
    definition:
      'A short-legged Australian animal that digs burrows in the ground',
    chineseDefinition: '袋熊，一种短腿的澳洲动物，在地下挖掘洞穴',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈwɒmbæt/',
    difficulty: 2,
    yearLevel: 3,
    category: 'Animals',
    example: 'The wombat dug a deep burrow to hide from predators.',
    synonyms: [],
    antonyms: [],
    tags: ['australian', 'marsupial', 'burrowing'],
    source: 'Queensland',
  },

  // 澳洲地理主题
  {
    word: 'outback',
    definition: 'The remote areas of Australia with very few people',
    chineseDefinition: '内陆地区，澳洲人烟稀少的偏远地区',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈaʊtbæk/',
    difficulty: 2,
    yearLevel: 3,
    category: 'Geography',
    example: 'Many unique animals live in the Australian outback.',
    synonyms: ['bush', 'wilderness'],
    antonyms: ['city', 'town'],
    tags: ['australian', 'geography', 'remote'],
    source: 'Queensland',
  },
  {
    word: 'billabong',
    definition: 'A pool of water in a dry riverbed, found in Australia',
    chineseDefinition: '比拉邦，澳洲干燥河床中的水池',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈbɪləbɒŋ/',
    difficulty: 3,
    yearLevel: 3,
    category: 'Geography',
    example:
      'The animals came to drink from the billabong during the dry season.',
    synonyms: ['waterhole'],
    antonyms: [],
    tags: ['australian', 'water', 'indigenous'],
    source: 'Queensland',
  },

  // 学校生活主题
  {
    word: 'tuckshop',
    definition:
      'A small shop in an Australian school that sells food and drinks',
    chineseDefinition: '学校小卖部，澳洲学校里售卖食物和饮料的小商店',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈtʌkʃɒp/',
    difficulty: 2,
    yearLevel: 3,
    category: 'School',
    example: 'I bought my lunch from the tuckshop today.',
    synonyms: ['canteen'],
    antonyms: [],
    tags: ['australian', 'school', 'food'],
    source: 'Queensland',
  },
  {
    word: 'mate',
    definition: 'A friend or companion, commonly used in Australia',
    chineseDefinition: '朋友，伙伴，澳洲常用词汇',
    partOfSpeech: 'NOUN',
    pronunciation: '/meɪt/',
    difficulty: 1,
    yearLevel: 3,
    category: 'Daily Life',
    example: 'My mate and I played cricket in the park.',
    synonyms: ['friend', 'buddy', 'pal'],
    antonyms: ['enemy'],
    tags: ['australian', 'friendship', 'colloquial'],
    source: 'Queensland',
  },

  // 自然主题
  {
    word: 'eucalyptus',
    definition:
      'A type of tree native to Australia with strong-smelling leaves',
    chineseDefinition: '桉树，澳洲本土树种，叶子有浓烈气味',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˌjuːkəˈlɪptəs/',
    difficulty: 3,
    yearLevel: 3,
    category: 'Nature',
    example: 'Koalas love to eat eucalyptus leaves.',
    synonyms: ['gum tree'],
    antonyms: [],
    tags: ['australian', 'tree', 'native'],
    source: 'Queensland',
  },
]

// Year 6 (11岁 Michael) 词汇数据
export const year6Vocabulary: VocabularyData[] = [
  // 科学主题
  {
    word: 'ecosystem',
    definition:
      'A community of living organisms and their environment working together',
    chineseDefinition: '生态系统，生物群落及其环境相互作用的系统',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈiːkəʊˌsɪstəm/',
    difficulty: 4,
    yearLevel: 6,
    category: 'Science',
    example: 'The Great Barrier Reef is a complex marine ecosystem.',
    synonyms: ['biome', 'habitat'],
    antonyms: [],
    tags: ['science', 'environment', 'biology'],
    source: 'Queensland',
  },
  {
    word: 'biodiversity',
    definition:
      'The variety of different species of plants and animals in an area',
    chineseDefinition: '生物多样性，某一地区不同动植物物种的多样性',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˌbaɪəʊdaɪˈvɜːsəti/',
    difficulty: 5,
    yearLevel: 6,
    category: 'Science',
    example: 'Australia has incredible biodiversity with many unique species.',
    synonyms: ['biological diversity'],
    antonyms: ['monoculture'],
    tags: ['science', 'environment', 'conservation'],
    source: 'Queensland',
  },

  // 澳洲历史主题
  {
    word: 'aboriginal',
    definition: 'Relating to the indigenous people of Australia',
    chineseDefinition: '原住民的，与澳洲土著人相关的',
    partOfSpeech: 'ADJECTIVE',
    pronunciation: '/ˌæbəˈrɪdʒənəl/',
    difficulty: 4,
    yearLevel: 6,
    category: 'History',
    example: 'Aboriginal art tells stories that are thousands of years old.',
    synonyms: ['indigenous', 'native'],
    antonyms: ['foreign', 'introduced'],
    tags: ['australian', 'indigenous', 'culture'],
    source: 'Queensland',
  },
  {
    word: 'federation',
    definition: 'The joining together of separate colonies to form one nation',
    chineseDefinition: '联邦，独立殖民地联合组成一个国家',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˌfedəˈreɪʃən/',
    difficulty: 4,
    yearLevel: 6,
    category: 'History',
    example: 'Australian Federation occurred in 1901 when the colonies united.',
    synonyms: ['union', 'confederation'],
    antonyms: ['separation', 'independence'],
    tags: ['australian', 'history', 'government'],
    source: 'Queensland',
  },

  // 地理主题
  {
    word: 'drought',
    definition: 'A long period of time with little or no rainfall',
    chineseDefinition: '干旱，长期少雨或无雨的时期',
    partOfSpeech: 'NOUN',
    pronunciation: '/draʊt/',
    difficulty: 3,
    yearLevel: 6,
    category: 'Geography',
    example: 'The drought affected farming across much of Australia.',
    synonyms: ['dry spell', 'arid period'],
    antonyms: ['flood', 'deluge'],
    tags: ['weather', 'climate', 'farming'],
    source: 'Queensland',
  },
  {
    word: 'continent',
    definition: 'One of the seven large land masses on Earth',
    chineseDefinition: '大陆，地球上七大陆地之一',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈkɒntɪnənt/',
    difficulty: 3,
    yearLevel: 6,
    category: 'Geography',
    example: 'Australia is both a country and a continent.',
    synonyms: ['landmass'],
    antonyms: ['island', 'ocean'],
    tags: ['geography', 'world', 'landform'],
    source: 'Queensland',
  },

  // 学术词汇
  {
    word: 'analyse',
    definition: 'To examine something carefully to understand it better',
    chineseDefinition: '分析，仔细检查某事物以更好地理解它',
    partOfSpeech: 'VERB',
    pronunciation: '/ˈænəlaɪz/',
    difficulty: 4,
    yearLevel: 6,
    category: 'Academic',
    example: 'Students need to analyse the data before drawing conclusions.',
    synonyms: ['examine', 'study', 'investigate'],
    antonyms: ['ignore', 'overlook'],
    tags: ['academic', 'thinking', 'study'],
    source: 'Queensland',
  },
  {
    word: 'evidence',
    definition: 'Facts or information that prove something is true',
    chineseDefinition: '证据，证明某事为真的事实或信息',
    partOfSpeech: 'NOUN',
    pronunciation: '/ˈevɪdəns/',
    difficulty: 4,
    yearLevel: 6,
    category: 'Academic',
    example: 'The scientist found evidence to support her hypothesis.',
    synonyms: ['proof', 'confirmation'],
    antonyms: ['speculation', 'assumption'],
    tags: ['academic', 'science', 'proof'],
    source: 'Queensland',
  },
]

// 组合所有词汇
export const allAustralianVocabulary: VocabularyData[] = [
  ...year3Vocabulary,
  ...year6Vocabulary,
]

// 按主题分类的词汇
export const vocabularyByCategory = {
  Animals: allAustralianVocabulary.filter(word => word.category === 'Animals'),
  Geography: allAustralianVocabulary.filter(
    word => word.category === 'Geography'
  ),
  Science: allAustralianVocabulary.filter(word => word.category === 'Science'),
  History: allAustralianVocabulary.filter(word => word.category === 'History'),
  School: allAustralianVocabulary.filter(word => word.category === 'School'),
  'Daily Life': allAustralianVocabulary.filter(
    word => word.category === 'Daily Life'
  ),
  Nature: allAustralianVocabulary.filter(word => word.category === 'Nature'),
  Academic: allAustralianVocabulary.filter(
    word => word.category === 'Academic'
  ),
}

// 按年级分类的词汇
export const vocabularyByYearLevel = {
  3: year3Vocabulary,
  6: year6Vocabulary,
}
