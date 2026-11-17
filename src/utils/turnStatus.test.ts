import { turnStatus, whoseTurn } from "./turnStatus";

describe("turnStatus", () => {
    it("says when it is your turn", () => {
        expect(turnStatus(3, 3)).toEqual({ mine: true, title: "Your turn", detail: "" });
    });

    it("says whose turn you are waiting on", () => {
        expect(turnStatus(5, 1)).toEqual({ mine: false, title: "Waiting", detail: "(Seat 5's turn)" });
    });

    it("says nothing between hands or when you are not seated", () => {
        expect(turnStatus(0, 1)).toBeNull();
        expect(turnStatus(-1, 1)).toBeNull();
        expect(turnStatus(4, 0)).toBeNull();
        expect(turnStatus(4, -1)).toBeNull();
    });
});

describe("whoseTurn", () => {
    it("names the seat to act, plain", () => {
        expect(whoseTurn(5)).toBe("Seat 5's turn");
    });
});
