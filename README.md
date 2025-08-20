# Family Learning Hub

Australian Family Learning & Homework Platform for Year 3 and Year 6 students.

## Students

- **August** (Year 3) - Primary learning activities
- **Michael** (Year 6) - Advanced studies and exercises

## Parents/Administrators

- **Grace** - Parent access
- **Dan** - System administrator

## Features

### Core Learning Modules

- 🇦🇺 **English Reading Practice** (IELTS GT style)
- 🔢 **Mathematics Exercises** (place value, fractions, area, perimeter, decimals)
- 📚 **HASS** (Humanities and Social Sciences) articles + questions
- 📖 **Vocabulary Builder** with CSV import support
- 📝 **Homework Assignment & Grading System**
- 📊 **Mistake Review & Learning Progress**
- 🎮 **iPad Unlock Time Rules** based on performance

### Technical Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database**: Prisma + SQLite
- **Localisation**: Australian English (en-AU)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Set up the database:

   ```bash
   npm run db:push
   npm run db:generate
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Student/parent dashboards
│   ├── exercises/         # Learning exercises
│   ├── vocabulary/        # Vocabulary management
│   ├── homework/          # Homework system
│   └── admin/             # Admin panel
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── exercises/        # Exercise-specific components
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── db/               # Database utilities
│   └── validations/      # Form validation schemas
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Development Priorities

### Phase 1 - MVP Foundation

- ✅ Project setup and configuration
- ⏳ User authentication system
- ⏳ Basic dashboard layouts
- ⏳ Database schema implementation

### Phase 2 - Core Features

- ⏳ English reading exercises
- ⏳ Mathematics practice modules
- ⏳ Vocabulary management
- ⏳ Basic homework system

### Phase 3 - Advanced Features

- ⏳ HASS content integration
- ⏳ Progress tracking & analytics
- ⏳ iPad unlock rules engine
- ⏳ Advanced grading system

## Contributing

This is a family project. For major changes, please discuss with Dan (administrator) first.

## Licence

Private family use only.
