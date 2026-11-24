import { useEffect, useState } from "react";
import { useNetwork } from "../../context/NetworkContext";
import { getCosmosClient } from "../../utils/cosmos/client";
import { base64ToHex, txHashFromBase64 } from "../../utils/explorerDetail";
import { extractMessageTypeFromHex } from "../../utils/transactionUtils";
import { isRecord, isString } from "../../utils/guards";

export interface BlockTx {
    hash: string;
    /** "Perform Action", "Record Eth Block Height", … from the raw bytes; null when unknown. */
    label: string | null;
}

export interface BlockDetail {
    height: number;
    hash: string;
    time: string;
    chainId: string;
    proposer: string;
    appHash: string;
    txs: BlockTx[];
}

export interface UseBlockDetailReturn {
    block: BlockDetail | null;
    loading: boolean;
    error: string | null;
}

type RawHeader = { height?: string; time?: string; chain_id?: string; proposer_address?: string; app_hash?: string };

/** useBlockDetail: one block, with each transaction's hash and what kind it is. */
export const useBlockDetail = (height: number): UseBlockDetailReturn => {
    const { currentNetwork } = useNetwork();
    const [block, setBlock] = useState<BlockDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stopped = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!(height > 0)) throw new Error("No block height");
                const client = getCosmosClient(currentNetwork);
                if (!client) throw new Error("Block52 client not ready");
                const raw: unknown = await client.getBlock(height);
                if (!isRecord(raw) || !isRecord(raw.block)) throw new Error("Block not found");
                const header = (isRecord(raw.block.header) ? raw.block.header : {}) as RawHeader;
                const data = isRecord(raw.block.data) ? raw.block.data : {};
                const rawTxs = Array.isArray(data.txs) ? data.txs.filter(isString) : [];
                const txs = await Promise.all(rawTxs.map(async b64 => ({ hash: await txHashFromBase64(b64), label: extractMessageTypeFromHex(base64ToHex(b64)) })));
                const blockId = isRecord(raw.block_id) && isString(raw.block_id.hash) ? raw.block_id.hash : "";
                if (!stopped) {
                    setBlock({
                        height,
                        hash: blockId,
                        time: header.time ?? "",
                        chainId: header.chain_id ?? "",
                        proposer: header.proposer_address ?? "",
                        appHash: header.app_hash ?? "",
                        txs
                    });
                }
            } catch (err) {
                console.error("[useBlockDetail] Failed to load block", height, err);
                if (!stopped) {
                    setBlock(null);
                    setError(err instanceof Error ? err.message : "Failed to load block");
                }
            } finally {
                if (!stopped) setLoading(false);
            }
        };
        void load();
        return () => {
            stopped = true;
        };
    }, [currentNetwork, height]);

    return { block, loading, error };
};
