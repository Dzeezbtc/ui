import { firstFreeSeatButton, openFirstFreeSeat } from "./freeSeat";

const seat = (disabled: boolean, onClick: () => void): HTMLElement => {
    const wrap = document.createElement("div");
    wrap.setAttribute("data-part", "vacant-seat");
    const b = document.createElement("button");
    b.disabled = disabled;
    b.addEventListener("click", onClick);
    wrap.appendChild(b);
    return wrap;
};

describe("openFirstFreeSeat", () => {
    it("presses the first seat that can be joined", () => {
        const root = document.createElement("div");
        const taken = jest.fn();
        const free = jest.fn();
        root.append(seat(true, taken), seat(false, free));
        expect(openFirstFreeSeat(root)).toBe(true);
        expect(taken).not.toHaveBeenCalled();
        expect(free).toHaveBeenCalledTimes(1);
    });
    it("does nothing when no seat is free", () => {
        const root = document.createElement("div");
        root.append(seat(true, jest.fn()));
        expect(firstFreeSeatButton(root)).toBeNull();
        expect(openFirstFreeSeat(root)).toBe(false);
    });
});
