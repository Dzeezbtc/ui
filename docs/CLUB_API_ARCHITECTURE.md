# Data flow: the app talks to the club API only

Decided in Dzeezbtc/block52-club#54. The full version lives in that repo's `docs/ARCHITECTURE.md`; this is what it means
for this app.

```
this app ──REST──► club API (TypeScript) ──gRPC──► pokerchain node     reads: balances, table views, games, history
                          └──────HTTPS──► Go signer (DO Function)      writes: table actions, WebSocket query signature
```

## What changes for this app

- **New code reads through the club API** (`VITE_CLUB_SERVICE_URLS`, first entry), not the node. No new direct use of
  `currentNetwork`, `getCosmosClient` or the node's REST or RPC.
- **No node or network selector.** The header's node dropdown and block-height poll are gone.
- **Two ways in** (`/signin`):
  - the **built-in wallet** (key in this browser): unchanged, still talks to the node directly for now;
  - a **club account** (username and password): Block52 holds the key. Game actions, join, leave, top-up and the table
    WebSocket signature go to the club API (`/custody/…`), which forwards them to the Go signer. Nothing is signed in
    the browser (`src/utils/custody/session.ts`).
- **The Game Wallet panel** is where the account shows: username, address, USDC balance, Deposit and Sign out. A club
  account has no seed phrase, so it shows no create, import, seed settings, withdraw or send.
- **The browser holds only a player token.** Never put the signer's platform secret or any key material in the app.

## Already on the API

| Need | Route |
|---|---|
| Sign up, sign in | `POST /auth/register`, `POST /auth/password` |
| Table action, account, WS signature | `POST /custody/Perform`, `GetAccount`, `WsAuth` |
| Balance | `GET /chain/balance/:address` |
| Recent transactions | `GET /chain/transactions/:address` |
| Tables (game list and state), filterable by club | coming: the API serves them so a club can filter; the app does not read tables from the node |


## Still read from the node directly (to move, one at a time; about 48 files)

The game list and table state (including the WebSocket; these go through the API so clubs can filter), the explorer, hand history and replay, profiles, and the balance
in the table header (the Game Wallet panel now reads it from the API). Track them in block52-club#54. Withdrawals for club accounts are not built.

When you move a read, add the route to the API first, then switch the hook, and keep the CLAUDE.md type rules: the
response shapes come from the SDK types, with no defaults added in the app.
