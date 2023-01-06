import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const input = fs.readFileSync('input.txt', 'utf-8');

function findScannedTilesOnRow(input, rowToScan: number) {
    const knownTiles = parse(input)

    const sensors: { x: number, y: number, range: number }[] = knownTiles
        .map(tile => tile.sensor)
        .filter(s => s.range >= Math.abs(s.y - rowToScan))

    const beaconsOnScannedRow: { x: number, y: number }[] = knownTiles
        .map((tile): { x: number, y: number } => tile.beacon)
        .filter((b) => b.y === rowToScan)
        .filter((b, i, beacons: { x: number, y: number }[]) => beacons.findIndex(_b => _b.x === b.x) === i)

    const leftmostScannedTile = Math.min(
        ...sensors.map((sensor) => sensor.x - sensor.range + Math.abs(sensor.y - rowToScan)))

    const rightmostScannedTile = Math.max(
        ...sensors.map((sensor) => sensor.x + sensor.range - Math.abs(sensor.y - rowToScan)))

    let tilesInRange = 0
    for (let x = leftmostScannedTile; x <= rightmostScannedTile; x++) {
        if (sensors.find(s => Math.abs(s.y - rowToScan) + Math.abs(s.x - x) <= s.range)) {
            tilesInRange++
        }
    }

    return tilesInRange - beaconsOnScannedRow.length
}

function findMissingBeaconInRange(input, bounds: number) {
    const knownTiles = parse(input)

    const sensors: { x: number, y: number, range: number }[] = knownTiles
        .map(tile => tile.sensor)

    let missingBeacon = [-1, -1]
    search: for (let y = 0; y < bounds; y++) {
        for (let x = 0; x <= bounds; x++) {
            const additionalRanges = sensors
                .map(s => s.range - (Math.abs(s.y - y) + Math.abs(s.x - x)))
                .filter(range => range >= 0)

            if (additionalRanges.length > 0) {
                x += Math.max(...additionalRanges)
            } else {
                missingBeacon = [x, y]
                break search
            }
        }
        if (y % 100_000 === 0) console.log(y)
    }

    const [x, y] = missingBeacon
    return x * 4_000_000 + y
}

function parse(input) {
    return input.split('\n').map(line => {
        const [, sensorX, sensorY, beaconX, beaconY] = line
            .match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)
        const range = Math.abs(sensorX - beaconX) + Math.abs(sensorY - beaconY)
        return {
            sensor: {x: parseInt(sensorX), y: parseInt(sensorY), range},
            beacon: {x: parseInt(beaconX), y: parseInt(beaconY)}
        }
    });
}

console.assert(findScannedTilesOnRow(testInput, 10) === 26)
console.log(findScannedTilesOnRow(input, 2_000_000))
console.assert(findScannedTilesOnRow(input, 2_000_000) === 5525990)

console.assert(findMissingBeaconInRange(testInput, 20) === 56000011)
console.log(findMissingBeaconInRange(input, 4_000_000))
// console.assert(findMissingBeaconInRange(input, 4_000_000) === 11756174628223)
