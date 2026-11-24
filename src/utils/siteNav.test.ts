import { NAV_ITEMS, activeNavItem, searchTarget, showsSiteNav, usdcMicroOf } from "./siteNav";

describe("activeNavItem", () => {
    it.each([
        ["/", "/"],
        ["/wallet", "/wallet"],
        ["/hands", "/hands"],
        ["/explorer", "/explorer"],
        ["/explorer/tx/ABC", "/explorer"],
        ["/explorer/hand/0x1/4", "/explorer"],
        ["/explorer/distribution", "/explorer"],
        ["/fairness", "/fairness"],
        ["/nodes", "/nodes"],
        ["/node/alpha", "/nodes"],
        ["/players/b521abc", "/players"],
        ["/awards", "/awards"],
        ["/tech-notes", "/tech-notes"]
    ])("lights the right item on %s", (pathname, expected) => {
        expect(activeNavItem(pathname)?.path).toBe(expected);
    });

    it("lights nothing on pages outside the nav", () => {
        expect(activeNavItem("/admin")).toBeUndefined();
        expect(activeNavItem("/signin")).toBeUndefined();
        expect(activeNavItem("/walletx")).toBeUndefined();
        expect(activeNavItem("/nodes-old")).toBeUndefined();
    });

    it("keeps Play, Fairness and Wallet plus More in the phone tab bar", () => {
        expect(NAV_ITEMS.filter(i => i.tab).map(i => i.path)).toEqual(["/", "/fairness", "/wallet"]);
    });

    it("puts Play and Fairness in the desktop bar, My hands with you, the network under Explore", () => {
        expect(NAV_ITEMS.filter(i => i.top).map(i => i.path)).toEqual(["/", "/fairness"]);
        expect(NAV_ITEMS.filter(i => i.group === "me").map(i => i.path)).toEqual(["/wallet", "/hands"]);
        expect(NAV_ITEMS.filter(i => i.group === "explore").map(i => i.path)).toEqual(["/explorer", "/players", "/awards", "/nodes", "/tech-notes"]);
        expect(NAV_ITEMS.filter(i => i.group === "help").map(i => i.path)).toEqual(["/how-it-works", "/faq", "/play-responsibly"]);
    });
});

describe("showsSiteNav", () => {
    it("hides on a game table but not elsewhere", () => {
        expect(showsSiteNav("/table/0xabc")).toBe(false);
        expect(showsSiteNav("/table/admin")).toBe(true);
        expect(showsSiteNav("/")).toBe(true);
        expect(showsSiteNav("/explorer")).toBe(true);
    });
});

describe("searchTarget", () => {
    const hex = "a".repeat(64);
    const addr = `b521${"q".repeat(38)}`;

    it("goes to a block for a number", () => {
        expect(searchTarget(" 1284503 ")).toBe("/explorer/block/1284503");
        expect(searchTarget("#42")).toBe("/explorer/block/42");
    });

    it("goes to a table for a 0x table ID", () => {
        expect(searchTarget(`0x${hex.toUpperCase()}`)).toBe(`/table/0x${hex}`);
    });

    it("goes to a transaction for a bare 64-hex hash", () => {
        expect(searchTarget(hex)).toBe(`/explorer/tx/${hex.toUpperCase()}`);
    });

    it("goes to a player for a b52 address", () => {
        expect(searchTarget(addr.toUpperCase())).toBe(`/players/${addr}`);
    });

    it("finds nothing for anything else", () => {
        expect(searchTarget("")).toBeUndefined();
        expect(searchTarget("aces")).toBeUndefined();
        expect(searchTarget("0x123")).toBeUndefined();
        expect(searchTarget("b521short")).toBeUndefined();
    });
});

describe("usdcMicroOf", () => {
    it("reads the usdc balance, or 0 when the wallet holds none", () => {
        expect(usdcMicroOf([{ denom: "stake", amount: "5" }, { denom: "usdc", amount: "1240500000" }])).toBe("1240500000");
        expect(usdcMicroOf([{ denom: "stake", amount: "5" }])).toBe("0");
        expect(usdcMicroOf([])).toBe("0");
    });
});
