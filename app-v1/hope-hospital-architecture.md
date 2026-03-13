# Hope Hospital — Production Architecture Guide

> This document defines the target architecture for the full rewrite. Every structural decision made here has a reason. Read this before touching any file.

---

## Core Philosophy

The current app is **screen-centric** — built around pages. The rewrite must be **domain-centric** — built around business logic that screens merely display.

**The real test of good architecture:** Can you onboard a new developer, add a feature, or swap Appwrite for a different backend — without touching files that shouldn't be touched?

---

## Folder Structure

```
hope-hospital/
│
├── app/                                   # Expo Router ONLY — routes & layouts
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── register.tsx                   # Name + age form for new users
│   │   └── otp-verify.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                      # Home tab
│   │   ├── doctors/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── profile.tsx
│   │   └── contact.tsx
│   ├── appointment/
│   │   └── index.tsx
│   ├── notifications/
│   │   └── index.tsx
│   ├── prescriptions/
│   │   └── index.tsx
│   ├── gallery/
│   │   └── index.tsx
│   ├── _layout.tsx                        # Root layout — ONE Toaster, ONE auth gate, push token registration
│   └── index.tsx
│
├── src/
│   ├── features/                          # Domain logic — each feature is self-contained
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── PhoneInput.tsx         # Phone number input with country code
│   │   │   │   └── OtpInput.tsx           # Single shared OTP input (replaces 2 duplicates)
│   │   │   ├── hooks/
│   │   │   │   ├── useOtp.ts              # OTP logic: countdown, resend, verify
│   │   │   │   ├── useAuth.ts             # Auth state and actions
│   │   │   │   └── useSession.ts          # Session persistence and restore
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts        # All Appwrite auth calls + saveUserToSecureStore()
│   │   │   ├── stores/
│   │   │   │   └── auth.store.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── appointments/
│   │   │   ├── components/
│   │   │   │   ├── BookingForm.tsx         # Patient info form only
│   │   │   │   ├── DatePickerSection.tsx
│   │   │   │   ├── TimeSlotPicker.tsx
│   │   │   │   ├── DoctorInfoCard.tsx
│   │   │   │   ├── AppointmentCard.tsx
│   │   │   │   ├── AppointmentDetailsModal.tsx
│   │   │   │   ├── AppointmentBookingModal.tsx
│   │   │   │   ├── SuccessModal.tsx
│   │   │   │   └── ReviewModal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useBooking.ts           # Orchestrates full booking flow
│   │   │   │   ├── useGuestBooking.ts      # Guest flow: OTP → account → book
│   │   │   │   ├── useReschedule.ts
│   │   │   │   ├── useCancel.ts
│   │   │   │   └── useAppointmentStatus.ts
│   │   │   ├── services/
│   │   │   │   └── appointments.service.ts # All appointment Appwrite queries
│   │   │   ├── stores/
│   │   │   │   └── appointment.store.ts    # With 30s fetch cache
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── doctors/
│   │   │   ├── components/
│   │   │   │   ├── DoctorCard.tsx
│   │   │   │   ├── DoctorDetailSections.tsx
│   │   │   │   ├── ActionButtons.tsx
│   │   │   │   └── SkeletonCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDoctorSearch.ts
│   │   │   │   ├── useDoctorFilters.ts
│   │   │   │   └── useDoctorBooking.ts
│   │   │   ├── services/
│   │   │   │   └── doctors.service.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   ├── NotificationItem.tsx
│   │   │   │   ├── NotificationModal.tsx
│   │   │   │   ├── NotificationBadge.tsx
│   │   │   │   ├── NotificationHeader.tsx
│   │   │   │   ├── NotificationIcon.tsx
│   │   │   │   ├── NotificationActions.tsx
│   │   │   │   └── EmptyNotifications.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useNotifications.ts
│   │   │   ├── services/
│   │   │   │   ├── notifications.service.ts  # Appwrite notification queries
│   │   │   │   └── sendNotification.ts       # FCM dispatch logic
│   │   │   ├── stores/
│   │   │   │   └── notification.store.ts     # Lives here — barrel-exported for tab badge use
│   │   │   ├── types/
│   │   │   │   └── index.ts                  # Cron-compatible payload shape
│   │   │   └── index.ts                      # Re-exports unreadCount selector for shared use
│   │   │
│   │   ├── prescriptions/
│   │   │   ├── components/
│   │   │   │   └── PrescriptionCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePrescriptions.ts       # Ready for real backend
│   │   │   ├── services/
│   │   │   │   └── prescriptions.service.ts  # Replace mock data here
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   ├── PersonalInfoForm.tsx
│   │   │   │   └── SettingsItem.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useProfile.ts
│   │   │   ├── services/
│   │   │   │   └── users.service.ts          # User profile Appwrite queries
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── components/
│   │   │   │   └── StarRating.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useReview.ts
│   │   │   ├── services/
│   │   │   │   └── reviews.service.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── gallery/
│   │   │   ├── components/
│   │   │   │   ├── HospitalGallery.tsx
│   │   │   │   ├── ImageViewer.tsx
│   │   │   │   └── SkeletonImage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useGallery.ts
│   │   │   ├── services/
│   │   │   │   └── gallery.service.ts
│   │   │   └── index.ts
│   │   │
│   │   └── contact/
│   │       ├── components/
│   │       │   ├── ContactCard.tsx
│   │       │   ├── HospitalAddress.tsx
│   │       │   ├── OperatingHours.tsx
│   │       │   └── MapSection.tsx            # Re-enable only if maps package restored
│   │       ├── hooks/
│   │       │   # Empty — no async state currently. Add here if map fetching or form logic is added later.
│   │       ├── utils/
│   │       │   └── contactUtils.ts           # handlePhoneCall, handleEmailPress
│   │       └── index.ts
│   │
│   ├── shared/                               # Truly cross-feature code only
│   │   ├── components/
│   │   │   ├── CustomButton.tsx
│   │   │   ├── CustomInput.tsx
│   │   │   ├── CustomHeader.tsx
│   │   │   ├── HeaderText.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Filter.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyCard.tsx
│   │   ├── hooks/
│   │   │   ├── useAppwrite.ts                # Generic Appwrite fetch hook
│   │   │   └── useDebounce.ts
│   │   ├── services/
│   │   │   └── pushToken.service.ts          # Single push token registration point
│   │   ├── types/
│   │   │   └── index.ts                      # Replaces type.d.ts + types.ts + types/
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── timeUtils.ts                  # AM/PM parsing, 24h conversion (currently duplicated)
│   │   │   └── topDoctors.ts
│   │   └── constants/
│   │       └── index.ts                      # DEFAULT_COUNTRY_CODE = "+88", etc.
│   │
│   ├── config/
│   │   ├── appwrite.config.ts                # Appwrite client init + all collection IDs
│   │   └── hospital.config.ts                # Hospital name, contact numbers, emails, hours, address
│   │                                         # Lives here — NOT inside contact/ — because home,
│   │                                         # notifications, and other features may reference it.
│   │                                         # Putting it in a feature would break the sealed-unit rule.
│   │
│   └── __dev__/                              # Dev tools — NEVER imported in production
│       ├── SeedButton.tsx
│       ├── TestNotification.tsx
│       └── NotificationTestButton.tsx
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
└── [config files]
    ├── app.json
    ├── babel.config.js
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── metro.config.js
    └── eas.json
```

