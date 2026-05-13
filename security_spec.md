# Security Specification for LIFE FLOW

## Data Invariants
1. All user-specific data (transactions, tasks, targets, etc.) must belong to the authenticated user.
2. Users can only read and write their own data.
3. ID fields must match a specific pattern (alphanumeric, underscores, hyphens).
4. Mandatory fields must be present and have correct types/sizes.
5. Recurring transactions must have a valid frequency.

## The "Dirty Dozen" Payloads
1. **Unauthorized Write**: Attempting to create a transaction for another user.
2. **Shadow Field Injection**: Attempting to add a field `isAdmin: true` to a category.
3. **ID Poisoning**: Using a 2KB string as a transaction ID.
4. **Invalid Type**: Sending a string for an `amount` field in a transaction.
5. **State Skipping**: (Not applicable here as much, but could be for tasks completion).
6. **Self-Promotion**: Trying to set `role: 'admin'` on a user document (though we don't have user roles yet).
7. **Orphaned Record**: Creating a transaction with a non-existent category (Actually, rules can't easily check this without O(n) reads in list, but can check on create/update for single docs).
8. **PII Leak**: Trying to read another user's profile/data.
9. **Negative Amount**: Sending a negative `amount` for an income transaction.
10. **Future Date Poisoning**: Sending a `date` string in an invalid format.
11. **Massive Payload**: Sending a 1MB string in `notes`.
12. **Timestamp Spoofing**: Sending a client-side timestamp instead of server-side (if we used timestamps).

## The Test Runner (firestore.rules.test.ts)
```typescript
// This file would be used to test the rules.
// For now, it serves as a blueprint for the testing logic.
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "remixed-project-id",
  });
});

test("should deny write if not signed in", async () => {
  const aliceDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(aliceDb.collection("users/alice/transactions").add({ amount: 100 }));
});

test("should deny write to another user's data", async () => {
  const bobDb = testEnv.authenticatedContext("bob").firestore();
  await assertFails(bobDb.collection("users/alice/transactions").add({ amount: 100 }));
});
```
