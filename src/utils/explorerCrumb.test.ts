import { explorerCrumb } from "./explorerCrumb";

describe("explorerCrumb", () => {
    it("links inner explorer pages back to the explorer", () => {
        expect(explorerCrumb("/explorer/block/5")).toBe("/explorer");
        expect(explorerCrumb("/explorer")).toBeUndefined();
        expect(explorerCrumb("/nodes")).toBeUndefined();
    });
});
