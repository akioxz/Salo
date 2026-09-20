# 📋 Requirements & Business Logic

## 1. Project Overview
- **App Name:** Salo
- **Core Purpose:** A private, two-person shared space ("Family Feed") serving as a communication layer for tracking household expenses and needs.
- **Target Users:** An OFW (Overseas Filipino Worker) and their family back in the Philippines.

## 2. Core Business Rules
- A household can have a maximum of 2 members.
- The two defined roles are `ofw` and `family`.
- It is NOT an accounting app or remittance tool. No payment gateways; it sits alongside existing padala methods.
- Posts are either "Expenses" (e.g., bought groceries) or "Needs" (e.g., school supplies).

## 3. User Stories & Processes

### Household Pairing Flow
1. User logs in (Email/OTP).
2. If the user doesn't belong to a household, they are routed to `/pairing`.
3. User selects their role and generates a 128-bit secure hex code.
4. The other user inputs the hex code to join the household.

### Feed & Posting Flow
1. Users view a combined feed of posts.
2. Users can create a post via a Floating Action Button, specifying type (expense/need), category, and an optional photo.
3. Users can react (heart/thanks) and comment on posts.

## 4. Edge Cases & Constraints
- Households are strictly capped at 2 members to preserve intimacy.
- Images uploaded must be compressed client-side before sending to Convex Storage.

## 5. V2 / Future Scope
- Push notifications for new posts/needs.
- Search and filtering by category/month.
