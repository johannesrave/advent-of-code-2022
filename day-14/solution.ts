import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const input = fs.readFileSync('input.txt', 'utf-8');

const entry = '*'
const air = '~'
const stone = '#'
const sand = 'A'


function getSandCapacityOverAbyss(input) {

    const cave = parseCave(input);
    const {ground, rightEdge, leftEdge} = findBoundaries(cave);

    const entry = [500, 0]
    let [x, y] = entry;
    let capacity = 0

    do {
        [x, y] = findNextRestingTile(cave, entry)
        if (y <= ground && x > leftEdge && x < rightEdge) {
            cave[y][x] = sand
            capacity++
        }
    } while (y <= ground && x > leftEdge && x < rightEdge)

    return capacity
}

function getSandCapacityWithGround(input) {

    const cave = parseCave(input);
    let {ground} = findBoundaries(cave);
    cave[ground + 1] = []
    cave[ground + 2] = Array(670).fill(stone, 330)

    const entry = [500, 0]
    let [x, y] = entry;
    let capacity = 0

    while (cave[entry[1]][entry[0]] !== sand) {
        [x, y] = findNextRestingTile(cave, entry)
        cave[y][x] = sand
        capacity++
    }

    return capacity
}

function findNextRestingTile(cave: Record<number, string[]>, start: number[]) {
    let [x, y] = start
    const ground = Math.max(...Object.keys(cave).map(n => parseInt(n)))
    let tileBelow = typeof cave[y + 1][x] === 'undefined'
    let tileLeftBelow = typeof cave[y + 1][x - 1] === 'undefined'
    let tileRightBelow = typeof cave[y + 1][x + 1] === 'undefined'
    while ((tileBelow || tileLeftBelow || tileRightBelow) && y < ground-1) {
        y++
        if (tileBelow) {

        } else if (tileLeftBelow) {
            x--
        } else if (tileRightBelow) {
            x++
        }
        tileBelow = typeof cave[y + 1][x] === 'undefined'
        tileLeftBelow = typeof cave[y + 1][x - 1] === 'undefined'
        tileRightBelow = typeof cave[y + 1][x + 1] === 'undefined'
    }
    return [x, y]
}

function parseCave(input): Record<number, string[]> {
    const firstRow = []
    firstRow[500] = entry
    const cave: Record<number, string[]> = {0: firstRow}
    let leftEdge = Number.MAX_SAFE_INTEGER
    let rightEdge = 0
    const stoneCoords: [number, number][][] = input.split('\n')
        .map((line: string) => line
            .split(' -> ')
            .map(xy => xy
                .split(',')
                .map(c => parseInt(c))))

    stoneCoords.forEach(set => set.forEach((xy: [number, number], i, coords) => {
        if (i === 0) return
        const [ax, ay] = coords[i - 1]
        const [bx, by] = coords[i]
        leftEdge = (leftEdge > Math.min(ax, bx)) ? Math.min(ax, bx) : leftEdge
        rightEdge = (rightEdge < Math.max(ax, bx)) ? Math.max(ax, bx) : rightEdge
        if (ay === by) {
            if (typeof cave[ay] === 'undefined') {
                cave[ay] = []
            }
            for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
                cave[ay][x] = stone
            }
        } else if (ax === bx) {
            for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
                if (typeof cave[y] === 'undefined') {
                    cave[y] = []
                }
                cave[y][ax] = stone
            }
        }
    }))
    const ground = Math.max(...Object.keys(cave).map(n => parseInt(n)))

    for (let i = 0; i <= ground; i++) {
        if (typeof cave[i] === 'undefined')
            cave[i] = []
    }
    return cave
}

function findBoundaries(cave) {
    let leftEdge = Number.MAX_SAFE_INTEGER
    let rightEdge = 0
    Object.values(cave)
        .forEach((v: string[]) => {
            v.forEach((tile, i) => {
                leftEdge = (i < leftEdge && tile === stone) ? i : leftEdge
                rightEdge = (i > rightEdge && tile === stone) ? i : rightEdge
            })
        })
    const ground = Math.max(...Object.keys(cave).map(n => parseInt(n)))

    return {ground, leftEdge, rightEdge}
}

function printCave(_cave) {
    const cave = structuredClone(_cave)
    const {leftEdge, rightEdge, ground} = findBoundaries(cave)
    for (let i = 0; i <= ground; i++) {
        for (let j = leftEdge; j <= rightEdge; j++) {
            cave[i][j] = cave[i][j] ?? air
        }
    }
    Object.entries(cave)
        .forEach(([k, v]: [string, string[]]) => console.log(k.padStart(3) + ": " + v.join('')))
}

console.assert(getSandCapacityOverAbyss(testInput) === 24)
console.log(getSandCapacityOverAbyss(input))
console.assert(getSandCapacityOverAbyss(input) === 578)

console.assert(getSandCapacityWithGround(testInput) === 93)
console.log(getSandCapacityWithGround(testInput))
console.assert(getSandCapacityWithGround(input) === 24377)