---

## The 6 Rules That Make This Production-Grade

### Rule 1 — `app/` is dumb

Route files only import from `src/features/`. No `useState` for business logic, no direct Appwrite calls, no inline styles beyond layout. If a route file exceeds ~50 lines, something is wrong.

### Rule 2 — Each feature is a sealed unit

`src/features/appointments/` knows nothing about `src/features/doctors/` except through shared types. If you deleted one feature folder, the app would still compile.

### Rule 3 — One file, one job

`appointments.service.ts` talks to Appwrite. `useBooking()` orchestrates the flow. `BookingForm.tsx` renders UI. These three responsibilities are never mixed in a single file.

### Rule 4 — Shared means truly shared

If only one feature uses it, it lives inside that feature. `shared/` is not a dumping ground — it's for things that genuinely cross feature boundaries: `OtpInput`, `pushToken.service.ts`, `CustomButton`. When in doubt, put it in the feature first.

### Rule 5 — Stores are feature-scoped

`auth.store.ts` lives in `src/features/auth/stores/`. `notification.store.ts` lives in `src/features/notifications/stores/`. The tab bar badge imports `unreadCount` via the notifications feature barrel export (`src/features/notifications/index.ts`) — it does not reach into the store directly.

### Rule 6 — `__dev__/` has a hard wall

The test/seed components currently shipping in the APK live here. A single `if (__DEV__)` in the root `_layout.tsx` is the only place they are ever conditionally rendered. They are never imported anywhere else.

---

## Current File → New Home Mapping

