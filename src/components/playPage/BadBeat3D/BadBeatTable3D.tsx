import React, { useEffect, useMemo, useRef, useState } from "react";
import { getStageDims, getTableOffset, type TableSize } from "../../../config/stageGeometry";
import { badBeatScene } from "../../../utils/badBeatScene";
import { useBadBeatTable } from "../../../hooks/game/useBadBeatTable";
import { BadBeatEngine } from "./badBeatEngine";

interface BadBeatTable3DProps {
    /** Per table position, its angle round the table (stageGeometry seatAngles). */
    seatAngles: number[];
    tableSize: TableSize;
    startIndex: number;
    dealerSeat: number | null;
    zoom: number;
    containerWidth: number;
    containerHeight: number;
}

/**
 * Bad Beat's table (Dzeezbtc/ui#36): the concept's three.js table filling the
 * table area, behind the plates, bet amounts, board and pot, which sit on its
 * projected points. Without WebGL it draws nothing and the room shows through.
 */
export const BadBeatTable3D: React.FC<BadBeatTable3DProps> = ({ seatAngles, tableSize, startIndex, dealerSeat, zoom, containerWidth, containerHeight }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<BadBeatEngine | null>(null);
    const state = useBadBeatTable(tableSize, startIndex, dealerSeat);
    const dims = getStageDims();
    const layout = useMemo(() => badBeatScene(seatAngles, dims.tableWidth, dims.tableHeight), [seatAngles, dims.tableWidth, dims.tableHeight]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let made: BadBeatEngine | null = null;
        try {
            made = new BadBeatEngine(canvas);
        } catch (err) {
            console.error("Bad Beat: no WebGL for the 3D table", err);
        }
        setEngine(made);
        return () => made?.dispose();
    }, []);

    useEffect(() => {
        if (!engine || containerWidth <= 0 || containerHeight <= 0) return;
        const { tx, ty } = getTableOffset(zoom, tableSize, containerWidth, containerHeight);
        engine.setFrame(
            {
                width: containerWidth,
                height: containerHeight,
                left: tx + zoom * dims.originX,
                top: ty + zoom * dims.originY,
                frameWidth: zoom * dims.tableWidth,
                frameHeight: zoom * dims.tableHeight
            },
            layout
        );
    }, [engine, layout, zoom, tableSize, containerWidth, containerHeight, dims.originX, dims.originY, dims.tableWidth, dims.tableHeight]);

    useEffect(() => {
        engine?.setState(state);
    }, [engine, state]);

    return <canvas ref={canvasRef} data-part="bb-3d" className="absolute inset-0 w-full h-full" aria-hidden="true" />;
};
