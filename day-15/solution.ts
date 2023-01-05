import * as fs from 'fs';
import {Beacon, Cave, ScannedTile, Sensor, Tile} from "./cave.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const input = fs.readFileSync('input.txt', 'utf-8');

function parseSensors(input) {
    return input.split('\n').map(line => {
        const [, sensorX, sensorY, beaconX, beaconY] = line
            .match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)
        return new Sensor(
            {x: parseInt(sensorX), y: parseInt(sensorY)},
            new Beacon({x: parseInt(beaconX), y: parseInt(beaconY)})
        )
    })
}

function buildCave(sensors: Sensor[]) {
    const cave: Cave = {}

    const occupiedTiles = [
        ...sensors,
        ...sensors.map(s => s.scan()).flat(),
        ...sensors.map(s => s.closestBeacon)
    ]

    const mapOfMaps = new Map<number, Map<number, Tile>>();
    occupiedTiles.forEach((tile) => {
        const {x, y} = tile.pos

        if (!mapOfMaps.has(y)) {

            mapOfMaps.set(y, new Map())
        }
        mapOfMaps.get(y).set(x, tile)
    })
    return [...mapOfMaps.entries()]
        .sort(([a],[b]) => a-b)
        .map(([y, row]: [number, Map<number, Tile>]): [number, [number, Tile][]]  =>
            [y, [...row.entries()].sort(([a],[b]) => a-b)])
}


const s = new Sensor({x: 0, y: 11}, new Beacon({x: 2, y: 10}))

const obj = buildCave(parseSensors(input));
console.log(obj)
const row = obj.find(([y]) => y === 2000000);
console.log(row[1].length)
console.log(row[1].filter(([x, tile]) => tile instanceof ScannedTile).length)
