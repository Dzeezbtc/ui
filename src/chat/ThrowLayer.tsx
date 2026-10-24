import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ThrowLayer.css";
import { ChatMessage, subscribeChatMessages } from "./chatBus";
import { isMessageVisible, useChatSettings } from "./chatSettings";
import { findThrowable } from "./throwables";
import { seatCentre } from "./seatRegistry";

/** Throws older than this when they arrive (a reconnect backlog) don't animate. */
const MAX_AGE_MS = 3000;
const FLIGHT_MS = 900;
const LINGER_MS = 1300;

interface Flight {
    id: string;
    emoji: string;
    spin: boolean;
    from: { x: number; y: number };
    to: { x: number; y: number };
}

/**
 * Animates throwables between seats (block52-chat#7): the item arcs from the
 * thrower's seat to the target's, bounces on landing, then fades. Rendered once
 * per table (TableChatBox mounts it) in a top layer that never takes clicks.
 * Respects the throwables setting, blocked players and reduced motion.
 */
export const ThrowLayer: React.FC<{ seatedAddresses?: readonly string[] }> = ({ seatedAddresses }) => {
    const settings = useChatSettings();
    const [flights, setFlights] = useState<Flight[]>([]);
    const seen = useRef(new Set<string>());
    const settingsRef = useRef(settings);
    settingsRef.current = settings;
    const seatedRef = useRef(seatedAddresses);
    seatedRef.current = seatedAddresses;

    useEffect(
        () =>
            subscribeChatMessages((messages: ChatMessage[]) => {
                const now = Date.now();
                for (const m of messages) {
                    if (!m.throwId || seen.current.has(m.id)) continue;
                    seen.current.add(m.id);
                    const t = findThrowable(m.throwId);
                    const s = settingsRef.current;
                    if (!t || !s.throwables || now - m.ts > MAX_AGE_MS || !isMessageVisible(m, s, seatedRef.current)) continue;
                    const from = seatCentre(m.from);
                    const to = seatCentre(m.to);
                    if (!from || !to) continue;
                    const flight: Flight = { id: m.id, emoji: t.emoji, spin: t.spin, from, to };
                    setFlights(f => [...f, flight]);
                    setTimeout(() => setFlights(f => f.filter(x => x.id !== flight.id)), FLIGHT_MS + LINGER_MS);
                }
            }),
        []
    );

    if (flights.length === 0) return null;
    return createPortal(
        <div className="b52-throw-layer" aria-hidden="true">
            {flights.map(f => (
                <ThrowItem key={f.id} flight={f} />
            ))}
        </div>,
        document.body
    );
};

const ThrowItem: React.FC<{ flight: Flight }> = ({ flight }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof el.animate !== "function") return;
        const dx = flight.to.x - flight.from.x;
        const dy = flight.to.y - flight.from.y;
        const lift = Math.min(160, 60 + Math.hypot(dx, dy) * 0.25); // arc height
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const rot = (deg: number) => (flight.spin && !reduce ? ` rotate(${deg}deg)` : "");
        if (reduce) {
            el.animate([{ opacity: 0, transform: `translate(${dx}px, ${dy}px)` }, { opacity: 1, transform: `translate(${dx}px, ${dy}px)` }], { duration: 200, fill: "forwards" });
        } else {
            el.animate(
                [
                    { transform: `translate(0px, 0px) scale(0.6)${rot(0)}`, opacity: 0 },
                    { transform: `translate(${dx * 0.1}px, ${dy * 0.1 - lift * 0.35}px) scale(1)${rot(90)}`, opacity: 1, offset: 0.1 },
                    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(1.25)${rot(400)}`, offset: 0.5 },
                    { transform: `translate(${dx}px, ${dy}px) scale(1)${rot(720)}`, offset: 0.86 },
                    { transform: `translate(${dx}px, ${dy - 18}px) scale(1.08)${rot(720)}`, offset: 0.93 },
                    { transform: `translate(${dx}px, ${dy}px) scale(1)${rot(720)}`, opacity: 1 }
                ],
                { duration: FLIGHT_MS, easing: "cubic-bezier(0.3, 0.6, 0.4, 1)", fill: "forwards" }
            );
        }
        el.animate([{ opacity: 1 }, { opacity: 0 }], { delay: FLIGHT_MS + LINGER_MS - 400, duration: 400, fill: "forwards" });
    }, [flight]);
    return (
        <div ref={ref} className="b52-throw-item" style={{ left: flight.from.x, top: flight.from.y }}>
            {flight.emoji}
        </div>
    );
};

export default ThrowLayer;
