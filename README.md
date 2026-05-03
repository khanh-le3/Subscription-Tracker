# SubManager

SubManager is a mobile app for tracking subscriptions, monitoring recurring costs, and staying ahead of renewals.
It is designed to give users a clear, fast view of what they are spending every month and year, with simple tools to add, browse, and analyze services in one place.

## Why SubManager

Subscription spending is easy to lose track of across streaming platforms, productivity tools, and SaaS services.
SubManager helps by centralizing everything into a single dashboard:

- See all active subscriptions in one list
- Track upcoming renewals
- Monitor monthly and yearly expenditure
- Review spending insights by month and category

## Core Features

- Secure authentication with Clerk (sign up, sign in, verification flow)
- Add new subscriptions with custom:
  - name
  - price
  - start date (`DD/MM/YYYY`)
  - billing cycle (monthly/yearly)
  - category
- Expandable subscription cards with key details
- Delete subscriptions from list view
- Search subscriptions by name, category, or plan
- Insights dashboard with:
  - highest monthly-equivalent spend
  - average spend per service
  - monthly spending trend chart
  - category spending breakdown
- Persistent local storage (data remains after app restart)

## Tech Stack

- Expo + React Native
- Expo Router
- Clerk authentication
- NativeWind + Tailwind CSS
- AsyncStorage for persistence
- SVG-based chart rendering for insights

## Getting Started

### Prerequisites

- Node.js and npm
- Expo CLI tooling
- A Clerk project/publishable key

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Run the app

```bash
npm run start
```

Optional shortcuts:

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

### Lint

```bash
npm run lint
```

## Build and Release

### Build Android (EAS)

```bash
eas build --platform android --profile production --clear-cache
```

### Submit to Google Play

```bash
eas submit -p android --latest
```

Recommended: submit to Internal Testing first.

## Project Notes

- App package ID: `com.ApexSoftDev.submanager`
- Deep link scheme: `submanager`
- Subscription data is currently device-local (no backend sync yet)
- Android packaging exclusions are configured in `app.json` via `expo-build-properties` to prevent Gradle merge-resource conflicts

## License

Private project.
