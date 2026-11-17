import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../common", () => ({
    Modal: ({ children, title, isOpen }: { children: React.ReactNode; title?: string; isOpen: boolean }) =>
        isOpen ? (
            <div data-testid="modal" data-title={title}>
                {children}
            </div>
        ) : null
}));

const mockSignIn = jest.fn();
const mockRegister = jest.fn();
jest.mock("../../utils/custody/session", () => ({
    custodySignIn: (...a: unknown[]) => mockSignIn(...a),
    custodyRegister: (...a: unknown[]) => mockRegister(...a)
}));

// eslint-disable-next-line import/first
import ClubAuthModal from "./ClubAuthModal";

const reload = jest.fn();
beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({});
    mockRegister.mockResolvedValue({});
});

const type = async (user: ReturnType<typeof userEvent.setup>, name: string, pw: string) => {
    await user.type(screen.getByLabelText(/username/i), name);
    await user.type(screen.getByLabelText(/^password/i), pw);
};

describe("ClubAuthModal", () => {
    it("signs in with the username and password, then reloads onto the new identity", async () => {
        const user = userEvent.setup();
        render(<ClubAuthModal isOpen onClose={jest.fn()} onSignedIn={reload} />);
        await type(user, " alice ", "pw");
        await user.click(document.querySelector("button[type=submit]")!);
        await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith("alice", "pw"));
        expect(mockRegister).not.toHaveBeenCalled();
        expect(reload).toHaveBeenCalled();
    });

    it("shows the API's refusal and does not reload", async () => {
        mockSignIn.mockRejectedValue(new Error("Wrong username or password."));
        const user = userEvent.setup();
        render(<ClubAuthModal isOpen onClose={jest.fn()} onSignedIn={reload} />);
        await type(user, "alice", "bad");
        await user.click(document.querySelector("button[type=submit]")!);
        expect(await screen.findByRole("alert")).toHaveTextContent("Wrong username or password.");
        expect(reload).not.toHaveBeenCalled();
    });

    it("creates an account on the Create account tab, with no secret unless Advanced is opened", async () => {
        const user = userEvent.setup();
        render(<ClubAuthModal isOpen onClose={jest.fn()} onSignedIn={reload} />);
        await user.click(screen.getByRole("tab", { name: "Create account" }));
        await type(user, "bob", "pw");
        await user.click(document.querySelector("button[type=submit]")!);
        await waitFor(() => expect(mockRegister).toHaveBeenCalledWith("bob", "pw", undefined));
        expect(reload).toHaveBeenCalled();
    });

    it("sends the pasted seed phrase or key as the secret", async () => {
        const user = userEvent.setup();
        render(<ClubAuthModal isOpen onClose={jest.fn()} onSignedIn={reload} />);
        await user.click(screen.getByRole("tab", { name: "Create account" }));
        await user.click(screen.getByRole("button", { name: "Advanced" }));
        await type(user, "bob", "pw");
        await user.type(screen.getByLabelText(/seed phrase or private key/i), "abandon ability able");
        await user.click(document.querySelector("button[type=submit]")!);
        await waitFor(() => expect(mockRegister).toHaveBeenCalledWith("bob", "pw", "abandon ability able"));
    });

    it("keeps the paste box out of Sign in, and the submit disabled until both fields are filled", async () => {
        const user = userEvent.setup();
        render(<ClubAuthModal isOpen onClose={jest.fn()} onSignedIn={reload} />);
        expect(screen.queryByRole("button", { name: "Advanced" })).toBeNull();
        expect(document.querySelector("button[type=submit]")).toBeDisabled();
        await user.type(screen.getByLabelText(/username/i), "a");
        expect(document.querySelector("button[type=submit]")).toBeDisabled();
    });
});
