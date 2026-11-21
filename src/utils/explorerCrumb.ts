/** Where an explorer inner page's "back" link goes: the explorer home from any /explorer/... page, else none. */
export const explorerCrumb = (pathname: string): string | undefined => (pathname.startsWith("/explorer/") ? "/explorer" : undefined);
