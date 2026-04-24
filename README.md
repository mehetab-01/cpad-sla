# cpad-sla — Investment Portfolio Comparison

A dark-themed investment analyzer that compares Simple Interest vs Compound Interest across Fixed Deposit, Recurring Deposit, and Mutual Fund instruments.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Recharts

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build

# Preview the production build locally
npm run preview
```

## Features

- Input total capital, investment period, and minimum required return
- Configure principal, annual interest rate, and compounding frequency per instrument
- Validates that P1 + P2 + P3 = Total Capital before calculating
- Calculates SI and CI for each instrument
- Shows PASS / FAIL verdict against minimum required return
- Bar chart comparing SI vs CI per instrument
