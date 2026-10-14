/**
 * Tests for PreActionControls (ui#388) — the CoinPoker-style three-button pre-action
 * bar: Check/Fold, a context middle (Check | Call {amount}), and Call Any; arming is
 * mutually exclusive and toggles off.
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
                facingNoBet={true}
                callAmountLabel="$3"
                {...props}
            />
        );
        return { onArm };
    };

    it("always shows Check/Fold and Call Any", () => {
        setup();
        expect(screen.getByText("Check/Fold")).toBeInTheDocument();
        expect(screen.getByText("Call Any")).toBeInTheDocument();
    });

    it("middle is Check when checking is free", () => {
        setup({ facingNoBet: true });
        expect(screen.getByText("Check")).toBeInTheDocument();
        expect(screen.queryByText(/Call \$/)).not.toBeInTheDocument();
    });

    it("middle is Call {amount} when facing a bet", () => {
        setup({ facingNoBet: false, callAmountLabel: "$3" });
        expect(screen.getByText("Call $3")).toBeInTheDocument();
        expect(screen.queryByText("Check")).not.toBeInTheDocument();
    });

    it("arms check-fold on click", () => {
        const { onArm } = setup();
        fireEvent.click(screen.getByText("Check/Fold"));
        expect(onArm).toHaveBeenCalledWith("check-fold");
    });

    it("arms the context middle: check when free, call-exact when facing a bet", () => {
        const a = setup({ facingNoBet: true });
        fireEvent.click(screen.getByText("Check"));
        expect(a.onArm).toHaveBeenCalledWith("check");

        const b = setup({ facingNoBet: false, callAmountLabel: "$3" });
        fireEvent.click(screen.getByText("Call $3"));
        expect(b.onArm).toHaveBeenCalledWith("call-exact");
    });

    it("arms call-any on click", () => {
        const { onArm } = setup();
        fireEvent.click(screen.getByText("Call Any"));
        expect(onArm).toHaveBeenCalledWith("call-any");
    });

    it("clicking the armed button disarms it (null)", () => {
        const { onArm } = setup({ armed: "check-fold" });
        fireEvent.click(screen.getByText("Check/Fold"));
        expect(onArm).toHaveBeenCalledWith(null);
    });

    it("reflects the armed state via aria-checked", () => {
        setup({ armed: "call-any" });
        const callAny = screen.getByLabelText("Pre-select Call Any for your turn");
        expect(callAny).toHaveAttribute("aria-checked", "true");
        const checkFold = screen.getByLabelText("Pre-select Check/Fold for your turn");
        expect(checkFold).toHaveAttribute("aria-checked", "false");
    });
});
