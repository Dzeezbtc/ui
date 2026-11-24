import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight, FaCopy, FaQrcode, FaRedo, FaShare } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { RxExit } from "react-icons/rx";
import { QRCodeSVG } from "qrcode.react";
import { LegalActionDTO, NonPlayerActionType } from "@block52/poker-vm-sdk";
import ActionsLog from "../../../ActionsLog";
import { Modal } from "../../../common/Modal";
import { NetworkSelector } from "../../../NetworkSelector";
import { LanguagePicker } from "../../../LanguagePicker";
import { ProfileAvatarButton } from "../../../profile";
import { TopUpModal } from "../../../modals";
import { features } from "../../../../config/features";
import { CHIP_STYLES } from "../../../../config/chipSets";
import { useGameSettings } from "../../../../context/GameSettingsContext";
import { useSitOutIntent } from "../../../../context/SitOutIntentContext";
import type { NetworkEndpoints } from "../../../../context/NetworkContext";
import { useTableTopUp } from "../../../../hooks/game/useTableTopUp";
import { useLanguage } from "../../../../i18n/useLanguage";
import type { TranslationKey } from "../../../../i18n/en";
import { hasValue, isNullish } from "../../../../utils/guards";
import { buildHandShareUrl, buildShareOnXUrl } from "../../../../utils/handReplay";
import { TABLE_STYLE_LABELS, TableStyle } from "../../../../utils/tableStyle";
import { SETTINGS_SECTIONS, SETTINGS_SECTION_LABEL_KEYS, SettingsSection, settingsMenuPosition } from "../../../../utils/tableSettingsMenu";
import { ChoiceRow, ToggleRow } from "./TablePanel";
import { AUTO_REBUY_MODES, parseAutoRebuyMode } from "../../../../utils/autoRebuy";

const WIDTH = 300;
const HEIGHT = 440;

const SECTION_ICONS: Record<SettingsSection, React.ReactNode> = {
    history: <LuHistory size={15} />,
    share: <FaShare size={13} />,
    look: <span className="text-[13px] leading-none">◐</span>,
    sound: <span className="text-[13px] leading-none">♪</span>,
    play: <span className="text-[13px] leading-none">♠</span>,
    account: <span className="text-[13px] leading-none">◉</span>
};

const AUTO_REBUY_LABELS: Record<(typeof AUTO_REBUY_MODES)[number], TranslationKey> = {
    off: "settings.autoRebuyOff",
    half: "settings.autoRebuyHalf",
    full: "settings.autoRebuyFull"
};

const rowClass =
    "w-full min-h-[40px] flex items-center gap-3 px-3 text-[13px] text-left text-white rounded-lg transition-colors duration-150 hover:bg-white/10";

export interface TableSettingsMenuProps {
    tableId: string;
    handNumber: number;
    tableStyle: TableStyle;
    onCycleTableStyle: () => void;
    currentNetwork: NetworkEndpoints;
    publicKey: string | null;
    formattedAddress: string;
    isCurrentUserSeated: boolean;
    /** Seated outside a Sit & Go (the roster is frozen there). */
    canLeave: boolean;
    /** Seated at a cash table: top-up applies. */
    showTopUpEntry: boolean;
    legalActions: LegalActionDTO[];
    currentStack: string;
    minBuyIn: string;
    maxBuyIn: string;
    walletBalance: string;
    replayHand: number | null;
    handleOpenReplay?: () => void;
    handleCopyTableLink: () => void;
    handleShareHand: () => void;
    handleLeaveTableClick: () => void;
    copyToClipboard: (text: string) => void;
}

/**
 * The Block52 Flagship's settings cog (Dzeezbtc/ui#31). It sits under the table
 * beside the shield and radio, and opens a small panel instead of the old side
 * panel, top-bar buttons and phone drawer. The panel lists sections; picking one
 * drops that section's options down inside the same panel.
 */
