import React from "react";
import { ProvablyFairBadge } from "../../ProvablyFair/ProvablyFairBadge";

interface TableCornerInfoProps {
    /** "$10 / $20", already formatted. */
    blinds: string;
    tableId: string;
    handNumber: number;
    tableName?: string;
    /** The radio and settings buttons, beside the shield. */
    children?: React.ReactNode;
}

/**
 * The Block52 Flagship's quiet corner under the table, on the right: the blinds
 * in small type, the provably-fair shield, then the table radio and the settings
 * cog (Dzeezbtc/ui#31). The flagship stylesheet places it.
 */
export const TableCornerInfo: React.FC<TableCornerInfoProps> = ({ blinds, tableId, handNumber, tableName, children }) => (
    <div data-part="table-corner">
        <span className="fs-corner-blinds">{blinds}</span>
        <ProvablyFairBadge tableId={tableId} handNumber={handNumber} tableName={tableName} compact />
        {children}
    </div>
);
TableCornerInfo.displayName = "TableCornerInfo";
