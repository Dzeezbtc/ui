import React from "react";
import { render, screen } from "@testing-library/react";
import { NetworkProvider, useNetwork, NETWORK_PRESETS } from "./NetworkContext";

const Name: React.FC = () => <span data-testid="name">{useNetwork().currentNetwork.name}</span>;
const KEY = "selectedNetwork";

describe("the saved network and the node selector switch", () => {
    afterEach(() => {
        delete process.env.VITE_FEATURE_NODE_SELECTOR;
        localStorage.clear();
    });

    it("with the selector OFF, a saved network is ignored (nobody can change it) and not overwritten", () => {
        process.env.VITE_FEATURE_NODE_SELECTOR = "false";
        const localhost = NETWORK_PRESETS.find(n => n.name === "Localhost")!;
        localStorage.setItem(KEY, JSON.stringify(localhost));
        render(<NetworkProvider><Name /></NetworkProvider>);
        expect(screen.getByTestId("name").textContent).toBe(NETWORK_PRESETS[0].name);
        expect(JSON.parse(localStorage.getItem(KEY)!).name).toBe("Localhost"); // still there for when the selector is back
    });

    it("with the selector ON (the default), a saved network is used, as before", () => {
        const localhost = NETWORK_PRESETS.find(n => n.name === "Localhost")!;
        localStorage.setItem(KEY, JSON.stringify(localhost));
        render(<NetworkProvider><Name /></NetworkProvider>);
        expect(screen.getByTestId("name").textContent).toBe("Localhost");
    });
});
