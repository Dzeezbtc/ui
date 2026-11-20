import React from "react";
import { SITE_LOOKS, SITE_LOOK_LABELS, getSiteLook, setSiteLook } from "../utils/siteLook";
import styles from "./SiteLookSwitch.module.css";

/**
 * Flagship | Traditional: the whole site's look (lobby, pages and table skin).
 * Picking one reloads the page in that look and remembers it.
 */
export const SiteLookSwitch: React.FC<{ wide?: boolean }> = ({ wide }) => {
    const current = getSiteLook();
    return (
        <div className={`${styles.switch} ${wide ? styles.wide : ""}`} role="group" aria-label="Site look" title="Site look">
            {SITE_LOOKS.map(look => (
                <button
                    key={look}
                    type="button"
                    aria-pressed={look === current}
                    className={look === current ? styles.on : styles.off}
                    onClick={() => {
                        if (look !== current) setSiteLook(look);
                    }}
                >
                    {SITE_LOOK_LABELS[look]}
                </button>
            ))}
        </div>
    );
};

export default SiteLookSwitch;
