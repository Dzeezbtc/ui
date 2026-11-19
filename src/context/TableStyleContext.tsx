import React, { createContext, useContext } from "react";
import type { TableStyle } from "../utils/tableStyle";

/**
 * The table style in force, for the few parts that draw differently per skin
 * rather than only restyle (the flagship's cards, logo and avatars). Defaults to
 * "modern" outside a table.
 */
const TableStyleContext = createContext<TableStyle>("modern");

export const TableStyleProvider: React.FC<{ value: TableStyle; children: React.ReactNode }> = ({ value, children }) => (
    <TableStyleContext.Provider value={value}>{children}</TableStyleContext.Provider>
);

export const useTableStyle = (): TableStyle => useContext(TableStyleContext);
