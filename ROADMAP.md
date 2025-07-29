# Project Roadmap: From Development to Production (v2)

This document outlines a detailed, actionable plan to transition the application from its current state to a production-ready, paid service. This updated roadmap is based on a granular analysis of the codebase, identifying both existing functionalities and areas requiring improvement or implementation.

## 1. Foundational Stability & Code Quality

**Priority: Critical**

These tasks are essential for a stable and maintainable application.

- **Task: Eliminate Build Errors**
  - **Details:** Modify `next.config.mjs` to set `ignoreDuringBuilds` for both `eslint` and `typescript` to `false`. Run `pnpm run lint` and `pnpm run build` and resolve all reported errors.
  - **Reasoning:** Ensures code quality, prevents runtime errors, and is a prerequisite for any reliable production deployment.

- **Task: Comprehensive Error Handling**
  - **Details:** Review all server actions (`lib/actions/*.ts`) and API routes (`app/api/**/*.ts`) to implement consistent and user-friendly error handling. Use `try...catch` blocks and provide clear error messages to the frontend.
  - **Reasoning:** Improves application robustness and provides a better user experience when things go wrong.

## 2. The "Wow" Onboarding Experience

**Priority: High**

First impressions matter. The goal is to get users to the "aha!" moment as quickly as possible.

- **Task: Implement AI-Powered Menu Ingestion**
  - **Details:**
    1.  Create a new component that allows users to upload a PDF or image of their existing menu.
    2.  Develop a new API endpoint that uses a multimodal AI model (like Gemini) to process the uploaded file.
    3.  The AI should extract menu categories, items, descriptions, and prices.
    4.  The extracted data should then be used to pre-populate the user's menu in the editor.
  - **Reasoning:** This is a high-impact feature that will dramatically reduce the time and effort required for users to get started, making the service much more attractive.

- **Task: Enhance the Onboarding Flow**
  - **Details:**
    - Create a multi-step onboarding wizard that guides users through creating their restaurant, uploading their logo, and choosing a menu template.
    - Integrate the new AI-powered menu ingestion as a key step in the onboarding process.
  - **Reasoning:** A guided onboarding process will improve user activation and retention.

## 3. Core Feature Polish & Enhancement

**Priority: High**

These improvements will make the core features of the application more powerful and enjoyable to use.

- **Task: Supercharge the Menu Editor**
  - **Details:**
    - Implement drag-and-drop functionality for reordering menu categories and items.
    - Add more advanced theming options, including color palettes, font choices, and layout controls.
    - Improve the real-time preview to be more interactive and accurate.
  - **Reasoning:** A powerful and intuitive menu editor is a key selling point of the application.

- **Task: Build a User-Friendly Payment & Subscription Portal**
  - **Details:**
    - Create a dedicated page where users can view their current subscription plan, see their payment history, and download invoices.
    - Implement the UI for upgrading, downgrading, or canceling a subscription.
    - Ensure the UI clearly communicates the features and limitations of each plan.
  - **Reasoning:** A clear and easy-to-use payment portal is essential for a paid service.

- **Task: Full-Fledged Language Management**
  - **Details:**
    - Replace the placeholder "Languages" tab in the dashboard with a fully functional interface.
    - Allow users to create and manage different language versions of their menus.
    - Integrate the AI translation feature to make it easy to translate menus into different languages.
  - **Reasoning:** This will make the application more appealing to a global audience.

## 4. New Revenue-Generating Features

**Priority: Medium**

These features will provide additional value to users and can be used to justify higher-tier subscription plans.

- **Task: Custom Domains**
  - **Details:** Allow users to connect their own custom domains to their menus.
  - **Reasoning:** This is a highly requested feature for businesses that want to maintain their brand identity.

- **Task: Menu Analytics**
  - **Details:** Provide users with analytics on their menu views, QR code scans, and most popular items.
  - **Reasoning:** This will help users understand their customers better and make data-driven decisions about their menu.

## 5. Final Pre-Launch Tasks

**Priority: Medium**

These are the final steps to ensure a smooth and successful launch.

- **Task: End-to-End Testing**
  - **Details:** Write comprehensive end-to-end tests for all critical user flows, including onboarding, menu creation, payment, and subscription management.
  - **Reasoning:** Ensures that the application is working as expected and reduces the risk of bugs in production.

- **Task: Deployment & Monitoring**
  - **Details:** Deploy the application to a production environment and set up monitoring and logging.
  - **Reasoning:** Ensures that the application is available, performant, and that any issues can be quickly identified and resolved.
