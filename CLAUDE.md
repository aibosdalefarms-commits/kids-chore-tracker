# CLAUDE.md - Kids Chore Tracker

This document provides guidance for AI assistants working on this codebase.

## Project Overview

The **Household Chore Tracking App** is a gamified task management PWA designed to help families manage and motivate children (ages 5-12) to complete daily household chores. Children earn points for completing verified chores, which can be redeemed for avatar customizations. The app runs on a shared family device (typically a kitchen tablet).

### Key Concepts

- **Individual Points**: Personal point balance for avatar purchases
- **Family Points**: Sum of all individual points earned (used for family rewards)
- **Streaks**: Consecutive days of completing all assigned chores (7-day bonus)
- **Time Periods**: Morning, Daytime, After School, Evening - chores are filtered by current period
- **Verification**: Admin must verify chore completions before points are awarded

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React |
| Styling | Tailwind CSS |
| Avatars | DiceBear (avataaars style) |
| Animations | Confetti.js (or similar) |
| Data Storage | localStorage (Phase 1) |
| Platform | Progressive Web App (PWA) |

## Project Structure (Target)

```
kids-chore-tracker/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── common/           # Shared UI components
│   │   ├── home/             # Home screen components
│   │   ├── child/            # Child chore list view
│   │   ├── admin/            # Admin interface components
│   │   └── avatar/           # Avatar display and store
│   ├── services/
│   │   ├── dataService.ts    # Data abstraction layer
│   │   ├── avatarService.ts  # Avatar provider abstraction
│   │   └── storageService.ts # localStorage implementation
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React contexts (family, auth, etc.)
│   ├── types/                # TypeScript interfaces
│   ├── utils/                # Helper functions
│   ├── constants/            # App constants, emoji library
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── CLAUDE.md
```

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Architecture Principles

### 1. Data Service Abstraction

All data operations must go through a service interface to enable future migration from localStorage to cloud database:

```typescript
// services/dataService.ts
interface DataService {
  saveChore(chore: Chore): Promise<void>;
  getChildData(childId: string): Promise<Child>;
  updatePoints(childId: string, points: number): Promise<void>;
  listCompletions(date: Date): Promise<Completion[]>;
  // ... etc
}
```

### 2. Avatar Service Abstraction

Avatar operations use a provider interface for future replacement of DiceBear:

```typescript
// services/avatarService.ts
interface AvatarService {
  getAvatarImage(childId: string, config: AvatarConfig): string;
  getAvailableAccessories(category: string): Accessory[];
  applyAccessory(childId: string, accessoryId: string): void;
}
```

### 3. Local-First Design

- Core functionality must work offline
- PWA with service worker for caching
- All localStorage keys prefixed with `familyId` for future multi-tenancy

## Data Models

Key entities (see PRD for complete schema):

- **Family**: familyId, adminPin, familyPoints, streakBonusPoints
- **Child**: childId, name, avatarConfig, individualPoints, currentStreak
- **Chore**: choreId, name, emoji, pointValue
- **ChoreAssignment**: assignmentId, choreId, childId, daysOfWeek, timePeriods
- **Completion**: completionId, assignmentId, status ('pending'|'verified'|'adjusted')
- **TimePeriod**: periodId, startTime, endTime

## UI/UX Guidelines

### Child-Facing Interface

- **Touch targets**: Minimum 60x60px for all interactive elements
- **Visual feedback**: Immediate response to interactions
- **Minimal text**: Heavy use of icons and emojis
- **No authentication**: Single-tap access via avatar
- **Celebrations**: Confetti animations on completion milestones
- **Auto-return**: Home screen after 3 minutes of inactivity
- **Bright, colorful aesthetic** appropriate for ages 5-12

### Admin Interface

- **Utilitarian design**: Function over form
- **Desktop-first**: Optimized for keyboard/mouse
- **PIN-protected**: 4-digit numeric PIN
- **Efficient workflows**: Minimize clicks for common tasks

## Accessibility Requirements

- High color contrast ratios
- Don't rely solely on color to convey information
- Large, readable fonts
- Age-appropriate vocabulary
- Combine icons with text labels

## Performance Targets

- App load time: < 2 seconds
- UI response: < 100ms
- Animations: 60fps
- Offline capable (PWA)

## Key Business Rules

### Chore Display Logic

1. Filter by current time period (Morning/Daytime/After School/Evening)
2. Filter by current day of week
3. No grace periods - chores disappear when time period ends
4. Daily reset at midnight

### Point System

1. Child checks off chore → logged with timestamp (pending)
2. Admin verifies → points awarded
3. Points can be adjusted during verification
4. Individual points can be spent on avatar items
5. Family points = sum of all earned points (unaffected by spending)

### Streak System

1. Streak = consecutive days with ALL chores completed
2. Requires admin verification
3. 7-day streak = bonus points (admin configurable)
4. Missing any chore resets streak to 0

### Avatar Store

1. Only accessible during admin-configured times (e.g., Saturdays 9 AM)
2. Purchasing new item in category replaces old one
3. Items have individual pricing set by admin

## Code Conventions

### TypeScript

- Use strict TypeScript configuration
- Define interfaces in `src/types/`
- Avoid `any` type - use proper typing

### React Components

- Functional components with hooks
- Use custom hooks for shared logic
- Keep components focused and composable
- Use React Context for global state (family data, current child)

### Tailwind CSS

- Use utility classes directly in JSX
- Extract common patterns to component classes
- Mobile-first responsive design
- Use design tokens for consistent spacing/colors

### File Naming

- Components: PascalCase (`ChoreList.tsx`)
- Utilities/hooks: camelCase (`useTimePeriod.ts`)
- Types: PascalCase with `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE

### Testing

- Test critical business logic (point calculations, streak tracking)
- Test service layer abstractions
- Component tests for key user flows

## Security Considerations

- Admin PIN stored as hash (not plaintext)
- All data local to device (Phase 1)
- HTTPS required for PWA features
- No PII transmitted externally

## Browser Support

- Modern browsers: Chrome, Firefox, Safari, Edge
- Target: Last 2 versions of major browsers
- PWA service workers for offline support
- Specific testing needed for Mobile Safari (iOS)

## Phase 1 Scope (Current)

- All features in PRD
- Single-family installation
- Browser localStorage
- DiceBear avatars
- PWA with offline capability

## Out of Scope (v1.0)

- Multi-family authentication
- Cloud synchronization
- Push notifications
- Custom avatar graphics
- Voice feedback
- External calendar integration

## Reference Documents

- `Chore_Tracker_PRD.docx` - Full Product Requirements Document

## Development Notes

- This is a greenfield project - structure should be established following the patterns above
- Initial setup wizard guides first-time users through configuration
- Emoji picker needed for chore creation (see Appendix 12.2 in PRD for categories)
- Default time periods: Morning (6-9 AM), Daytime (9 AM-3 PM), After School (3-6 PM), Evening (6-9 PM)
