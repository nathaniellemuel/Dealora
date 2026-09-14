# Dealora

A decentralized agreement platform for clients and freelancers.

Dealora turns freelance project requirements into a structured scope of work and keeps a verifiable record of it on BOT Chain.

## Problem

Freelance work often starts in chat. Requirements shift, payment terms stay vague, and neither side keeps a copy of the original terms both can trust. When a dispute comes up, there is no shared reference for what was agreed.

Dealora addresses this by writing the agreement down in a fixed structure and storing its fingerprint on-chain.

## How it works

1. Connect wallet. Client and freelancer sign in with MetaMask. Each wallet address serves as that party's identity on the agreement.
2. Describe the project. Enter deliverables, timeline, payment terms, and other requirements in plain words.
3. Review the scope of work. Dealora organizes the description into a structured scope both sides can read and correct.
4. Lock the agreement. Once both sides accept, the agreement fingerprint is recorded through a smart contract on BOT Chain.
5. Verify later. Anyone with the agreement ID or transaction hash can pull the on-chain record and compare it against the original.

## Features

- MetaMask wallet connection for clients and freelancers
- AI-assisted scope of work generation from a plain project description
- Shared agreement document for both parties
- Agreement status tracking (draft, pending, locked)
- On-chain record of the agreement fingerprint
- Verification by agreement ID or transaction hash

## Scope of work

A short brief such as:

> Build a three-page React landing page, deliver it in two weeks, and pay $300.

becomes a structured draft with sections such as:

- Deliverables
- Timeline
- Payment terms
- Revision policy
- Project summary

Both sides review the draft before anything is written on-chain. The AI structures the text. The chain stores the proof.

## On-chain record

Dealora does not store the full agreement text on-chain. The smart contract stores the agreement hash together with the agreement ID, the two wallet addresses, and the timestamp.

This keeps transaction costs down while leaving a tamper-evident reference. If the locked scope changes by a single word, its hash no longer matches the stored value.

A stored record contains:

```text
agreementId   0x7f3a…c91d
sowHash       0x9be2…44a0
client        0x1a2b…3c4d
freelancer    0x5e6f…7a8b
lockedAt      2026-09-14T10:00:00Z
txHash        0x4d21…f7e9
```

## Architecture

```text
Client / Freelancer
        |
        v
   Dealora Web App
        |
   +----+----+
   |         |
   v         v
   AI     MetaMask
   |         |
   v         v
 SoW      Wallet
 draft   connection
             |
             v
      Smart Contract
             |
             v
         BOT Chain
```

## Tech stack

- Backend: Laravel 13 on PHP 8.5, SQLite by default
- Frontend: React 19 with Vite
- Styling: Tailwind CSS v4 with DaisyUI v5
- Type: Geist Sans and Geist Mono, self-hosted
- Icons: Heroicons
- Smart contract: Solidity
- Chain: BOT Chain
- Wallet: MetaMask
- AI provider: to be configured

## Deployment

### BOT Chain Testnet

- Network: BOT Chain Testnet
- Chain ID: 968
- Contract address: Coming soon

### BOT Chain Mainnet

- Network: BOT Chain Mainnet
- Chain ID: 677
- Contract address: Coming soon

## Getting started

Prerequisites: PHP 8.3 or higher with the `pdo` and `sqlite` extensions, Composer, and Node.js.

Clone the repository:

```bash
git clone https://github.com/nathaniellemuel/Dealora.git
cd Dealora
```

Option A, full setup in one command:

```bash
composer setup
```

This installs PHP and JS dependencies, copies `.env`, generates the app key, runs migrations, and builds frontend assets.

Option B, step by step:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
npm install
npm run build
```

Run the app for development:

```bash
composer dev
```

This starts the Laravel server, queue listener, log tail, and Vite dev server together. Open the URL printed in the terminal, usually `http://localhost:8000`.

Run the test suite:

```bash
php artisan test
```

## Project structure

```text
app/               Laravel application code
routes/web.php     Web routes (landing page at /)
resources/views/   Blade shell for the landing page
resources/js/      React entry and components
resources/css/     Tailwind and DaisyUI setup
database/          Migrations, factories, seeders
tests/             Feature and unit tests
```

The landing page lives in `resources/js/components/App.jsx` and mounts into `resources/views/welcome.blade.php`. The in-app workspace at `/app` is planned and not built yet.

## Roadmap

- Two-party wallet approval before an agreement can lock
- Milestone-based agreements with separate acceptance per stage
- PDF agreement export with QR code linking to the on-chain record
- Crypto escrow held in contract until delivery is accepted
- Dispute notes logged against the locked terms
- Agreement history and per-wallet overview

## Hackathon

Dealora was built for Girl Meets Tech Build Week Hackathon Vol.2. The goal is a working frontend connected to a deployed contract on BOT Chain, with the main action (create scope, lock agreement, verify record) usable end to end.

## License

MIT License. See `LICENSE` for details.
