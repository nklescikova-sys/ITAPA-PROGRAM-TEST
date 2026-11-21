/**
 * Prepočet zemepisných súradníc (dĺžka, šírka) na súradnice mapy Slovenska.
 * Jednoduchá rovnobežková projekcia so zohľadnením zemepisnej šírky – pre malé územie stačí.
 */
export const MAP_VIEW = { width: 400, height: 210 };
const BOUNDS = { west: 16.75, east: 22.65, south: 47.68, north: 49.66 };
const K = Math.cos((48.7 * Math.PI) / 180);
const PAD = 6;
const spanX = (BOUNDS.east - BOUNDS.west) * K;
const spanY = BOUNDS.north - BOUNDS.south;
const SCALE = Math.min((MAP_VIEW.width - 2 * PAD) / spanX, (MAP_VIEW.height - 2 * PAD) / spanY);
const OFF_X = (MAP_VIEW.width - spanX * SCALE) / 2;
const OFF_Y = (MAP_VIEW.height - spanY * SCALE) / 2;

export function project(lon: number, lat: number): [number, number] {
  return [OFF_X + (lon - BOUNDS.west) * K * SCALE, OFF_Y + (BOUNDS.north - lat) * SCALE];
}
