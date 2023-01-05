import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const input = fs.readFileSync('input.txt', 'utf-8');

function work(input, rowToScan: number) {
    const knownTiles = input.split('\n').map(line => {
        const [, sensorX, sensorY, beaconX, beaconY] = line
            .match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)
        const range = Math.abs(sensorX - beaconX) + Math.abs(sensorY - beaconY)
        return {
            sensor: {x: parseInt(sensorX), y: parseInt(sensorY), range},
            beacon: {x: parseInt(beaconX), y: parseInt(beaconY)}
        }
    })

    const sensors: { x: number, y: number, range: number }[] = knownTiles
        .map(tile => tile.sensor)
        .filter(s => s.range >= Math.abs(s.y - rowToScan))

    const beaconsOnScannedRow: { x: number, y: number }[] = knownTiles
        .map((tile): { x: number, y: number } => tile.beacon)
        .filter((b) => b.y === rowToScan)
        .filter((b, i, beacons: { x: number, y: number }[]) => beacons.findIndex(_b => _b.x === b.x) === i)

    const leftmostScannedTile = sensors.reduce((min, sensor) => {
        const minX = sensor.x - sensor.range + Math.abs(sensor.y - rowToScan)
        return (minX < min) ? minX : min
    }, Number.MAX_SAFE_INTEGER)

    const rightmostScannedTile = sensors.reduce((max, sensor) => {
        const maxX = sensor.x + sensor.range - Math.abs(sensor.y - rowToScan)
        return (maxX > max) ? maxX : max
    }, Number.MIN_SAFE_INTEGER)

    let tilesInRange = 0
    for (let x = leftmostScannedTile; x <= rightmostScannedTile; x++) {
        if (sensors.find(s => Math.abs(s.y - rowToScan) + Math.abs(s.x - x) <= s.range)) {
            tilesInRange++
        }
    }

    return tilesInRange - beaconsOnScannedRow.length
}

console.log(work(testInput, 10))
console.assert(work(testInput, 10) === 26)

console.log(work(input, 2000_000))
// 6263574 is too high