import React, { useId } from "react";
import { C, Ink } from "./ink";
import { Chippy, EXPRESSIONS, Expression } from "./chippy";
import { PROPS, suitProp } from "./props";

/**
 * Art specs (block52-chat#2). A spec is one or more layers joined by "+",
 * drawn in order on the 64 grid:
 *   "rocket"                    a prop
 *   "chippy:cool"               Chippy pulling a face
 *   "chippy:sad+rain-cloud-top" Chippy with an overlay prop
 *   "suit:h"                    a suit pip
 */
export type ArtSpec = string;

function layer(part: string, i: number): React.ReactNode {
    if (part.startsWith("chippy:")) {
        const e = part.slice(7) as Expression;
        return EXPRESSIONS.includes(e) ? <Chippy key={i} expression={e} /> : null;
    }
    if (part.startsWith("suit:")) {
        const s = part.slice(5) as "s" | "h" | "d" | "c";
        return "shdc".includes(s) && s.length === 1 ? <React.Fragment key={i}>{suitProp(s)()}</React.Fragment> : null;
    }
    const draw = PROPS[part];
    return draw ? <React.Fragment key={i}>{draw()}</React.Fragment> : null;
}

/** True when every layer of the spec exists (used by tests and the manifest check). */
export function isKnownArt(spec: ArtSpec): boolean {
    return spec.split("+").every(p =>
        p.startsWith("chippy:") ? EXPRESSIONS.includes(p.slice(7) as Expression) : p.startsWith("suit:") ? /^suit:[shdc]$/.test(p) : p in PROPS
    );
}

/** The art's layers on the 64 grid, for embedding inside another SVG. */
export const ArtLayers: React.FC<{ spec: ArtSpec }> = ({ spec }) => <Ink>{spec.split("+").map(layer)}</Ink>;

/**
 * Standalone art at any size (throwables, emotes, previews). By default it gets
 * the house die-cut edge — a white border around the whole shape — so it reads
 * on the dark table as well as on light panels.
 */
export const ArtIcon: React.FC<{ spec: ArtSpec; size?: number; label?: string; className?: string; dieCut?: boolean }> = ({
    spec,
    size = 32,
    label,
    className,
    dieCut = true
}) => {
    const fid = `b52cut${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    return (
        <svg
            viewBox="-4 -4 72 72"
            width={size}
            height={size}
            className={className}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            overflow="visible"
        >
            {dieCut && (
                <defs>
                    <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
                        <feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="grown" />
                        <feFlood floodColor={C.white} />
                        <feComposite in2="grown" operator="in" result="edge" />
                        <feMerge>
                            <feMergeNode in="edge" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            )}
            <g filter={dieCut ? `url(#${fid})` : undefined}>
                <ArtLayers spec={spec} />
            </g>
        </svg>
    );
};

export default ArtIcon;
