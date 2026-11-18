import { useEffect, useState, useCallback } from "react";
import { ChatMessage, subscribeChatMessages, sendChat as busSendChat, sendSticker as busSendSticker } from "./chatBus";

export interface UseTableChat {
    messages: ChatMessage[];
    sendChat: (text: string) => void;
    /** Send a quick-chat sticker; false when unknown or inside the cooldown. */
    sendSticker: (id: string) => boolean;
}

/** Subscribe to the table chat log and expose send functions. */
export function useTableChat(): UseTableChat {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => subscribeChatMessages(setMessages), []);

    const sendChat = useCallback((text: string) => busSendChat(text), []);
    const sendSticker = useCallback((id: string) => busSendSticker(id), []);

    return { messages, sendChat, sendSticker };
}
