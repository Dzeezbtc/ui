import React, { useCallback, useEffect, useRef, useState } from "react";
import "./TableChatBox.css";
import { useTableChat } from "./useTableChat";
import { senderLabel, relativeTime } from "./chatFormat";
import { STICKERS, findSticker } from "./stickers";
import StickerArt from "./StickerArt";
import { isMessageVisible, setPlayerMuted, updateChatSettings, useChatSettings } from "./chatSettings";

const EMOJIS = ["😀", "😂", "😎", "😭", "😮", "🤔", "🔥", "👍", "👎", "🙏", "👀", "💪", "🎉", "🤑", "😤", "🫡", "♠️", "♥️", "♦️", "♣️", "🃏", "💰", "🍀", "🤝"];

const LS_OPEN = "b52.chat.open";
const LS_DRAFT = "b52.chat.draft";

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

type ChatView = "chat" | "quick" | "settings";

export interface TableChatBoxProps {
    /** Addresses seated at the table, for "mute spectators" (block52-chat#5). */
    seatedAddresses?: readonly string[];
}

/**
 * Table chat box (block52-chat#1). A collapsible panel in the corner of the table
 * with three views: the chat log + composer, Quick chat (one-tap stickers that
 * pop up above your seat, #2/#3), and Settings (chat on/off, seat bubbles,
 * mute spectators, muted players, #5). Rides the game WebSocket (see chatBus);
 * own messages echo locally so it works for a demo before the relay (#6).
 */
const TableChatBox: React.FC<TableChatBoxProps> = ({ seatedAddresses }) => {
    const { messages: allMessages, sendChat, sendSticker } = useTableChat();
    const settings = useChatSettings();
    const [view, setView] = useState<ChatView>("chat");
    const [cooldown, setCooldown] = useState(false);
    const [muteTarget, setMuteTarget] = useState<string | null>(null);
    const messages = allMessages.filter(m => isMessageVisible(m, settings, seatedAddresses));
    const [open, setOpen] = useState<boolean>(() => readLS(LS_OPEN, "false") === "true");
    const [draft, setDraft] = useState<string>(() => readLS(LS_DRAFT, ""));
    const [showEmoji, setShowEmoji] = useState(false);
    const [unread, setUnread] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
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
                // Inside the cooldown: show it briefly instead of silently ignoring the tap.
                setCooldown(true);
                setTimeout(() => setCooldown(false), 900);
            }
        },
        [sendSticker, settings.enabled]
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

    return (
        <div className="b52-chat">
            {open && (
                <div className="b52-chat__panel" role="log" aria-label="Table chat">
                    <div className="b52-chat__header">
                        <div className="b52-chat__title-row">
                            <span className="b52-chat__title">Table chat</span>
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
                                    <div className="b52-chat__empty">Say hello 👋</div>
                                ) : (
                                    messages.map(m => {
                                        const sticker = findSticker(m.sticker);
                                        return (
                                            <div key={m.id} className={`b52-chat__msg${m.mine ? " b52-chat__msg--mine" : ""}`}>
                                                <span className="b52-chat__meta">
                                                    {m.mine || !m.from ? (
                                                        <span className="b52-chat__from">{senderLabel(m.from, m.mine)}</span>
                                                    ) : (
                                                        <button type="button" className="b52-chat__from b52-chat__from--btn" title="Mute this player" onClick={() => setMuteTarget(m.from ?? null)}>
                                                            {senderLabel(m.from, m.mine)}
                                                        </button>
                                                    )}
                                                    <span className="b52-chat__time">{relativeTime(m.ts)}</span>
                                                </span>
                                                {sticker ? (
                                                    <span className="b52-chat__sticker">
                                                        <StickerArt sticker={sticker} size={48} />
                                                    </span>
                                                ) : (
                                                    <span className="b52-chat__text">{m.text}</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {muteTarget && (
                                <div className="b52-chat__confirm" role="alertdialog" aria-label="Mute player">
                                    <span>Mute {senderLabel(muteTarget, false)}?</span>
                                    <button type="button" className="b52-chat__confirm-btn" onClick={() => { setPlayerMuted(muteTarget, true); setMuteTarget(null); }}>
                                        Mute
                                    </button>
                                    <button type="button" className="b52-chat__link" onClick={() => setMuteTarget(null)}>
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {showEmoji && (
                                <div className="b52-chat__emoji" role="listbox" aria-label="Emojis">
                                    {EMOJIS.map(e => (
                                        <button
                                            key={e}
                                            type="button"
                                            className="b52-chat__emoji-btn"
                                            onClick={() => {
                                                onDraft(draft + e);
                                                setShowEmoji(false);
                                            }}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="b52-chat__composer">
                                <button type="button" className="b52-chat__emoji-toggle" aria-label="Emojis" onClick={() => setShowEmoji(s => !s)}>
                                    😊
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
                            <div className="b52-chat__quick-hint">{cooldown ? "One every 2 seconds…" : "Tap to pop it up above your seat"}</div>
                            <div className="b52-chat__quick-grid">
                                {STICKERS.map(st => (
                                    <button key={st.id} type="button" className="b52-chat__quick-btn" aria-label={st.label} title={st.label} onClick={() => onSticker(st.id)}>
                                        <StickerArt sticker={st} size={62} />
                                    </button>
                                ))}
                            </div>
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
                            <div className="b52-chat__muted">
                                <div className="b52-chat__muted-title">Muted players</div>
                                {settings.muted.length === 0 ? (
                                    <div className="b52-chat__muted-empty">Nobody. Tap a name in the chat to mute it.</div>
                                ) : (
                                    settings.muted.map(a => (
                                        <div key={a} className="b52-chat__muted-row">
                                            <span>{senderLabel(a, false)}</span>
                                            <button type="button" className="b52-chat__link" onClick={() => setPlayerMuted(a, false)}>
                                                Unmute
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
                <span aria-hidden="true">💬</span>
                <span>Chat</span>
                {!open && unread > 0 && <span className="b52-chat__badge">{unread > 9 ? "9+" : unread}</span>}
            </button>
        </div>
    );
};

export default TableChatBox;
