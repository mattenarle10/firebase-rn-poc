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


## Firebase RN POC 

- [ ] Make a Firebase project + add a Web app (this gives you the keys)
- [ ] Copy `.env.example` → `.env` and paste into `EXPO_PUBLIC_FIREBASE_*`
- [ ] Install deps: `npm install` (we already added Firebase SDK)
- [ ] Run it: `npx expo start` (restart after editing `.env`)

Quick refs
- __Config__: `src/lib/firebase-config.ts`
- __Init import__: `app/_layout.tsx`
- __Env file__: `.env` (do not commit secrets)

Next (optional, pick what you like ✨)
- [ ] Enable Email/Password in Firebase Authentication
- [ ] Add simple sign up / sign in screens (uses `firebase/auth`)
- [ ] Enable Google provider if needed
- [ ] Enable Facebook provider (cute bonus!)
  - Make a Facebook app at developers.facebook.com
  - Copy App ID + Secret into Firebase > Authentication > Sign-in method > Facebook
  - Save. Done for config. We can wire the OAuth flow later 💙

Troubleshooting
- If env vars are undefined, fully restart the dev server.
- `measurementId` is optional (web only).
- `app.json` scheme `firebasernpoc` is fine for this POC.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
