import { renderHook } from "@testing-library/react";
import { useWelcomeRedirect } from "./useWelcomeRedirect";
import { WELCOME_PENDING_KEY, WELCOME_SEEN_KEY } from "../../utils/welcomeSetup";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
let mockCustody: object | null = null;
jest.mock("../../utils/custody/session", () => ({ getCustodySession: () => mockCustody }));

describe("useWelcomeRedirect", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockCustody = null;
        localStorage.clear();
    });

    it("sends a visitor whose wallet was just made to the setup", () => {
        localStorage.setItem(WELCOME_PENDING_KEY, "1");
        renderHook(() => useWelcomeRedirect(true));
        expect(mockNavigate).toHaveBeenCalledWith("/welcome", { replace: true });
    });

    it("leaves existing players, club sign-ins, and visitors who have seen it", () => {
        renderHook(() => useWelcomeRedirect(true));
        localStorage.setItem(WELCOME_PENDING_KEY, "1");
        mockCustody = { address: "b521" };
        renderHook(() => useWelcomeRedirect(true));
        mockCustody = null;
        localStorage.setItem(WELCOME_SEEN_KEY, "1");
        renderHook(() => useWelcomeRedirect(true));
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("does nothing when switched off", () => {
        localStorage.setItem(WELCOME_PENDING_KEY, "1");
        renderHook(() => useWelcomeRedirect(false));
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
