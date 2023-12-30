## Project Setup Guide

### Prerequisites

Before setting up the project, ensure you have Node.js and a package manager like npm, pnpm, or yarn installed on your system.

### Installation

To install the project dependencies, navigate to the project's root directory and run one of the following commands:

```bash
pnpm install
```

### Environment Variables

You need to set up environment variables for the Google client ID and secret, and the Alchemy URL. Create a `.env.local` file in the root of your project and add the following variables:

```plaintext
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALCHEMY_URL=your_alchemy_url
```

Replace `your_google_client_id`, `your_google_client_secret`, and `your_alchemy_url` with your actual credentials.

### Running the Project

To start the development server, run:

```bash
pnpm run dev
```

### Structure

The codebase is a Next.js project that integrates with Google OAuth for authentication and uses the `@0xpass/passport` and `@0xpass/passport-viem` libraries for session management and interaction with blockchain-related functionalities, such as signing messages and transactions.

- `src/app/page.tsx` contains the main page component with functions to handle Google login, OTP requests, and session management with `@0xpass/passport`. It also shows the different ways to interact with viem by using the PassportClient and WalletClient from `@0xpass/passport-viem` and `viem` respectively, this allows you to maintain all your current workflows.

- `src/app/providers.tsx` sets up the Google OAuth provider context.
- `src/app/layout.tsx` defines the root layout component that wraps around the application's content.

The application allows users to log in with Google, or request an OTP via email, and authenticate using the received OTP. Once authenticated users can interact using viem, to sign messages, transactions, and also interact with programmable actions using Passport Lambda.
