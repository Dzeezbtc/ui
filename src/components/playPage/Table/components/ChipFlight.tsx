import * as React from "react";
import Chip from "../../common/Chip";
import { towardCentre } from "../../../../utils/chipMotion";

interface ChipFlightProps {
    amount: string;
    isTournament: boolean;
    /** Where the chips start: the seat's bet spot (the bet group's own position style). */
    style: React.CSSProperties;
    /** Wait this long at the bet spot before leaving, ms (an ante's beat). */
    delayMs: number;
    onDone: () => void;
}

/** Longest a flight may take before it's cleared regardless (a missed animationend can't leave chips behind). */
const MAX_FLIGHT_MS = 1200;

/**
 * Chips leaving a seat's bet spot for the pot (Dan's UI #4, #7): measures its
 * own spot against the felt's centre, flies there and fades, then reports done.
 * On a hidden table (multi-tabling) it has no size and finishes at once.
 */
const ChipFlight: React.FC<ChipFlightProps> = ({ amount, isTournament, style, delayMs, onDone }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [vector, setVector] = React.useState<{ dx: number; dy: number } | null>(null);

    React.useLayoutEffect(() => {
        const el = ref.current;
        const felt = el?.parentElement?.parentElement;
        const rect = el?.getBoundingClientRect();
        if (!el || !felt || !rect || rect.width === 0) {
            onDone();
            return;
        }
        setVector(towardCentre(rect, felt.getBoundingClientRect()));
        // onDone is the parent's per-flight callback; measuring once is enough.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(onDone, delayMs + MAX_FLIGHT_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const flightStyle = React.useMemo(
        () =>
            ({
                "--chip-dx": `${vector?.dx ?? 0}px`,
                "--chip-dy": `${vector?.dy ?? 0}px`,
                animationDelay: `${delayMs}ms`
            }) as React.CSSProperties,
        [vector, delayMs]
    );

    return (
        <div className="chip-position chip-flight-spot" style={style} aria-hidden="true">
            <div ref={ref} className={vector ? "chip-to-pot" : "chip-flight-measure"} style={flightStyle} onAnimationEnd={onDone}>
                <Chip amount={amount} isTournament={isTournament} />
            </div>
        </div>
    );
};

export default ChipFlight;
