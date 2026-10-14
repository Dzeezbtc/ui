/**
 * Tests for PreActionControls (ui#388) — the CoinPoker-style pre-action bar. The
 * button set adapts: Check/Fold·Check·Call Any when you can check; Fold·Call {amount}·
 * Call Any when you owe a bet; Fold·Call Any when you're committed with no amount owed.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { PreActionControls } from "./PreActionControls";

describe("PreActionControls", () => {
    const setup = (props: Partial<React.ComponentProps<typeof PreActionControls>> = {}) => {
        const onArm = jest.fn();
        render(
            <PreActionControls
                armed={null}
                onArm={onArm}
                canCheck={true}
                amountToCallMicro={0n}
                callAmountLabel="$3"
                {...props}
            />
        );
        return { onArm };
    };

    describe("can check", () => {
        it("shows Check/Fold, Check and Call Any", () => {
            setup({ canCheck: true });
            expect(screen.getByText("Check/Fold")).toBeInTheDocument();
            expect(screen.getByText("Check")).toBeInTheDocument();
            expect(screen.getByText("Call Any")).toBeInTheDocument();
            expect(screen.queryByText("Fold")).not.toBeInTheDocument();
        });
        it("arms check-fold / check / call-any", () => {
            const { onArm } = setup({ canCheck: true });
            fireEvent.click(screen.getByText("Check/Fold"));
            fireEvent.click(screen.getByText("Check"));
            fireEvent.click(screen.getByText("Call Any"));
            expect(onArm.mock.calls.map(c => c[0])).toEqual(["check-fold", "check", "call-any"]);
        });
    });

    describe("owe a bet", () => {
        it("shows Fold, Call {amount} and Call Any — never Check", () => {
            setup({ canCheck: false, amountToCallMicro: 3_000_000n, callAmountLabel: "$3" });
            expect(screen.getByText("Fold")).toBeInTheDocument();
            expect(screen.getByText("Call $3")).toBeInTheDocument();
            expect(screen.getByText("Call Any")).toBeInTheDocument();
            expect(screen.queryByText("Check")).not.toBeInTheDocument();
            expect(screen.queryByText("Check/Fold")).not.toBeInTheDocument();
        });
        it("arms fold / call-exact / call-any", () => {
            const { onArm } = setup({ canCheck: false, amountToCallMicro: 3_000_000n, callAmountLabel: "$3" });
            fireEvent.click(screen.getByText("Fold"));
            fireEvent.click(screen.getByText("Call $3"));
            fireEvent.click(screen.getByText("Call Any"));
            expect(onArm.mock.calls.map(c => c[0])).toEqual(["fold", "call-exact", "call-any"]);
        });
    });

    describe("committed, nothing owed (waiting on a possible raise)", () => {
        it("shows only Fold and Call Any — no exact call, no Check", () => {
            setup({ canCheck: false, amountToCallMicro: 0n });
            expect(screen.getByText("Fold")).toBeInTheDocument();
            expect(screen.getByText("Call Any")).toBeInTheDocument();
            expect(screen.queryByText(/Call \$/)).not.toBeInTheDocument();
            expect(screen.queryByText("Check")).not.toBeInTheDocument();
        });
    });

    it("clicking the armed button disarms it (null)", () => {
        const { onArm } = setup({ armed: "check-fold", canCheck: true });
        fireEvent.click(screen.getByText("Check/Fold"));
        expect(onArm).toHaveBeenCalledWith(null);
    });

    it("reflects the armed state via aria-checked", () => {
        setup({ armed: "call-any", canCheck: true });
        expect(screen.getByLabelText("Pre-select Call Any for your turn")).toHaveAttribute("aria-checked", "true");
        expect(screen.getByLabelText("Pre-select Check/Fold for your turn")).toHaveAttribute("aria-checked", "false");
    });
});
