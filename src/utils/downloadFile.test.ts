import { downloadTextFile } from "./downloadFile";

describe("downloadTextFile", () => {
    it("clicks a temporary link to the blob and cleans up", () => {
        const create = jest.fn(() => "blob:x");
        const revoke = jest.fn();
        Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
        const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
        downloadTextFile("hand.json", "{}");
        expect(create).toHaveBeenCalledTimes(1);
        expect(click).toHaveBeenCalledTimes(1);
        expect(revoke).toHaveBeenCalledWith("blob:x");
        expect(document.querySelector("a[download]")).toBeNull();
        click.mockRestore();
    });
});
