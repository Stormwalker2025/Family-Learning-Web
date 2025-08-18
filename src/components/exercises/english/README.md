# English Reading Exercise Module

This module provides a comprehensive English reading comprehension system designed for Australian students, featuring IELTS GT style questions.

## Features

### 📚 Reading Comprehension
- Article display with vocabulary highlighting
- Adjustable reading difficulty (Year 3 and Year 6)
- Australian-themed content (animals, culture, geography, etc.)

### 🎯 Question Types
1. **Multiple Choice** - Select the correct answer from 4 options
2. **True/False/Not Given** - IELTS-style judgment questions
3. **Short Answer** - Write brief responses based on the text
4. **Sentence Completion** - Fill in blanks with words from the text
5. **Matching** - Connect statements with correct options

### 📊 Progress Tracking
- Real-time progress indicators
- Time tracking with warnings
- Detailed performance analytics
- Comprehensive feedback system

### 🎨 User Experience
- Responsive design for all devices
- Clean, accessible interface
- Vocabulary assistance tools
- Interactive question components

## Components

### Core Components

#### `ReadingExercise`
Main container component that orchestrates the entire reading exercise flow.

```tsx
import { ReadingExercise } from '@/components/exercises/english'

<ReadingExercise 
  exerciseId="year3-animals-1"
  onComplete={(submission) => console.log('Completed!', submission)}
/>
```

#### `ArticleDisplay`
Displays the reading article with vocabulary highlighting and metadata.

#### `QuestionPanel`
Renders questions based on their type with appropriate UI components.

#### `ProgressBar`
Shows exercise progress, time elapsed, and completion status.

#### `ResultsSummary`
Comprehensive results display with feedback and recommendations.

### Question Type Components

Located in `./QuestionTypes/`:
- `MultipleChoice.tsx` - Radio button selection
- `TrueFalse.tsx` - Three-option judgment questions
- `ShortAnswer.tsx` - Text area for written responses
- `SentenceCompletion.tsx` - Multiple input fields for fill-in-the-blank
- `Matching.tsx` - Drag-and-drop or click-to-match interface

## Usage

### Basic Implementation

```tsx
import { ReadingExercise } from '@/components/exercises/english'

function MyReadingPage() {
  return (
    <ReadingExercise 
      exerciseId="year6-history-1"
      onComplete={(submission) => {
        // Handle completion
        console.log('Score:', submission.score)
        console.log('Feedback:', submission.feedback)
      }}
    />
  )
}
```

### API Integration

The module uses these API endpoints:

- `GET /api/exercises/english` - List all reading exercises
- `GET /api/exercises/english/[id]` - Get specific exercise
- `POST /api/exercises/english/submit` - Submit answers

### Data Structure

Reading exercises follow this structure:

```typescript
interface ReadingExercise {
  id: string
  title: string
  description?: string
  article: ReadingArticle
  questions: ReadingQuestion[]
  yearLevel: number
  totalPoints: number
  timeLimit?: number
  tags: string[]
}
```

## Content Examples

### Year 3 Level
- **Australian Animals** - Introduction to native wildlife
- **My Australian Family** - Daily life and culture
- **My School Day** - Education system and routines

### Year 6 Level
- **The First Australians** - Aboriginal and Torres Strait Islander history
- **Protecting the Great Barrier Reef** - Environmental conservation
- **Renewable Energy in Australia** - Science and sustainability

## Customization

### Adding New Question Types

1. Create a new component in `./QuestionTypes/`
2. Add the type to the `QuestionType` enum in types
3. Update `QuestionPanel.tsx` to handle the new type
4. Update the API validation logic

### Styling

The module uses Tailwind CSS with shadcn/ui components. Key design tokens:

- **Colors**: Blue (primary), Green (success), Red (error), Yellow (warning)
- **Typography**: Inter font family with responsive sizing
- **Spacing**: Consistent 4px grid system
- **Animations**: Subtle transitions for interactions

### Accessibility

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatibility

## Performance

- **Lazy Loading**: Components load only when needed
- **Memoization**: Prevents unnecessary re-renders
- **Optimized Images**: Responsive image handling
- **Bundle Splitting**: Separate chunks for question types

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

Run tests with:

```bash
npm test -- exercises/english
```

Key test areas:
- Question type rendering
- Answer validation
- Progress tracking
- API integration
- Accessibility compliance

## Contributing

When adding new content:

1. Follow Australian Curriculum standards
2. Use Australian English spelling
3. Include local cultural references
4. Test across all year levels
5. Validate with real educators

## License

Part of the Family Learning Web Platform
© 2024 - Educational use only