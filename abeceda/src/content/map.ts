import type { MapPlaceId } from './types';
import { project } from './map-projection';

export { SLOVAKIA_OUTLINE, RIVER_DANUBE, RIVER_MORAVA } from './map-geo';

/**
 * Miesta na mape Slovenska. Súradnice sú skutočné (zemepisná dĺžka a šírka),
 * na mapu sa prepočítajú automaticky. Nové miesto pridáte doplnením riadku
 * a jeho id do typu MapPlaceId v types.ts.
 */
export const MAP_PLACES: Record<Exclude<MapPlaceId, 'svet'>, { name: string; lon: number; lat: number; why: string }> = {
  dunaj: {
    name: 'Dunajské luhy',
    lon: 17.62,
    lat: 47.9,
    why: 'Bobry žijú v lužných lesoch pri Dunaji (od Bratislavy po Gabčíkovo) a pri Morave, kam sa koncom 70. rokov vrátili.',
  },
  dedina: {
    name: 'Topoľčianky',
    lon: 18.41,
    lat: 48.42,
    why: 'Národný žrebčín Topoľčianky – jeden z najväčších chovov koní v Európe, každý rok sa tu rodia žriebätá.',
  },
  les: {
    name: 'Poľana',
    lon: 19.47,
    lat: 48.64,
    why: 'Ďateľ veľký žije vo všetkých druhoch lesov; Poľana je veľké lesnaté pohorie v strede Slovenska.',
  },
  luka: {
    name: 'Biele Karpaty',
    lon: 17.85,
    lat: 48.93,
    why: 'Kvetnaté lúky Bielych Karpát – cvrček poľný žije na suchých slnečných lúkach a medziach, čmeliaky na kvitnúcich lúkach.',
  },
  tatry: {
    name: 'Vysoké Tatry',
    lon: 20.13,
    lat: 49.16,
    why: 'Najvyššie hory Slovenska.',
  },
};

export function placeXY(id: Exclude<MapPlaceId, 'svet'>): [number, number] {
  const p = MAP_PLACES[id];
  return project(p.lon, p.lat);
}

/** Orientačné body bez zvieratka (len pre lepšiu predstavu). */
export const CITIES = [
  { name: 'Bratislava', lon: 17.107, lat: 48.148 },
  { name: 'Košice', lon: 21.26, lat: 48.72 },
];
