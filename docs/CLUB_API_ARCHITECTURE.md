# Data flow: the app talks to the club API only

Decided in Dzeezbtc/block52-club#54. The full version lives in that repo's `docs/ARCHITECTURE.md`; this is what it means
for this app.

```
                ┌──REST──► club API (TypeScript)   everything that is not a game action:
                │                 │                sign-up and login, balances, tables, history, clubs
this app ───────┤                 └─gRPC──► pokerchain node (reads)
                │
                └──REST──► Go functions (signer)   game actions only: signs, then broadcasts to the node over gRPC
```

## What changes for this app

- **New code reads through the club API** (`VITE_CLUB_SERVICE_URLS`, first entry), not the node. No new direct use of
  `currentNetwork`, `getCosmosClient` or the node's REST or RPC.
- **No node or network selector.** The header's node dropdown and block-height poll are gone.
- **Two ways in** (`/signin`):
  - the **built-in wallet** (key in this browser): unchanged, still talks to the node directly for now;
  - a **club account** (username and password): Block52 holds the key. Sign-in goes to the club API, which returns a
    player token. Game actions, join, leave, top-up and the table WebSocket signature go **straight to the Go function**
    (`VITE_SIGNER_URL`) with that token; it signs and broadcasts over gRPC. The club API is not in the game path, and
    nothing is signed in the browser (`src/utils/custody/session.ts`).
- **The Game Wallet panel** is where the account shows: username, address, USDC balance, Deposit and Sign out. A club
  account has no seed phrase, so it shows no create, import, seed settings, withdraw or send.
- **The browser holds only a player token.** Never put the signer's admin token or any key material in the app: the
  admin token makes accounts and freezes them, and only the club API holds it.

## Already on the API

| Need | Route |
|---|---|
| Sign up, sign in | `POST /auth/register`, `POST /auth/password` |
| Table action, account, WS signature | Go function: `POST /Perform`, `/GetAccount`, `/WsAuth` (not the club API) |
| Balance | `GET /chain/balance/:address` |
| Recent transactions | `GET /chain/transactions/:address` |
| Tables (the lobby list, table picker, table admin) | `GET /chain/tables`: `{ games: GameListItem[] }`, each with `currentPlayers` (`useFindGames`) |


## Still read from the node directly (to move, one at a time; about 48 files)

A single table's live state (the WebSocket; how it should reach the app is open in #54), the explorer, hand history and replay, profiles, and the balance
in the table header (the Game Wallet panel now reads it from the API). Track them in block52-club#54. Withdrawals for club accounts are not built.

When you move a read, add the route to the API first, then switch the hook, and keep the CLAUDE.md type rules: the
response shapes come from the SDK types, with no defaults added in the app.