export const TableSettingsMenu: React.FC<TableSettingsMenuProps> = props => {
    const { t } = useLanguage();
    const tk = (key: string) => t(key as TranslationKey);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [at, setAt] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
    const [section, setSection] = useState<SettingsSection | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [showTopUp, setShowTopUp] = useState(false);
    const settings = useGameSettings();
    const sitOut = useSitOutIntent();
    const { topUp } = useTableTopUp(props.tableId, props.currentNetwork);
    const canTopUp = props.legalActions.some(a => a.action === NonPlayerActionType.TOP_UP);
    const tableUrl = `${window.location.origin}/table/${props.tableId}`;

    const close = useCallback(() => {
        setAt(null);
        setSection(null);
    }, []);
    const toggle = useCallback(() => {
        if (hasValue(at)) return close();
        const rect = anchorRef.current?.getBoundingClientRect();
        if (rect) setAt(settingsMenuPosition(rect, WIDTH, HEIGHT, { width: window.innerWidth, height: window.innerHeight }));
    }, [at, close]);
    const closeAnd = (action: () => void) => () => {
        close();
        action();
    };

    // Close on an outside click or Escape (Escape first steps back out of a section).
    useEffect(() => {
        if (!hasValue(at)) return;
        const onDown = (e: MouseEvent) => {
            if (!(e.target instanceof Node)) return;
            if (!panelRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) close();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (hasValue(section)) setSection(null);
            else close();
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [at, section, close]);

    const body = (s: SettingsSection): React.ReactNode => {
        switch (s) {
            case "history":
                return (
                    <>
                        {props.handleOpenReplay && (
                            <button
                                className={rowClass}
                                onClick={closeAnd(props.handleOpenReplay)}
                                disabled={isNullish(props.replayHand)}
                                data-testid="open-replay"
                            >
                                <FaRedo size={12} />
                                <span>{isNullish(props.replayHand) ? "Replay (no completed hand yet)" : `Replay hand #${props.replayHand}`}</span>
                            </button>
                        )}
                        <div className="fs-settings-log">
                            <ActionsLog />
                        </div>
                    </>
                );
            case "share":
                return (
                    <>
                        <button className={rowClass} onClick={closeAnd(props.handleCopyTableLink)}>
                            <FaCopy size={12} />
                            <span>{t("table.copyLink")}</span>
                        </button>
                        <button className={rowClass} onClick={closeAnd(() => setShowQR(true))}>
                            <FaQrcode size={12} />
                            <span>{t("table.shareQr")}</span>
                        </button>
                        <button className={rowClass} onClick={closeAnd(props.handleShareHand)}>
                            <FaShare size={12} />
                            <span>{t("table.shareHand")}</span>
                        </button>
                        <a
                            className={rowClass}
                            href={buildShareOnXUrl(buildHandShareUrl(window.location.origin, props.tableId, props.handNumber))}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="text-[12px] font-bold leading-none">𝕏</span>
                            <span>{t("table.shareX")}</span>
                        </a>
                    </>
                );
            case "look":
                return (
                    <div className="px-1">
                        <button className={rowClass} onClick={props.onCycleTableStyle}>
                            <span className="flex-1">{t("table.style")}</span>
                            <span className="text-white/60">{TABLE_STYLE_LABELS[props.tableStyle]}</span>
                        </button>
                        <ToggleRow
                            label="Seat me at 6 o'clock"
                            description="Turn the table so your seat is at the bottom."
                            checked={settings.seatAtBottom}
                            onToggle={settings.toggleSeatAtBottom}
                        />
                        <ChoiceRow
                            label={t("settings.chips")}
                            description={t("settings.chipsHelp")}
                            options={CHIP_STYLES}
                            value={settings.chipStyle}
                            onChange={settings.setChipStyle}
                        />
                        {props.tableStyle === "flagship" ? (
                            <ToggleRow
                                label={t("settings.flipBoard")}
                                description={t("settings.flipBoardHelp")}
                                checked={settings.flipBoardCards}
                                onToggle={settings.toggleFlipBoardCards}
                            />
                        ) : null}
                        <ToggleRow
                            label={t("settings.potChips")}
                            description={t("settings.potChipsHelp")}
                            checked={settings.potAsChips}
                            onToggle={settings.togglePotAsChips}
                        />
                        <ToggleRow
                            label={t("settings.bbCash")}
                            description={t("settings.bbCashHelp")}
                            checked={settings.stacksInBBCash}
                            onToggle={settings.toggleStacksInBBCash}
                        />
                        <ToggleRow
                            label={t("settings.bbTournament")}
                            description={t("settings.bbTournamentHelp")}
                            checked={settings.stacksInBBTournament}
                            onToggle={settings.toggleStacksInBBTournament}
                        />
                        <ToggleRow
                            label={t("settings.hideBusted")}
                            description={t("settings.hideBustedHelp")}
                            checked={settings.hideBustedPlayers}
                            onToggle={settings.toggleHideBustedPlayers}
                        />
                    </div>
                );
            case "sound":
                return (
                    <div className="px-1">
                        <ToggleRow
                            label={t("settings.turnSound")}
                            description={t("settings.turnSoundHelp")}
                            checked={settings.turnNotificationSound}
                            onToggle={settings.toggleTurnNotificationSound}
                        />
                        <ToggleRow
                            label={t("settings.actionSounds")}
                            description={t("settings.actionSoundsHelp")}
                            checked={settings.playerActionSounds}
                            onToggle={settings.togglePlayerActionSounds}
                        />
                    </div>
                );
            case "play":
                return (
                    <div className="px-1">
                        {sitOut.canSitOut && (
                            <>
                                <ToggleRow
                                    label={`${t("table.sitOut")}: ${t("table.nextHand")}`}
                                    description="Sit out when this hand ends."
                                    checked={sitOut.nextHandChecked}
                                    onToggle={sitOut.toggleNextHand}
                                />
                                <ToggleRow
                                    label={`${t("table.sitOut")}: ${t("table.nextBigBlind")}`}
                                    description="Play until your next big blind, then sit out."
                                    checked={sitOut.nextBbQueued}
                                    onToggle={sitOut.toggleNextBb}
                                />
                            </>
                        )}
                        {props.showTopUpEntry && (
                            <button
                                className={`${rowClass} ${canTopUp ? "" : "opacity-50 cursor-not-allowed"}`}
                                onClick={canTopUp ? closeAnd(() => setShowTopUp(true)) : undefined}
                                title={canTopUp ? "Add chips for the next hand" : "You can top up between hands — not while you're in the current hand."}
                            >
                                <span>💰</span>
                                <span>{t("table.topUp")}</span>
                            </button>
                        )}
                        {props.showTopUpEntry && (
                            <ChoiceRow
                                label={t("settings.autoRebuy")}
                                description={t("settings.autoRebuyHelp")}
                                options={AUTO_REBUY_MODES.map(m => ({ id: m, label: t(AUTO_REBUY_LABELS[m]) }))}
                                value={settings.autoRebuy}
                                onChange={id => settings.setAutoRebuy(parseAutoRebuyMode(id))}
                            />
                        )}
                        <ToggleRow
                            label={t("settings.autoMuck")}
                            description={t("settings.autoMuckHelp")}
                            checked={settings.autoMuck}
                            onToggle={settings.toggleAutoMuck}
                        />
                        <ToggleRow
                            label={t("settings.preSelect")}
                            description={t("settings.preSelectHelp")}
                            checked={settings.preSelectCheck}
                            onToggle={settings.togglePreSelectCheck}
                        />
                        <ToggleRow
                            label={t("settings.sitIn")}
                            description={t("settings.sitInHelp")}
                            checked={settings.sitInOptions}
                            onToggle={settings.toggleSitInOptions}
                        />
                        <ToggleRow
                            label={t("settings.callClock")}
                            description={t("settings.callClockHelp")}
                            checked={settings.callClock}
                            onToggle={settings.toggleCallClock}
                        />
                    </div>
                );
            case "account":
                return (
                    <>
                        <button className={rowClass} onClick={() => props.copyToClipboard(props.publicKey ?? "")} title="Copy full address">
                            <FaCopy size={12} />
                            <span className="font-mono text-xs truncate">{props.formattedAddress}</span>
                        </button>
                        <div className={`${rowClass} cursor-default hover:bg-transparent`}>
                            <ProfileAvatarButton title="Open avatar picker" className="min-w-[32px] min-h-[32px] flex items-center justify-center" />
                            <span>{t("table.avatar")}</span>
                        </div>
                        <div className="px-3">
                            <LanguagePicker variant="row" />
                        </div>
                        {features.nodeSelector && (
                            <div className="px-3 py-2 flex items-center gap-3">
                                <span className="text-xs text-white/50">{t("table.network")}</span>
                                <NetworkSelector />
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                onClick={toggle}
                title={tk("settingsMenu.open")}
                aria-label={tk("settingsMenu.open")}
                aria-expanded={hasValue(at)}
                aria-haspopup="dialog"
                className="fs-tool-btn"
                data-testid="table-settings"
            >
                <IoSettingsOutline size={13} />
            </button>
            {at &&
                createPortal(
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-label={tk("settingsMenu.open")}
                        className="fs-settings-panel"
                        data-look={props.tableStyle}
                        style={{ left: at.left, top: at.top, width: WIDTH, maxHeight: at.maxHeight }}
                        data-testid="table-settings-panel"
                    >
                        {section ? (
                            <div className="fs-settings-section" key={section}>
                                <button className="fs-settings-head" onClick={() => setSection(null)} aria-label={tk("settingsMenu.back")}>
                                    <FaChevronLeft size={11} />
                                    <span>{tk(SETTINGS_SECTION_LABEL_KEYS[section])}</span>
                                </button>
                                <div className="fs-settings-body">{body(section)}</div>
                            </div>
                        ) : (
                            <div className="fs-settings-list">
                                <div className="fs-settings-title">{tk("settingsMenu.open")}</div>
                                {SETTINGS_SECTIONS.map(s => (
                                    <button key={s} className={rowClass} onClick={() => setSection(s)} data-section={s}>
                                        <span className="fs-settings-icon">{SECTION_ICONS[s]}</span>
                                        <span className="flex-1">{tk(SETTINGS_SECTION_LABEL_KEYS[s])}</span>
                                        <FaChevronRight size={10} className="text-white/40" />
                                    </button>
                                ))}
                                {props.canLeave && (
                                    <button className={`${rowClass} mt-1 text-red-400 hover:bg-red-500/10`} onClick={closeAnd(props.handleLeaveTableClick)}>
                                        <RxExit size={14} />
                                        <span className="font-semibold">{t("table.leave")}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>,
                    document.body
                )}

            <Modal
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                title={t("table.scanToJoin")}
                titleIcon={<FaQrcode size={16} />}
                widthClass="w-80"
                patternId="hexagons-qr-settings"
                scrollable={false}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-xl">
                        <QRCodeSVG value={tableUrl} size={240} />
                    </div>
                    <button
                        onClick={() => setShowQR(false)}
                        className="w-full py-2 rounded-lg bg-gray-700 text-white text-sm font-semibold hover:bg-gray-600 transition-colors"
                    >
                        {t("table.close")}
                    </button>
                </div>
            </Modal>

            {showTopUp && (
                <TopUpModal
                    tableId={props.tableId}
                    currentStack={props.currentStack}
                    minBuyIn={props.minBuyIn}
                    maxBuyIn={props.maxBuyIn}
                    walletBalance={props.walletBalance}
                    onClose={() => setShowTopUp(false)}
                    onTopUp={async (amount: string) => {
                        await topUp(amount);
                        setShowTopUp(false);
                    }}
                />
            )}
        </>
    );
};
