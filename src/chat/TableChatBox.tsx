import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./TableChatBox.css";
import { useTableChat } from "./useTableChat";
import { senderLabel, relativeTime } from "./chatFormat";
import { getTablePlayer, playerLabel, registerTablePlayers, TablePlayer, useTablePlayers } from "./players";
import PlayerTag from "./PlayerTag";
import { STICKERS, STICKER_PACKS, findSticker } from "./stickers";
import StickerArt from "./StickerArt";
import { toggleFavourite, useFavourites } from "./favourites";
import { isMessageVisible, setPlayerMuted, STICKER_STYLES, StickerStyle, updateChatSettings, useChatSettings } from "./chatSettings";
import { THROWABLES, findThrowable } from "./throwables";
import { getLocalAddress, sendThrow, stickersRemaining, stickerWaitMs, throwStatus } from "./chatBus";
import { STICKER_RULE, THROW_RULE } from "./rateLimit";
import { hasStrongLanguage } from "./strongLanguage";
import ThrowLayer from "./ThrowLayer";
import ArtIcon from "./art/Art";
import RichText from "./RichText";
import { EMOTES } from "./emotes";

const LS_OPEN = "b52.chat.open";
const LS_DRAFT = "b52.chat.draft";
const LS_BOX = "b52.chat.box";

