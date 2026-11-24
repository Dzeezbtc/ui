import { act, renderHook } from "@testing-library/react";
import { useNodeDiscovery } from "./useNodeDiscovery";

const mockAdd = jest.fn();
jest.mock("../../context/NetworkContext", () => ({
    useNetwork: () => ({ addDiscoveredNetwork: mockAdd, discoveredNetworks: [{ name: "peer-a", rest: "https://a" }] })
}));
const mockDiscover = jest.fn();
const mockProbe = jest.fn();
jest.mock("../../services/nodeDiscovery", () => ({
    discoverNodes: (...a: unknown[]) => mockDiscover(...a),
    probeNodes: (...a: unknown[]) => mockProbe(...a),
    getCachedNodes: () => null,
    cacheNodes: jest.fn(),
    clearNodeCache: jest.fn()
}));

const node = (id: string, isPreset = false, rest = `https://${id}`) => ({
    id,
    moniker: id,
    remoteIp: "",
    listenAddr: "",
    endpoints: { name: `peer-${id}`, rpc: "", rest, grpc: "", ws: "" },
    isPreset,
    isIpBased: false
});

const SEEDS = [{ name: "Block52", rpc: "", rest: "", grpc: "", ws: "" }];

describe("useNodeDiscovery", () => {
    beforeEach(() => {
        mockAdd.mockReset();
        mockDiscover.mockReset();
        mockProbe.mockReset();
    });

    it("keeps non-preset peers, probes them and returns to idle", async () => {
        mockDiscover.mockResolvedValue([node("a"), node("x", true)]);
        mockProbe.mockImplementation(async (ns: { id: string }[]) => ns.map(n => ({ ...n, probeStatus: "reachable" })));
        const { result } = renderHook(() => useNodeDiscovery(SEEDS));
        await act(async () => {
            await result.current.discover();
        });
        expect(result.current.nodes.map(n => n.id)).toEqual(["a"]);
        expect(result.current.nodes[0].probeStatus).toBe("reachable");
        expect(result.current.phase).toBe("idle");
    });

    it("knows which peers are in the picker and adds new ones", () => {
        const { result } = renderHook(() => useNodeDiscovery(SEEDS));
        expect(result.current.isAdded(node("a"))).toBe(true);
        expect(result.current.isAdded(node("b"))).toBe(false);
        result.current.add(node("b"));
        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ name: "peer-b" }));
    });

    it("logs and returns to idle when discovery fails", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
        mockDiscover.mockRejectedValue(new Error("down"));
        const { result } = renderHook(() => useNodeDiscovery(SEEDS));
        await act(async () => {
            await result.current.discover();
        });
        expect(result.current.phase).toBe("idle");
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});
