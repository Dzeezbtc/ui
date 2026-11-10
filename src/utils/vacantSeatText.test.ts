import { joinSeatButtonLabel, vacantSeatMarker } from "./vacantSeatText";

describe("vacantSeatMarker", () => {
    it("is a + to sit at a cash table, naming the seat", () => {
        expect(vacantSeatMarker(4, false, true, false)).toEqual({ kind: "plus", joinable: true, label: "Sit in seat 4" });
    });

    it("is an EMPTY circle where seats are drawn, without naming a seat", () => {
        expect(vacantSeatMarker(4, false, true, true)).toEqual({ kind: "empty", joinable: true, label: "Open Seat" });
    });

    it("can't be taken when the seat is taken or the viewer is already seated", () => {
        expect(vacantSeatMarker(2, false, false, false)).toEqual({ kind: "plus", joinable: false, label: "Seat 2, open" });
        expect(vacantSeatMarker(3, true, true, false)).toEqual({ kind: "plus", joinable: false, label: "Seat 3, open" });
        expect(vacantSeatMarker(3, true, true, true)).toEqual({ kind: "empty", joinable: false, label: "Seat 3, empty" });
    });
});

describe("joinSeatButtonLabel", () => {
    it("names the chosen seat at a cash table", () => {
        expect(joinSeatButtonLabel(5, false)).toBe("Confirm & Join Seat 5");
    });

    it("names no seat when the seat is drawn", () => {
        expect(joinSeatButtonLabel(5, true)).toBe("Confirm & Join");
    });
});
