/* Club notifications when the lobby is closed (block52-club#26). Shows what the club service pushes, and opens the club on a click. */
self.addEventListener("push", event => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { title: "Block52", body: event.data ? event.data.text() : "" };
    }
    event.waitUntil(self.registration.showNotification(data.title || "Block52", { body: data.body || "", icon: "/poker.svg", data: { url: data.url || "/" } }));
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || "/";
    // Only open pages of this lobby.
    const target = new URL(url, self.location.origin);
    const safe = target.origin === self.location.origin ? target.href : self.location.origin + "/";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
            for (const c of list) if (c.url === safe && "focus" in c) return c.focus();
            return self.clients.openWindow(safe);
        })
    );
});
