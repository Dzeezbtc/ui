import { hasElements } from "./guards";

export type RadioStation = { name: string; url: string };

/**
 * Block52's own table radio (block52-club#46): ad-free picks used at every table
 * whose Circle hasn't chosen its own stations, including open play.
 */
export const BLOCK52_STATIONS: RadioStation[] = [
    { name: "Synthwave", url: "https://stream.nightride.fm/nightride.mp3" },
    { name: "Lo-Fi Chill", url: "https://public.isekoi-radio.com/listen/chill/radio.mp3" },
    { name: "Comedy", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/977_COMEDY_SC.mp3" }
];

/** The Circle's stations when it has some, otherwise Block52's. */
export const radioStationsFor = (circleStations: RadioStation[] | null | undefined): RadioStation[] =>
    hasElements(circleStations) ? circleStations : BLOCK52_STATIONS;
