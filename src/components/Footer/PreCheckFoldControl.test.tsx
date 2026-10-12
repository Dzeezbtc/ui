import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreCheckFoldControl } from "./PreCheckFoldControl";

const renderControl = (props: Partial<React.ComponentProps<typeof PreCheckFoldControl>> = {}) => {
    const onChange = jest.fn();
    render(<PreCheckFoldControl checked={false} facingBet={false} onChange={onChange} {...props} />);
    return { onChange, box: screen.getByRole("checkbox") };
};

describe("PreCheckFoldControl (ui#388)", () => {
    it("reads Check/Fold while checking is free", () => {
        const { box } = renderControl();
        expect(box).toHaveTextContent("Check/Fold");
        expect(box).toHaveAttribute("aria-label", "Pre-select check or fold for your turn");
    });

    it("reads Fold once a bet has landed", () => {
        const { box } = renderControl({ checked: true, facingBet: true });
        expect(box).toHaveTextContent("Fold");
        expect(box).not.toHaveTextContent("Check/Fold");
        expect(box).toHaveAttribute("aria-label", "Pre-select fold for your turn");
    });

    it("reflects the ticked state for assistive tech", () => {
        expect(renderControl({ checked: false }).box).toHaveAttribute("aria-checked", "false");
    });

    it("reports ticked when checked", () => {
        expect(renderControl({ checked: true }).box).toHaveAttribute("aria-checked", "true");
    });

    it("ticks when clicked while unticked", () => {
        const { onChange, box } = renderControl({ checked: false });
        fireEvent.click(box);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("unticks when clicked while ticked (the player can change their mind)", () => {
        const { onChange, box } = renderControl({ checked: true, facingBet: true });
        fireEvent.click(box);
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it("explains the behaviour in its tooltip", () => {
        expect(renderControl().box).toHaveAttribute("title", "Checks when your turn comes if checking is free. If someone bets first, you fold.");
    });
});
