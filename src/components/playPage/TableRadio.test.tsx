import { act, fireEvent, render, screen } from "@testing-library/react";
import { TableRadio } from "./TableRadio";

jest.mock("../../i18n/useLanguage", () => ({ useLanguage: () => ({ t: (k: string) => k }) }));
jest.mock("../../context/TableStyleContext", () => ({ useTableStyle: () => "flagship" }));

type Pending = { resolve: () => void; reject: (e: Error) => void };

/** A fake <audio>: play() stays pending until the test settles it, like a slow stream. */
class FakeAudio {
    static made: FakeAudio[] = [];
    volume = 1;
    pause = jest.fn();
    pending!: Pending;
    constructor(public src: string) {
        FakeAudio.made.push(this);
    }
    play() {
        return new Promise<void>((resolve, reject) => {
            this.pending = { resolve, reject };
        });
    }
}

const stations = [
    { name: "Synthwave", url: "https://a/synth.mp3" },
    { name: "Lo-Fi", url: "https://a/lofi.mp3" },
    { name: "Comedy", url: "https://a/comedy.mp3" }
];

describe("TableRadio", () => {
    beforeEach(() => {
        FakeAudio.made = [];
        (global as unknown as { Audio: unknown }).Audio = FakeAudio;
        localStorage.clear();
    });

    it("can still stop a station started while a slow one was connecting", async () => {
        render(<TableRadio stations={stations} />);
        fireEvent.click(screen.getByTestId("table-radio"));

        // Comedy is slow to start; the player taps it again before it plays.
        fireEvent.click(screen.getByText("Comedy"));
        fireEvent.click(screen.getByText("Comedy"));
        const [first, second] = FakeAudio.made;
        expect(first.pause).toHaveBeenCalled();

        // The second Comedy starts, THEN the first one's interrupted play() fails.
        await act(async () => second.pending.resolve());
        await act(async () => first.pending.reject(new Error("AbortError")));

        // Picking Synthwave must stop the Comedy that is playing.
        fireEvent.click(screen.getByText("Synthwave"));
        expect(second.pause).toHaveBeenCalled();
    });

    it("stops a stream that only starts after another station was picked", async () => {
        render(<TableRadio stations={stations} />);
        fireEvent.click(screen.getByTestId("table-radio"));
        fireEvent.click(screen.getByText("Comedy"));
        fireEvent.click(screen.getByText("Synthwave"));
        const [comedy, synth] = FakeAudio.made;

        await act(async () => synth.pending.resolve());
        comedy.pause.mockClear();
        await act(async () => comedy.pending.resolve());
        expect(comedy.pause).toHaveBeenCalled();
    });
});
