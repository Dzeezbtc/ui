import { TexasHoldemRound } from "@block52/poker-vm-sdk";
import { STREET_LABELS, streetIndex } from "./streetTracker";

describe("streetIndex", () => {
    it("maps each betting round to its street", () => {
        expect(streetIndex(TexasHoldemRound.PREFLOP)).toBe(0);
        expect(streetIndex(TexasHoldemRound.FLOP)).toBe(1);
        expect(streetIndex(TexasHoldemRound.TURN)).toBe(2);
        expect(streetIndex(TexasHoldemRound.RIVER)).toBe(3);
        expect(STREET_LABELS[streetIndex(TexasHoldemRound.TURN)]).toBe("Turn");
    });

    it("stays on the river through showdown and the hand's end", () => {
        expect(streetIndex(TexasHoldemRound.SHOWDOWN)).toBe(3);
        expect(streetIndex(TexasHoldemRound.END)).toBe(3);
    });

    it("lights nothing before the deal or for an unknown round", () => {
        expect(streetIndex(TexasHoldemRound.ANTE)).toBe(-1);
        expect(streetIndex(undefined)).toBe(-1);
        expect(streetIndex("bogus")).toBe(-1);
    });
});
