# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Firebase Setup — Phase 1

1. __Create project & app__
    - In Firebase Console: create a project.
    - Add a Web app to get config values (apiKey, authDomain, etc.).
    - Simple: we just need these keys; no product enabled yet.

2. __Add your env vars__
    - Copy `.env.example` to `.env`.
    - Paste the values from Firebase into the `EXPO_PUBLIC_FIREBASE_*` fields.
    - Why: EXPO_PUBLIC_* is auto-exposed to the app (no extra loader needed).

3. __Install Firebase SDK__
    - Run: `npm install firebase`
    - Why: gives us `initializeApp()` and friends.

4. __App initialization (already wired)__
    - Config lives in `src/lib/firebase-config.ts`.
    - It's imported once in `app/_layout.tsx`, so Firebase initializes on app start.
    - No UI changes yet—this only connects the app to your Firebase project.

5. __Run the app__
    - `npx expo start` (restart if you change `.env`).

### Troubleshooting
- If env values seem undefined, fully restart the dev server after editing `.env`.
- `app.json` uses scheme `firebasernpoc`—no extra linking needed for basic Firebase.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
