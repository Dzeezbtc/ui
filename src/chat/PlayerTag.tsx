import React from "react";
import { getTablePlayer, playerLabel } from "./players";

/**
 * How chat shows a person (block52-chat#1): their avatar when they have one
 * (with the seat as its tooltip), else their name or "Seat N"; "You" for you;
 * "Spectator" for anyone not seated.
 */
export const PlayerTag: React.FC<{ address: string | undefined; mine?: boolean; size?: number; withText?: boolean }> = ({ address, mine = false, size = 18, withText }) => {
    const label = playerLabel(address, mine);
    const avatar = mine ? undefined : getTablePlayer(address)?.avatar;
    if (avatar) {
        return (
            <span className="b52-chat__who" title={label}>
                <img className="b52-chat__avatar" src={avatar} alt={label} width={size} height={size} draggable={false} />
                {withText && <span>{label}</span>}
            </span>
        );
    }
    return <span className="b52-chat__who">{label}</span>;
};

export default PlayerTag;
