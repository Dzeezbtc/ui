import { test, expect, TEST_ADDRESS } from "./fixtures.js";

/**
 * A player knocked out of a sit-and-go disappears from the table: no avatar,
 * no stack or place badge, and no vacant seat in their place. Saves a
 * screenshot under ui/screenshots/ for the PR description.
 */
const STUB = "http://localhost:8546";
const SNG_GAME_ID = "0x00000000000000000000000000000000000000000000000000000000cafe0002";
const SHOTS = new URL("../../../screenshots/", import.meta.url).pathname;
const BOT1 = "b521stubbot00000000000000000000000000000bot";
const BOT2 = "b521stubbot00000000000000000000000000000bt2";

type Json = Record<string, unknown>;

async function stubState(): Promise<Json> {
    const res = await fetch(`${STUB}/block52/pokerchain/poker/v1/game_state/${SNG_GAME_ID}`);
    return (await res.json()) as Json;
}

async function inject(gameState: Json): Promise<void> {
    await fetch(`${STUB}/__control/inject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            gameId: SNG_GAME_ID,
            frame: { event: "action_performed", gameId: SNG_GAME_ID, data: { format: "sit-and-go", variant: "texas-holdem", gameState } }
        })
    });
}

const seated = (address: string, seat: number, stack: string, status: string): Json => ({
    address,
    seat,
    stack,
    isSmallBlind: false,
    isBigBlind: false,
    isDealer: false,
    holeCards: [],
    status,
    legalActions: [],
    sumOfBets: "0",
    timeout: 0,
    signature: ""
});

test("a knocked-out sit-and-go player leaves no seat behind", async ({ page }) => {
    const base = (await stubState()).gameState as Json;
    const options = base.gameOptions as Json;

    await page.goto(`/table/${SNG_GAME_ID}`);
    await expect(page.getByTestId("scheduled-start-info")).toBeVisible({ timeout: 15_000 });

    await test.step("mid-tournament: seat 4 has just busted in 3rd", async () => {
        await inject({
            ...base,
            handNumber: 6,
            round: "end",
            nextToAct: 0,
            previousActions: [],
            results: [{ place: 3, playerId: BOT2, payout: "0" }],
            players: [seated(TEST_ADDRESS, 1, "2500", "active"), seated(BOT1, 2, "2000", "active"), seated(BOT2, 4, "0", "busted")],
            gameOptions: { ...options, scheduledStartTime: Date.now() - 20 * 60_000, sngStartTime: Date.now() - 15 * 60_000 }
        });
        // The two players still in show their stacks...
        await expect(page.locator(".badge-number", { hasText: /^1$/ })).toBeVisible({ timeout: 15_000 });
        await expect(page.locator(".badge-number", { hasText: /^2$/ })).toBeVisible();
    });

    await test.step("seat 4 is gone: no badge, no place, no vacant seat", async () => {
        await expect(page.locator(".badge-number", { hasText: /^4$/ })).toHaveCount(0);
        await expect(page.getByText(/3rd Place/)).toHaveCount(0);
        await page.screenshot({ path: `${SHOTS}sng-eliminated-seat.png` });
    });
});
