# Safe Device Settings

A small TypeScript module that safely updates device settings. It validates the request, checks permissions, handles stale updates using the record version, and makes sure the original input objects are not changed.

## Commands

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Project Information

* **Time spent:** ~45 minutes
* **Unfinished work:** None. All required functionality and tests are implemented.
* **Known limitation:** The update is handled in memory only. There is no database or persistence layer because that was outside the scope of the exercise.
* **Design choices:**

  * Checks are performed in the required order: permission, request/settings validation, device ID, and version.
  * Zod is used to validate the untrusted request at runtime and reject invalid or unknown fields.
  * The update is treated as a partial update, so only the settings provided in the request are changed.
  * A new record is returned instead of modifying the original `current`, `actor`, or `request` objects.
  * The version is incremented only after all validation checks pass.

## UI Save Flow

* Use clear labels for the Language and Volume controls.
* Make all controls and the Save button usable with keyboard navigation.
* Show a pending state while the save request is being processed and prevent duplicate submissions.
* Show a clear validation message if the submitted values are invalid.
* If the server returns `409 CONFLICT`, tell the user that the device was changed by someone else and allow them to reload the latest values.
* Keep form edits separate from the last confirmed saved values while the request is pending.
* Only show the new values as saved after receiving a successful `200` response.

## AI Tools / External Code

I used ChatGPT only for help with the Zod schema structure and for coming up with test cases for the different validation scenarios. The implementation was reviewed and checked manually and a bit to generate the Readme just to put it in a better way(Explanation wise).

## Manually Checked

I manually checked the validation rules, validation order, partial update behavior, rejection of invalid values and unknown fields, input immutability, TypeScript compilation, and Vitest test results.