| Current File                                                                                      | Problem                          | New Location                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/appwrite.ts` (~950 lines)                                                                    | Everything in one file           | Split into one `*.service.ts` per feature                                                                                                                                                   |
| `components/AppointmentBookingComponents/AppointmentBooking.tsx` (~980 lines)                     | Form + OTP + services + UI mixed | Split into `useBooking` hook + `useGuestBooking` hook + `appointments.service.ts` + 5 small components                                                                                      |
| `components/Appointment/` + `components/AppointmentBookingComponents/`                            | Two folders for same feature     | Unified under `src/features/appointments/components/`                                                                                                                                       |
| OTP logic in `otp-verify.tsx` AND `AppointmentBooking.tsx`                                        | Duplicated                       | Single `src/features/auth/components/OtpInput.tsx` + `useOtp()` hook                                                                                                                        |
| `saveUserToSecureStore()` duplicated in 2 files                                                   | Duplicated                       | `src/features/auth/services/auth.service.ts`                                                                                                                                                |
| `store/auth.store.ts`                                                                             | Flat, unscoped                   | `src/features/auth/stores/auth.store.ts`                                                                                                                                                    |
| `store/appointment.store.ts`                                                                      | Flat, unscoped                   | `src/features/appointments/stores/appointment.store.ts`                                                                                                                                     |
| `store/notification.store.ts`                                                                     | Flat, unscoped                   | `src/features/notifications/stores/notification.store.ts`                                                                                                                                   |
| `type.d.ts` + `types.ts` + `types/notification.ts`                                                | 3 scattered type files           | `src/shared/types/index.ts` + each feature's own `types/index.ts`                                                                                                                           |
| `utils/` + `lib/` mixed                                                                           | No ownership rules               | Pure utils → `src/shared/utils/`, API calls → feature services                                                                                                                              |
| `config/hospitalConfig.ts`                                                                        | Root-level orphan                | `src/config/hospital.config.ts` — app-level config, not contact-feature-specific. Other features (home, notifications) may reference hospital info, so it must not live inside any feature. |
| `lib/notifications.ts` + `lib/sendNotification.ts`                                                | Split across lib                 | `src/features/notifications/services/`                                                                                                                                                      |
| `components/seedButton.tsx`, `testBtn.tsx`, `test-notification.tsx`, `NotificationTestButton.tsx` | Shipping in production           | `src/__dev__/`                                                                                                                                                                              |
| `hooks/useAppwrite.ts`                                                                            | Misplaced in root hooks          | `src/shared/hooks/useAppwrite.ts`                                                                                                                                                           |
| `utils/constants.js` + `constants/index.ts`                                                       | Two constants files              | `src/shared/constants/index.ts`                                                                                                                                                             |
| AM/PM parsing logic in `appointment.store.ts` AND `AppointmentBooking.tsx`                        | Duplicated                       | `src/shared/utils/timeUtils.ts`                                                                                                                                                             |

---

## Three Critical Details

### Push Token Registration

Must become a single `pushToken.service.ts` with a `registerPushToken()` function called in **exactly two places**:

1. Root `_layout.tsx` on mount — for users already authenticated on app boot
2. `auth.store.ts` `setSession()` action — on every successful login

Nowhere else. This fixes the current bug where only new-guest-first-booking users receive push notifications.

### The Guest Booking Flow

The most complex flow in the app. Currently buried in the 980-line component. It becomes `useGuestBooking()` — a hook that orchestrates in order:

```
form validation → OTP send → OTP verify → silent account creation → push token registration → appointment creation → notification creation
```

Each step is a separate service call. The hook is the only thing that knows the order. The UI components know nothing about this sequence.

### Appwrite Config

One file — `src/config/appwrite.config.ts` — exports a single initialized client and all collection/database ID constants. Every service file imports from it. IDs are never hardcoded anywhere else.

---

## Packages to Remove Before Rewrite

These are included in `package.json` but not used anywhere in active code. Removing them reduces APK size by ~25–40 MB.

| Package                 | Estimated Size | Status                                 |
| ----------------------- | -------------- | -------------------------------------- |
| `react-native-maps`     | ~15–25 MB      | Only in a commented-out `<MapSection>` |
| `react-native-webview`  | ~5–10 MB       | Not used in any active screen          |
| `react-native-worklets` | ~3–5 MB        | No visible use found                   |
| `expo-symbols`          | ~2 MB          | Not referenced in any screen           |

---

## app.json Fixes Required

| Issue                                                         | Fix                                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `"name": ""` — empty string                                   | Set to `"Hope Hospital"`                                          |
| `experiments.typedRoutes: false`                              | Set to `true` for type-safe routing with Expo Router              |
| `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` permissions | Remove if maps feature is dropped                                 |
| `google-services.json`                                        | Keep at project root — correct location for Expo managed workflow |

---

## Security — Do This Before Anything Else

The file `hope-hospital-af095-firebase-adminsdk-fbsvc-fe396b3ed5.json` is a **Firebase Admin SDK private key committed directly to the git repository.**

This is a live security risk. Anyone with repo access has full Firebase Admin access.

**Steps (in order):**

1. Go to Firebase Console → Project Settings → Service Accounts → invalidate and regenerate the key immediately
2. Remove the file from the repo: `git rm hope-hospital-af095-firebase-adminsdk-fbsvc-fe396b3ed5.json`
3. Purge from git history: `npx git-filter-repo --path hope-hospital-af095-firebase-adminsdk-fbsvc-fe396b3ed5.json --invert-paths`
4. Store the new key as a server-side environment variable — never in the mobile project

This is not part of the rewrite. Do it today, separately.
