import { clubDemoHeaders, getClubDemoPassword, onClubDemoPasswordNeeded, requestClubDemoPassword, setClubDemoPassword } from "./clubDemoAccess";

describe("club demo password", () => {
    beforeEach(() => localStorage.clear());

    it("sends nothing until a password is saved, then sends it in the header", () => {
        expect(clubDemoHeaders()).toEqual({});
        setClubDemoPassword("demo-password-123");
        expect(clubDemoHeaders()).toEqual({ "x-site-password": "demo-password-123" });
    });

    it("asks for the password when the service refuses, dropping a stale one", () => {
        setClubDemoPassword("old");
        const asked = jest.fn();
        const stop = onClubDemoPasswordNeeded(asked);
        requestClubDemoPassword();
        expect(asked).toHaveBeenCalledTimes(1);
        expect(getClubDemoPassword()).toBeNull();
        stop();
        requestClubDemoPassword();
        expect(asked).toHaveBeenCalledTimes(1);
    });
});
