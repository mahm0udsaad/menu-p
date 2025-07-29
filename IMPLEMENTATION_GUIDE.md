# AI Developer Implementation Guide

This document provides a technical, step-by-step guide for an AI developer to implement the features and fixes outlined in `ROADMAP.md`. It includes recommendations for libraries, SDKs, and specific implementation strategies.

---

## 1. Foundational Stability & Code Quality

**Objective:** Achieve a clean, error-free build to ensure application stability.

### Task: Eliminate Build Errors

1.  **Modify Configuration:**
    *   Open `next.config.mjs`.
    *   Locate the `eslint` and `typescript` sections.
    *   Change `ignoreDuringBuilds: true` to `ignoreDuringBuilds: false` for both.

2.  **Identify Errors:**
    *   Run the command `pnpm run lint` in the terminal. This will list all ESLint errors (styling, best practices).
    *   Run the command `pnpm run build`. This will fail, but it will report all TypeScript type-checking errors.

3.  **Fix Errors Systematically:**
    *   **TypeScript Errors (`*.ts`, `*.tsx`):** These are the most critical. Common errors will include:
        *   `Property '...' does not exist on type '...'`: This often happens with objects that are not strictly typed. Ensure all data fetched from Supabase or passed between components has a defined TypeScript `interface` or `type`.
        *   `Argument of type '...' is not assignable to parameter of type '...'`: Check that the data you are passing to functions or components matches their defined types.
        *   `Object is possibly 'null' or 'undefined'`: Use optional chaining (`?.`) or add checks to ensure an object is not null before accessing its properties (e.g., `if (user) { ... }`).
    *   **ESLint Errors:** These are often related to code style, unused variables, or missing dependencies in `useEffect` hooks. Many can be fixed automatically by running `pnpm run lint -- --fix`.

---

## 2. The "Wow" Onboarding Experience

**Objective:** Create a seamless onboarding flow that uses AI to minimize user effort.

### Task: Implement AI-Powered Menu Ingestion

**Recommended SDKs/Libraries:**
*   **AI:** `@google/generative-ai` for access to a multimodal model like Gemini.
*   **File Upload:** A simple `<input type="file">` will suffice, managed with React state.

**Implementation Steps:**

1.  **Create the UI Component (`components/ai-menu-importer.tsx`):**
    *   Build a modal or a section in the onboarding flow with a file input that accepts PDF and image formats (`.pdf`, `.png`, `.jpg`).
    *   Manage the selected file in the component's state. Show a loading indicator while the AI is processing.

2.  **Develop the Backend API Route (`app/api/ai/ingest-menu/route.ts`):**
    *   This route will receive the uploaded file.
    *   Use the `@google/generative-ai` SDK to interact with a multimodal model (e.g., `gemini-pro-vision`).
    *   Construct a prompt that instructs the AI to act as a menu data extractor. The prompt should include the image/PDF and ask for a JSON output.
    *   **Prompt Example:**
        ```
        "You are a highly accurate menu parsing assistant. Analyze the provided menu image and extract all categories, items, descriptions, and prices. Return the data in the following JSON format. If a price or description is not present for an item, set its value to null.

        [ { "category_name": "Appetizers", "items": [ { "name": "Garlic Bread", "description": "Toasted bread with garlic butter", "price": 5.99 }, ... ] }, ... ]"
        ```
    *   The API should stream the JSON response back to the client to provide a responsive user experience.

3.  **Integrate Frontend and Backend:**
    *   When the user uploads a file, the frontend component sends it to the new API endpoint.
    *   The component listens to the streamed response from the API.
    *   Once the full JSON is received, use the data to populate the menu editor state. You can call the `setMenuData` function in `MenuEditorClient` (you will need to pass it down as a prop).

---

## 3. Core Feature Polish & Enhancement

**Objective:** Elevate the core user experience to a professional level.

### Task: Supercharge the Menu Editor

**Recommended SDKs/Libraries:**
*   **Drag-and-Drop:** `react-dnd` and `react-dnd-html5-backend`. **Note:** These are already listed as dependencies in `package.json`, so you just need to implement them.

**Implementation Steps:**

1.  **Implement Drag-and-Drop:**
    *   Wrap your menu categories and menu items in `react-dnd`'s `useDrag` and `useDrop` hooks.
    *   Refer to the `react-dnd` documentation for examples of reordering items within a list.
    *   When a drop event occurs, update the `display_order` of the affected items and save the changes to the database via a server action.

2.  **Advanced Theming:**
    *   Create a new component, `components/editor/theme-editor.tsx`.
    *   Add controls for selecting primary/secondary fonts (from Google Fonts), and color pickers for background, text, and accent colors.
    *   Store the selected theme settings as a JSON object in the `published_menus` table (a `theme_settings` column could be added).
    *   The menu preview component should read these theme settings and apply them dynamically using CSS variables.

### Task: Build a User-Friendly Payment & Subscription Portal

**Implementation Steps:**

1.  **Create a `Billing` Tab in the Dashboard:**
    *   Add a new "Billing" or "Subscription" tab to `components/dashboard-client.tsx`.

2.  **Display Plan Information:**
    *   Fetch the user's current plan (`free` or `paid`) from the `restaurants` table.
    *   Create a component that clearly displays the current plan and its limits (e.g., number of menus).

3.  **Show Payment History:**
    *   Use the `getUserPayments` server action (from `lib/actions/payment.ts`) to fetch a list of the user's past payments.
    *   Display the payments in a table with the date, amount, and status.

4.  **Implement Upgrade/Downgrade Logic:**
    *   Create "Upgrade" buttons that trigger the `createPaymobPayment` server action.
    *   For cancellations, you will need to add a server action that updates the user's plan in the `restaurants` table and potentially deactivates some of their menus if they exceed the free plan's limits.

---

## 4. Testing and Deployment

**Objective:** Ensure the application is bug-free and ready for production users.

**Recommended Tools:**
*   **End-to-End Testing:** [Cypress](https://www.cypress.io/) or [Playwright](https://playwright.dev/). They are excellent for simulating real user flows in a browser.
*   **Deployment:** [Vercel](https://vercel.com/). It's the platform Next.js is built for and provides seamless deployment, automatic scaling, and CI/CD.

**Implementation Steps:**

1.  **Set up a Testing Framework:**
    *   Install Cypress or Playwright as a dev dependency.
    *   Create test files for critical user journeys (e.g., `signup.cy.ts`, `create-menu.cy.ts`).

2.  **Deploy to Vercel:**
    *   Create a new project on Vercel and link it to your Git repository.
    *   Vercel will automatically detect that it's a Next.js project and configure the build settings.
    *   Add your environment variables (Supabase URL, API keys, etc.) to the Vercel project settings.
    *   Every `git push` will trigger a new deployment.
