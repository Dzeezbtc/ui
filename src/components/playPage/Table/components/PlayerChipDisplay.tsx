import * as React from "react";
import { usePlayerChipData } from "../../../../hooks/player/usePlayerChipData";
import { type BetSide, dealerSideFor } from "../../../../config/stageGeometry";
import Chip from "../../common/Chip";
import DealerButtonDisplay from "./DealerButtonDisplay";
import ChipFlight from "./ChipFlight";
import { hasValue } from "../../../../utils/guards";
import { useGameEvents } from "../../../../hooks/game/useGameEvents";
import { antesFor, chipChange, slideStart, ANTE_PAUSE_MS } from "../../../../utils/chipMotion";
import { prefersReducedMotion } from "../../../../utils/motion";

interface Flight {
    id: number;
    amount: string;
    delayMs: number;
}

let nextFlightId = 1;

interface PlayerChipDisplayProps {
    seatIndex: number;
    left: string;
    bottom: string;
    /** When set, the bet group is centred on (left, top) instead of anchored by bottom. */
    top?: string;
    /** The seat's felt edge; picks which side of the bet the dealer button goes on. */
    side?: BetSide;
    /** This seat holds the dealer button: draw it beside the bet (ui#835). */
    isDealer?: boolean;
    isTournament: boolean;
}

/**
 * Single-seat bet group: the chip pill and, for the button seat, the dealer
 * button beside it. Chips slide out from the player when the bet grows (Dan's
 * UI #3), fly into the pot when the round's bets are cleared (#4), and an ante
 * shows briefly and flies into the pot (#7). Reduced motion: no movement. Subscribes per-seat to usePlayerChipData so a WS update
 * affecting one seat re-renders only that seat's chip (#424). Memoized so
 * prop-stable parent re-renders skip when this seat's chip amount and
 * position haven't changed.
 */
const PlayerChipDisplay: React.FC<PlayerChipDisplayProps> = React.memo(({ seatIndex, left, bottom, top, side, isDealer = false, isTournament }) => {
    const { chipAmount } = usePlayerChipData(seatIndex);
    const hasBet = !!chipAmount && chipAmount !== "0";
    const playerActed = useGameEvents("playerActed");

    const previousAmount = React.useRef(chipAmount);
    const [slideCount, setSlideCount] = React.useState(0);
    const [flights, setFlights] = React.useState<Flight[]>([]);
    const addFlight = React.useCallback((amount: string, delayMs: number) => setFlights(list => [...list, { id: nextFlightId++, amount, delayMs }]), []);
    const endFlight = React.useCallback((id: number) => setFlights(list => list.filter(f => f.id !== id)), []);

    // The bet grew: slide in. It was cleared: fly what was there into the pot.
    React.useEffect(() => {
        const before = previousAmount.current;
        previousAmount.current = chipAmount;
        if (prefersReducedMotion()) return;
        const change = chipChange(before, chipAmount);
        if (change === "slideIn") setSlideCount(n => n + 1);
        if (change === "sweep") addFlight(before, 0);
    }, [chipAmount, addFlight]);

    // Antes never sit as a bet: show each one at the bet spot, then into the pot.
    React.useEffect(() => {
        if (prefersReducedMotion()) return;
        for (const amount of antesFor(seatIndex, playerActed.map(e => e.action))) addFlight(amount, ANTE_PAUSE_MS);
    }, [playerActed, seatIndex, addFlight]);
    const centered = hasValue(top);
    const style = React.useMemo(
        () => ({
            left,
            bottom: centered ? undefined : bottom,
            top,
            transform: centered ? "translate(-50%, -50%)" : undefined
        }),
        [left, bottom, top, centered]
    );
    const start = slideStart(side);
    const slideStyle = React.useMemo(() => ({ "--chip-from-x": `${start.x}px`, "--chip-from-y": `${start.y}px` }) as React.CSSProperties, [start.x, start.y]);

    const flying = flights.map(f => (
        <ChipFlight key={f.id} amount={f.amount} isTournament={isTournament} style={style} delayMs={f.delayMs} onDone={() => endFlight(f.id)} />
    ));
    if (!hasBet && !isDealer) return flying.length ? <>{flying}</> : null;
    return (
        <>
            <div className="chip-position" style={style}>
                {/* With no bet, an empty box keeps the bet's footprint so the button sits where it would beside chips. */}
                {hasBet ? (
                    <span key={slideCount} className={slideCount > 0 ? "chip-slide-in" : undefined} style={slideStyle}>
                        <Chip amount={chipAmount} isTournament={isTournament} />
                    </span>
                ) : (
                    <span className="bet-group-empty" />
                )}
                {isDealer && <DealerButtonDisplay side={dealerSideFor(side)} />}
            </div>
            {flying}
        </>
    );
});

PlayerChipDisplay.displayName = "PlayerChipDisplay";

export default PlayerChipDisplay;
