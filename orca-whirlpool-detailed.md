# Orca Whirlpool Dashboard – Cursor Project Guide

## 🧠 Project Description

We are building a **Whirlpool LP Dashboard** for Orca using:
- Next.js 14 (App Router)
- Radix UI + Tailwind CSS for styling
- Orca SDK to fetch liquidity and pool data
- Solana Wallet Adapter for wallet integration
- React Query for polling and caching

This app lets users:
- Connect their Solana wallet
- View their active Whirlpool LP positions
- Explore all active pools (TVL, APR, price)
- View detailed stats for each pool
- (Optional) Simulate rebalancing LPs

---

## 🧱 Architecture Overview

### Frontend Stack
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS + Radix UI
- **State**: React Query (for async, polling, and caching)
- **Wallet**: Solana Wallet Adapter
- **SDK**: Orca SDK (used client-side)

### API Strategy
- Primary SDK use is on the **client**
- Use **React Query** polling for live data (no native webhooks)
- Use **Next.js API routes** to cache infrequently changing data (TVL, APR)

### File Structure
```
/src
  /app
    /dashboard                # LP dashboard for wallet
    /explore                  # Pool explorer
    /explore/[poolId]         # Pool details
    /rebalance                # Optional simulator
  /components                 # UI Components (Radix + Tailwind)
  /hooks                      # Custom hooks (wallet, LP, pools)
    useWalletPositions.ts
    usePoolList.ts
  /lib                        # SDK + utility functions
    orcaClient.ts
    fetchWhirlpoolPools.ts
```

---

## ✅ Tasks & Detailed Descriptions

### Phase 1 – Setup & Wallet Integration
- **[ ] Scaffold Next.js App Router project**
  - Create base project using `npx create-next-app@latest` with App Router
  - Install Tailwind CSS, configure `tailwind.config.ts`
- **[ ] Add Solana Wallet Adapter**
  - Support Phantom, Backpack, and Solflare
  - Setup wallet provider context and connect button
- **[ ] Add layout with navigation**
  - Shared Nav with active route + wallet connection

### Phase 2 – LP Dashboard (`/dashboard`)
- **[ ] Create Dashboard route**
  - Fetch connected wallet's LP token accounts
  - Use Orca SDK to decode Whirlpool positions
- **[ ] Show LP info in cards or table**
  - Token pair, liquidity, in-range status, fee growth
  - Current tick vs user range
- **[ ] Poll data every 30s** with React Query

### Phase 3 – Pool Explorer (`/explore`)
- **[ ] Fetch list of all Whirlpool pools**
  - From Orca SDK or cached API route
- **[ ] Create pool cards with TVL, APR, fee tier**
  - Add search + filter by token
- **[ ] Implement pagination or lazy load**
  - For performance on many pools

### Phase 4 – Pool Details (`/explore/[poolId]`)
- **[ ] Dynamic route using poolId**
  - Fetch pool tick, fee tier, current price
- **[ ] Add charts (TVL, volume)** using Chart.js or Recharts
- **[ ] Add visualization of range ticks**
  - Show active LP window vs current price

### Phase 5 – Rebalance Simulator (Optional)
- **[ ] User inputs current vs target price range**
- **[ ] Simulate projected yield**
  - Show estimated APR and expected returns over time
- **[ ] Render side-by-side comparison of current vs new range**

### Phase 6 – Polish & Deployment
- **[ ] Add responsive styling for all breakpoints**
- **[ ] Add error + loading states to queries**
- **[ ] Deploy live to Vercel**
  - Add RPC endpoint and wallet configs via env vars

---

## 📏 Best Practices & Patterns

### Data Fetching & Polling
- Use **React Query** with `refetchInterval` for all live data
- Use `keepPreviousData: true` to prevent UI flicker
- Use `onAccountChange` for real-time wallet balance updates if needed

### SDK Usage
- Wrap Orca SDK setup in `/lib/orcaClient.ts`
- Create memoized instance of WhirlpoolClient
- Avoid instantiating clients inside components

### Hook Design
- Keep hooks per concern: `useWalletPositions`, `usePoolList`, `usePoolDetails`
- Co-locate hooks with their respective pages

### UI Consistency
- Use **Radix UI** primitives for consistency and accessibility
  - Dialog, Tabs, HoverCard, ScrollArea, etc.
- Wrap Radix UI with reusable components (`<PoolCard />`, `<RangeChart />`, etc.)

### Styling
- Use **Tailwind** utility classes
- Add shared styles for card layouts, buttons, and text themes
- Dark mode via Tailwind’s class strategy

### Caching Strategy
- For expensive SDK calls (e.g., fetching all pools), use Next.js `app/api/route.ts` with `unstable_cache`
- Consider SWR or Redis cache if scaling

### Code Organization
- Keep business logic in `/lib` or hooks
- Keep UI logic in `/components`
- Co-locate tests next to the components/hooks they cover

---

## 🧠 Cursor Instructions

- Scaffold each route with App Router
- Use Tailwind + Radix UI for styling and layout
- Use React Query for SDK polling (with intervals per data type)
- Fetch all data client-side via Orca SDK unless noted
- Create shared layout with Nav + wallet context
- Deploy final project via Vercel

---

## 🛠 Polling Interval Reference

| Data Type        | Interval | Tool |
|------------------|----------|------|
| Wallet balances  | 10–15s   | `onAccountChange` or polling |
| Whirlpool tick   | 5–10s    | React Query |
| Pool TVL/APR     | 60s      | Cached API route |
| Fee growth       | 30s      | React Query |


---

## ✨ UI Polish & Animation Features

To elevate the user experience and align with Orca's aesthetic, include the following UI and animation enhancements:

### 🔁 Animated Liquidity Range Slider
- On `/rebalance`, animate liquidity curves as the user adjusts min/max range
- Use `framer-motion` for smooth transitions between tick bounds
- Also useful for in-range/out-of-range visualization on `/dashboard`

### 💡 Fee Growth Highlight
- Animate fee growth values (e.g., flash green or pulse) when new data arrives
- Subtle glow or border animation to indicate change

### 📜 Shimmering Skeleton Loaders
- Add shimmer effects to LP cards, pool lists, and stats
- Tailwind-based shimmer classes or `@mantine/core` Skeleton component

### 🧊 Radix Hover Cards
- On `/explore`, show hovercard when user hovers a pool
- Include APR change, volume, and tooltips for fee tier

### 🔔 Live Toast Alerts
- Use `sonner` or `radix-toast` for alerts like:
  - “You’re out of range on USDC/SOL”
  - “Fees have accrued on your LP position”

### 🌘 Oceanic Dark Mode Toggle
- Add dark mode with an animated theme toggle
- Use a splash icon or ripple animation when switching

### 📈 Animated Pool Price Slider
- Horizontal scrollable range or chart with draggable markers
- Shows historical tick price window with animation

### 🧭 Navigation Microinteractions
- Active tab underline animation on route change
- Use `framer-motion` for ripple or scale transitions

### 🐋 Orca-Themed Visuals
- Optional background bubbles or gradient wave overlays
- Use subtle blur or opacity fade to add depth

These polish touches demonstrate attention to UX and create a memorable frontend experience for both users and interviewers reviewing the project.