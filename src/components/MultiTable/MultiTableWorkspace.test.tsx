import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MultiTableWorkspace } from "./MultiTableWorkspace";
import { TableSessionsProvider } from "../../context/tableSessions/TableSessionsContext";

// The live table subtree is heavy and irrelevant to the workspace's own
// behaviour (seeding, visibility, pill bar vs single-table, the picker), so we
// stub it. Each stub is renderless or a marker so we can assert what mounted.
jest.mock("../playPage/Table", () => ({
    __esModule: true,
    default: ({ tableId }: { tableId?: string }) => <div data-testid={`table-${tableId}`} />
}));
jest.mock("../../context/GameStateContext", () => ({
    GameStateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
jest.mock("../../context/ActionSubmitContext", () => ({
    ActionSubmitProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
jest.mock("./TableStatusReporter", () => ({ TableStatusReporter: () => null }));
jest.mock("./MultiTablePicker", () => ({
    MultiTablePicker: ({ onPick }: { onPick: (id: string, name?: string) => void }) => (
        <button data-testid="picker-pick" onClick={() => onPick("table-two", "Two")}>
            pick table two
        </button>
    )
}));

const renderAt = (id: string) =>
    render(
        <MemoryRouter initialEntries={[`/table/${id}`]}>
            <Routes>
                <Route
                    path="/table/:id"
                    element={
                        <TableSessionsProvider>
                            <MultiTableWorkspace />
                        </TableSessionsProvider>
                    }
                />
            </Routes>
        </MemoryRouter>
    );

describe("MultiTableWorkspace", () => {
    beforeEach(() => {
        try {
            localStorage.clear();
        } catch {
            /* ignore */
        }
    });

    it("seeds the route id and renders a single table like today (no pill bar)", () => {
        renderAt("table-one");

        expect(screen.getByTestId("table-table-one")).toBeInTheDocument();
        // Single-table: only the compact add button, no multi-table pill bar.
        expect(screen.getByRole("button", { name: "Open another table" })).toBeInTheDocument();
        expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });

    it("opens the picker and adds a second live table, showing the pill bar", () => {
        renderAt("table-one");

        fireEvent.click(screen.getByRole("button", { name: "Open another table" }));
        fireEvent.click(screen.getByTestId("picker-pick"));

        // Both tables are now mounted (the inactive one stays in the DOM, hidden).
        expect(screen.getByTestId("table-table-one")).toBeInTheDocument();
        expect(screen.getByTestId("table-table-two")).toBeInTheDocument();
        // With >1 table the pill bar (role=tablist) appears.
        expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("keeps only the active table's slot visible", () => {
        renderAt("table-one");
        fireEvent.click(screen.getByRole("button", { name: "Open another table" }));
        fireEvent.click(screen.getByTestId("picker-pick"));

        // Opening table-two makes it active; table-one's slot is hidden.
        const activeSlot = screen.getByTestId("multitable-slot-table-two");
        const hiddenSlot = screen.getByTestId("multitable-slot-table-one");
        expect(activeSlot).toHaveAttribute("data-active", "true");
        expect(hiddenSlot).toHaveAttribute("data-active", "false");
        expect(hiddenSlot).toHaveStyle({ display: "none" });
    });
});
