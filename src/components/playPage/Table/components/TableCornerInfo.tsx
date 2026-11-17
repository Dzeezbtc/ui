import React from "react";
import { ProvablyFairBadge } from "../../ProvablyFair/ProvablyFairBadge";

interface TableCornerInfoProps {
    /** "$10 / $20", already formatted. */
    blinds: string;
    tableId: string;
    handNumber: number;
    tableName?: string;
}

/**
 * The Block52 Flagship's quiet corner under the table, on the right: the blinds
 * in small type and the provably-fair shield. (The table radio is meant to sit
 * here too.) The flagship stylesheet places it.
 */
export const TableCornerInfo: React.FC<TableCornerInfoProps> = React.memo(({ blinds, tableId, handNumber, tableName }) => (
    <div data-part="table-corner">
        <span className="fs-corner-blinds">{blinds}</span>
        <ProvablyFairBadge tableId={tableId} handNumber={handNumber} tableName={tableName} compact />
    </div>
));
TableCornerInfo.displayName = "TableCornerInfo";
