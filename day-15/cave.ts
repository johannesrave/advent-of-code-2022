export class Tile {
    constructor(public pos: Pos) { }
}

export class Beacon extends Tile {
    toString() {return 'B'}
}

export class Sensor extends Tile {
    private range: number;

    constructor(public pos: Pos, public closestBeacon: Beacon) {
        super(pos);
        this.range = Math.abs(this.pos.x - this.closestBeacon.pos.x)
            + Math.abs(this.pos.y - this.closestBeacon.pos.y)
    }

    scan() {
        const scannedTiles: ScannedTile[] = []
        for (let x = 0; x <= this.range; x++) {
            for (let y = this.range - x; y >= 0; y--) {
                scannedTiles.push(new ScannedTile({x: this.pos.x+x, y: this.pos.y+y}))
                if (x !== 0 && y !== 0) {
                    scannedTiles.push(new ScannedTile({x: this.pos.x-x, y: this.pos.y-y}))
                }
                if (x !== 0) {
                    scannedTiles.push(new ScannedTile({x: this.pos.x-x, y: this.pos.y+y}))
                }
                if (y !== 0) {
                    scannedTiles.push(new ScannedTile({x: this.pos.x+x, y: this.pos.y-y}))
                }
            }
            // const y = this.range - x
        }

        return scannedTiles
    }

    toString() {return 'S'}
}

export class ScannedTile extends Tile {
    toString() {return '#'}
}

export class ObscureTile extends Tile {
    toString() {return '#'}
}

export type Cave = Record<string, Record<string, Tile>>

type Pos = { x: number; y: number }

export function findBoundaries(cave: Cave) {
    const xBounds = Object.values(cave)
        .map(row => Object.values(row)
            .map(tile => tile.pos.x))
        .flat(2)
    const leftBound = Math.min(...xBounds)
    const rightBound = Math.max(...xBounds)

    const yBounds = Object.keys(cave).map(k => parseInt(k))
    const upperBound = Math.min(...yBounds)
    const lowerBound = Math.max(...yBounds)


    return {leftBound, rightBound, upperBound, lowerBound}
}

function printCave(_cave: Cave) {
    const {leftBound, rightBound, upperBound, lowerBound} = findBoundaries(_cave)
    const cave = structuredClone(_cave)

    for (let y = upperBound; y <= lowerBound; y++) {
        cave[y] = cave[y] ?? {}
        for (let x = leftBound; x <= rightBound; x++) {
            cave[y][x] = cave[y][x] ?? new ObscureTile({x, y})
        }
    }

    return Object.entries(cave).map(([y, row], i) => i.toString().padStart(3) + ": " + Object.values(row).join(''))
}