/** Where the panel floats and how big it is, once the player has moved or resized it. */
interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}
const MIN_W = 240;
const MIN_H = 220;
type Grip = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const GRIPS: Exclude<Grip, "move">[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

function readBox(): Box | null {
    try {
        const b = JSON.parse(localStorage.getItem(LS_BOX) ?? "null");
        return b && [b.x, b.y, b.w, b.h].every((n: unknown) => typeof n === "number") ? b : null;
    } catch {
        return null;
    }
}

/** Keep the panel on screen and within sensible sizes. */
function clampBox(b: Box): Box {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(Math.max(b.w, MIN_W), vw - 8);
    const h = Math.min(Math.max(b.h, MIN_H), vh - 8);
    return { w, h, x: Math.min(Math.max(b.x, 4), vw - w - 4), y: Math.min(Math.max(b.y, 4), vh - h - 4) };
}

function readLS(key: string, fallback: string): string {
    try {
        return localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}
function writeLS(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* private mode / blocked storage — chat still works in-session */
    }
}

type ChatView = "chat" | "quick" | "throw" | "settings";

const secs = (ms: number) => (ms >= 60_000 ? `${Math.ceil(ms / 60_000)}m` : `${Math.ceil(ms / 1000)}s`);

export interface TableChatBoxProps {
    /** Addresses seated at the table, for "mute spectators" (block52-chat#5). */
    seatedAddresses?: readonly string[];
    /** Who's seated (seat, avatar, name), so chat shows avatars / "Seat N" instead of addresses. */
    players?: readonly TablePlayer[];
}

/**
 * Table chat box (block52-chat#1). A collapsible panel in the corner of the table
 * with three views: the chat log + composer, Quick chat (one-tap stickers that
 * pop up above your seat, #2/#3), and Settings (chat on/off, seat bubbles,
 * mute spectators, blocked players, #5/#13), plus Throw (#7). Rides the game WebSocket (see chatBus);
 * own messages echo locally so it works for a demo before the relay (#6).
 */
const TableChatBox: React.FC<TableChatBoxProps> = ({ seatedAddresses: seatedProp, players }) => {
    useEffect(() => {
        if (players) registerTablePlayers(players);
    }, [players]);
    const tablePlayers = useTablePlayers();
    const seatedAddresses = seatedProp ?? (players ? players.map(p => p.address) : undefined);
    const { messages: allMessages, sendChat, sendSticker } = useTableChat();
    const settings = useChatSettings();
    const favourites = useFavourites();
    const [view, setView] = useState<ChatView>("chat");
    const [cooldown, setCooldown] = useState<string | null>(null);
    const [blockTarget, setBlockTarget] = useState<string | null>(null);
    const [throwTarget, setThrowTarget] = useState<string | null>(null);
    const [throwHint, setThrowHint] = useState<string | null>(null);
    const me = getLocalAddress()?.toLowerCase();
    // Throw targets in seat order (whoever the table says is seated, minus you and anyone you've blocked).
    const seatedList = tablePlayers.length ? tablePlayers.map(p => p.address) : (seatedAddresses ?? []);
    const targets = seatedList.filter(a => a && a.toLowerCase() !== me && !settings.muted.includes(a.toLowerCase()));
    const messages = allMessages.filter(m => isMessageVisible(m, settings, seatedAddresses));
    const [open, setOpen] = useState<boolean>(() => readLS(LS_OPEN, "false") === "true");
    const [draft, setDraft] = useState<string>(() => readLS(LS_DRAFT, ""));
    const [showEmoji, setShowEmoji] = useState(false);
    const [unread, setUnread] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [box, setBox] = useState<Box | null>(() => readBox());

    // Drag the header to move the panel; drag an edge or corner to resize it.
    // The first move/resize lifts it off its dock into a floating panel.
    const startGrip = useCallback(
        (e: React.PointerEvent, grip: Grip) => {
            if (e.button !== 0) return;
            if (grip === "move" && (e.target as HTMLElement).closest("button, input, select, textarea, a")) return;
            const el = panelRef.current;
            if (!el) return;
            e.preventDefault();
            const r = el.getBoundingClientRect();
            const start: Box = box ?? { x: r.left, y: r.top, w: r.width, h: r.height };
            const px = e.clientX;
            const py = e.clientY;
            let latest = start;
            const onMove = (ev: PointerEvent) => {
                const dx = ev.clientX - px;
                const dy = ev.clientY - py;
                const b = { ...start };
                if (grip === "move") {
                    b.x += dx;
                    b.y += dy;
                } else {
                    if (grip.includes("e")) b.w = start.w + dx;
                    if (grip.includes("s")) b.h = start.h + dy;
                    if (grip.includes("w")) {
                        b.w = Math.max(MIN_W, start.w - dx);
                        b.x = start.x + (start.w - b.w);
                    }
                    if (grip.includes("n")) {
                        b.h = Math.max(MIN_H, start.h - dy);
                        b.y = start.y + (start.h - b.h);
                    }
                }
                latest = clampBox(b);
                setBox(latest);
            };
            const onUp = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                writeLS(LS_BOX, JSON.stringify(latest));
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
        },
        [box]
    );

    const dock = useCallback(() => {
        setBox(null);
        try {
            localStorage.removeItem(LS_BOX);
        } catch {
            /* ignore */
        }
    }, []);

    // Keep a floating panel on screen when the window shrinks.
    useEffect(() => {
        if (!box) return;
        const onResize = () => setBox(b => (b ? clampBox(b) : b));
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [box]);

    const float = (node: React.ReactNode) =>
        box ? createPortal(<div className="b52-chat b52-chat--float" style={{ left: box.x, top: box.y }}>{node}</div>, document.body) : node;
    const seenRef = useRef(messages.length);

    // Track unread while closed; clear on open.
    useEffect(() => {
        if (open) {
            setUnread(0);
            seenRef.current = messages.length;
        } else {
            const delta = messages.length - seenRef.current;
            if (delta > 0 && !messages[messages.length - 1]?.mine) setUnread(u => u + delta);
            seenRef.current = messages.length;
        }
    }, [messages, open]);

    // Keep the list scrolled to the newest message.
    useEffect(() => {
        if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, open]);

    const toggle = useCallback(() => {
        setOpen(prev => {
            const next = !prev;
            writeLS(LS_OPEN, String(next));
            return next;
        });
        setShowEmoji(false);
    }, []);

    const onDraft = useCallback((v: string) => {
        setDraft(v);
        writeLS(LS_DRAFT, v);
    }, []);

    const submit = useCallback(() => {
        const text = draft.trim();
        if (!text || !settings.enabled) return;
        sendChat(text);
        onDraft("");
        setShowEmoji(false);
    }, [draft, sendChat, onDraft, settings.enabled]);

    const onSticker = useCallback(
        (id: string) => {
            if (!settings.enabled) return;
            if (!sendSticker(id)) {
                // Over the limit: say when the next one is allowed instead of silently ignoring the tap.
                setCooldown(`Easy! Next sticker in ${secs(stickerWaitMs())}`);
                setTimeout(() => setCooldown(null), 1500);
            }
        },
        [sendSticker, settings.enabled]
    );

    const onThrow = useCallback(
        (id: string) => {
            if (!settings.enabled || !throwTarget) return;
            if (!sendThrow(id, throwTarget)) {
                const { waitMs } = throwStatus();
                setThrowHint(waitMs > 0 ? `Out of throws — next one in ${secs(waitMs)}` : "Can't throw that");
                setTimeout(() => setThrowHint(null), 1800);
            }
        },
        [settings.enabled, throwTarget]
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
            }
        },
        [submit]
    );

    // One Quick chat cell: tap the sticker to send it; tap the star to pin or
    // unpin it in Favourites (block52-chat#17).
    const renderSticker = (id: string, section: string) => {
        const st = findSticker(id);
        if (!st) return null;
        const fav = favourites.includes(id);
        return (
            <div key={`${section}-${id}`} className="b52-chat__quick-cell">
                <button type="button" className="b52-chat__quick-btn" aria-label={st.label} title={st.label} onClick={() => onSticker(st.id)}>
                    <StickerArt sticker={st} size={76} />
                </button>
                <button
                    type="button"
                    className={`b52-chat__fav-toggle${fav ? " is-fav" : ""}`}
                    aria-label={fav ? `Remove ${st.label} from favourites` : `Add ${st.label} to favourites`}
                    aria-pressed={fav}
                    title={fav ? "Remove from favourites" : "Add to favourites"}
                    onClick={() => toggleFavourite(st.id)}
                >
                    {fav ? "★" : "☆"}
                </button>
            </div>
        );
    };

    return (
        <div className="b52-chat">
            {settings.enabled && <ThrowLayer seatedAddresses={seatedAddresses} />}
            {open && float(
                <div ref={panelRef} className={`b52-chat__panel${box ? " is-floating" : ""}`} role="log" aria-label="Table chat" style={box ? { width: box.w, height: box.h } : undefined}>
                    {GRIPS.map(g => (
                        <div key={g} className={`b52-chat__grip b52-chat__grip--${g}`} onPointerDown={e => startGrip(e, g)} aria-hidden="true" />
                    ))}
                    <div className="b52-chat__header" onPointerDown={e => startGrip(e, "move")} title="Drag to move · drag the edges to resize">
                        <div className="b52-chat__title-row">
                            <span className="b52-chat__title">Table chat</span>
                            {box && (
                                <button type="button" className="b52-chat__dock" aria-label="Put chat back in its place" title="Put chat back in its place" onClick={dock}>
                                    ⤓
                                </button>
                            )}
                            <button type="button" className="b52-chat__close" aria-label="Close chat" onClick={toggle}>
                                ✕
                            </button>
                        </div>
                        <div className="b52-chat__tabs" role="tablist">
                            <button type="button" role="tab" aria-selected={view === "chat"} className={`b52-chat__tab${view === "chat" ? " is-active" : ""}`} onClick={() => setView("chat")}>
                                Chat
                            </button>
                            <button type="button" role="tab" aria-selected={view === "quick"} className={`b52-chat__tab${view === "quick" ? " is-active" : ""}`} onClick={() => setView("quick")}>
                                Quick chat
                            </button>
                            <button type="button" role="tab" aria-selected={view === "throw"} className={`b52-chat__tab${view === "throw" ? " is-active" : ""}`} onClick={() => setView("throw")}>
                                Throw
                            </button>
                            <button type="button" role="tab" aria-selected={view === "settings"} aria-label="Chat settings" className={`b52-chat__tab b52-chat__tab--icon${view === "settings" ? " is-active" : ""}`} onClick={() => setView("settings")}>
                                ⚙
                            </button>
                        </div>
                    </div>

                    {!settings.enabled && view !== "settings" && (
                        <div className="b52-chat__off">
                            Chat is off.{" "}
                            <button type="button" className="b52-chat__link" onClick={() => updateChatSettings({ enabled: true })}>
                                Turn it on
                            </button>
                        </div>
                    )}

                    {settings.enabled && view === "chat" && (
                        <>
                            <div className="b52-chat__messages" ref={listRef}>
                                {messages.length === 0 ? (
                                    <div className="b52-chat__empty"><ArtIcon spec="chippy:happy" size={44} /><span>Say hello</span></div>
                                ) : (
                                    messages.map(m => {
                                        const sticker = findSticker(m.sticker);
                                        const thrown = findThrowable(m.throwId);
                                        const strong = !m.mine && !!m.from && !sticker && !thrown && hasStrongLanguage(m.text);
                                        return (
                                            <div key={m.id} className={`b52-chat__msg${m.mine ? " b52-chat__msg--mine" : ""}`}>
                                                <span className="b52-chat__meta">
                                                    {m.mine || !m.from ? (
                                                        <span className="b52-chat__from"><PlayerTag address={m.from} mine={m.mine} withText /></span>
                                                    ) : (
                                                        <button type="button" className="b52-chat__from b52-chat__from--btn" title="Block this player" onClick={() => setBlockTarget(m.from ?? null)}>
                                                            <PlayerTag address={m.from} mine={m.mine} withText />
                                                        </button>
                                                    )}
                                                    <span className="b52-chat__time">{relativeTime(m.ts)}</span>
                                                </span>
                                                {thrown ? (
                                                    <span className="b52-chat__text b52-chat__text--throw">
                                                        <ArtIcon spec={thrown.art} size={18} className="b52-emote" /> threw {/^[aeiou]/i.test(thrown.label) ? "an" : "a"} {thrown.label} at {playerLabel(m.to, m.to?.toLowerCase() === me)}
                                                    </span>
                                                ) : sticker ? (
                                                    <span className="b52-chat__sticker">
                                                        <StickerArt sticker={sticker} size={56} />
                                                    </span>
                                                ) : (
                                                    <span className="b52-chat__text"><RichText text={m.text} /></span>
                                                )}
                                                {!m.mine && sticker && findSticker(`${sticker.id}-reply`) && (
                                                    <button type="button" className="b52-chat__reply" onClick={() => onSticker(`${sticker.id}-reply`)}>
                                                        Reply: “{findSticker(`${sticker.id}-reply`)!.label}”
                                                    </button>
                                                )}
                                                {strong && (
                                                    <span className="b52-chat__block-hint">
                                                        Don't want to see this?{" "}
                                                        <button type="button" className="b52-chat__link" onClick={() => setBlockTarget(m.from ?? null)}>
                                                            Block {playerLabel(m.from)}
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {blockTarget && (
                                <div className="b52-chat__confirm" role="alertdialog" aria-label="Block player">
                                    <span>Block {playerLabel(blockTarget)}? You won't see their chat, stickers or throws.</span>
                                    <button type="button" className="b52-chat__confirm-btn" onClick={() => { setPlayerMuted(blockTarget, true); setBlockTarget(null); }}>
                                        Block
                                    </button>
                                    <button type="button" className="b52-chat__link" onClick={() => setBlockTarget(null)}>
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {showEmoji && (
                                <div className="b52-chat__emoji" role="listbox" aria-label="Emotes">
                                    {EMOTES.map(e => (
                                        <button
                                            key={e.id}
                                            type="button"
                                            className="b52-chat__emoji-btn"
                                            title={e.label}
                                            aria-label={e.label}
                                            onClick={() => {
                                                onDraft(`${draft}${draft && !draft.endsWith(" ") ? " " : ""}:${e.id}: `);
                                                setShowEmoji(false);
                                            }}
                                        >
                                            <ArtIcon spec={e.art} size={26} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="b52-chat__composer">
                                <button type="button" className="b52-chat__emoji-toggle" aria-label="Emotes" onClick={() => setShowEmoji(s => !s)}>
                                    <ArtIcon spec="chippy:happy" size={22} />
                                </button>
                                <textarea
                                    className="b52-chat__input"
                                    value={draft}
                                    onChange={e => onDraft(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Message the table…"
                                    rows={1}
                                    maxLength={300}
                                />
                                <button type="button" className="b52-chat__send" aria-label="Send" onClick={submit} disabled={!draft.trim()}>
                                    ➤
                                </button>
                            </div>
                        </>
                    )}

                    {settings.enabled && view === "quick" && (
                        <div className="b52-chat__quick" aria-label="Quick chat stickers">
                            <div className="b52-chat__quick-hint">{cooldown ?? `Tap to pop it up above your seat · ${stickersRemaining()} of ${STICKER_RULE.max} left`}</div>
                            <div className="b52-chat__quick-grid">
                                <div className="b52-chat__quick-pack b52-chat__quick-pack--fav">★ Favourites</div>
                                {favourites.length === 0 ? (
                                    <div className="b52-chat__quick-fav-empty">Tap ☆ on any sticker to pin it here.</div>
                                ) : (
                                    favourites.map(id => renderSticker(id, "fav"))
                                )}
                                {STICKER_PACKS.map(pack => (
                                    <React.Fragment key={pack.id}>
                                        <div className="b52-chat__quick-pack">{pack.label}</div>
                                        {STICKERS.filter(st => st.pack === pack.id).map(st => renderSticker(st.id, pack.id))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {settings.enabled && view === "throw" && (
                        <div className="b52-chat__throw" aria-label="Throw something">
                            <div className="b52-chat__quick-hint">
                                {throwHint ?? (throwTarget ? `Pick something to throw · ${throwStatus().remaining} of ${THROW_RULE.max} left` : "Who's it for?")}
                            </div>
                            {targets.length === 0 ? (
                                <div className="b52-chat__quick-fav-empty">Nobody else is seated yet.</div>
                            ) : (
                                <div className="b52-chat__targets" role="radiogroup" aria-label="Throw at">
                                    {targets.map(a => (
                                        <button key={a} type="button" role="radio" aria-checked={throwTarget === a} aria-label={`Throw at ${playerLabel(a)}`} title={playerLabel(a)} className={`b52-chat__target${throwTarget === a ? " is-active" : ""}${getTablePlayer(a)?.avatar ? " b52-chat__target--avatar" : ""}`} onClick={() => setThrowTarget(a)}>
                                            <PlayerTag address={a} size={24} />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="b52-chat__throw-grid">
                                {THROWABLES.map(t => (
                                    <button key={t.id} type="button" className="b52-chat__throw-btn" disabled={!throwTarget} title={t.label} aria-label={`Throw ${t.label}`} onClick={() => onThrow(t.id)}>
                                        <ArtIcon spec={t.art} size={34} className="b52-chat__throw-emoji" />
                                        <span className="b52-chat__throw-label">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                            {!settings.throwables && <div className="b52-chat__quick-fav-empty">Throwables are hidden for you (Settings) — others still see yours.</div>}
                        </div>
                    )}

                    {view === "settings" && (
                        <div className="b52-chat__settings">
                            <label className="b52-chat__setting">
                                <span>Chat</span>
                                <input type="checkbox" role="switch" checked={settings.enabled} onChange={e => updateChatSettings({ enabled: e.target.checked })} />
                            </label>
                            <label className="b52-chat__setting">
                                <span>Bubbles above seats</span>
                                <input type="checkbox" role="switch" checked={settings.seatBubbles} disabled={!settings.enabled} onChange={e => updateChatSettings({ seatBubbles: e.target.checked })} />
                            </label>
                            <label className="b52-chat__setting">
                                <span>Mute spectators</span>
                                <input type="checkbox" role="switch" checked={settings.muteSpectators} disabled={!settings.enabled} onChange={e => updateChatSettings({ muteSpectators: e.target.checked })} />
                            </label>
                            <label className="b52-chat__setting">
                                <span>Sticker style</span>
                                <select className="b52-chat__select" value={settings.stickerStyle} onChange={e => updateChatSettings({ stickerStyle: e.target.value as StickerStyle })}>
                                    {STICKER_STYLES.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="b52-chat__setting">
                                <span>Show throwables</span>
                                <input type="checkbox" role="switch" checked={settings.throwables} disabled={!settings.enabled} onChange={e => updateChatSettings({ throwables: e.target.checked })} />
                            </label>
                            <div className="b52-chat__muted">
                                <div className="b52-chat__muted-title">Blocked players</div>
                                {settings.muted.length === 0 ? (
                                    <div className="b52-chat__muted-empty">Nobody. Tap a name in the chat to block it.</div>
                                ) : (
                                    settings.muted.map(a => (
                                        <div key={a} className="b52-chat__muted-row">
                                            <span>{getTablePlayer(a) ? <PlayerTag address={a} withText /> : senderLabel(a, false)}</span>
                                            <button type="button" className="b52-chat__link" onClick={() => setPlayerMuted(a, false)}>
                                                Unblock
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button type="button" className={`b52-chat__fab${open ? " is-open" : ""}`} onClick={toggle} aria-label={open ? "Close chat" : "Open chat"}>
                <ArtIcon spec="chippy:happy" size={20} />
                <span>Chat</span>
                {!open && unread > 0 && <span className="b52-chat__badge">{unread > 9 ? "9+" : unread}</span>}
            </button>
        </div>
    );
};

export default TableChatBox;
