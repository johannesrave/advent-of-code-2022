import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const input = fs.readFileSync('input.txt', 'utf-8');

function getSandCapacity(input) {

    const {cave, ground, rightEdge, leftEdge} = parseCave(input);

    const entry = [500, 0]
    let capacityLeft = true
    let capacityCounter = 0

    do {
        let sandPos = entry
        let down = sandPos[1] + 1;
        let spaceDown = cave[down][sandPos[0]]
        let spaceDownLeft = cave[down][sandPos[0] - 1]
        let spaceDownRight = cave[down][sandPos[0] + 1]
        let notOverflowing = sandPos[1] < ground && sandPos[0] > leftEdge && sandPos[0] < rightEdge
        while (
            (!spaceDown || !spaceDownLeft || !spaceDownRight) && notOverflowing){
            switch(true){
                case !spaceDown: sandPos = [sandPos[0], down]; break
                case !spaceDownLeft: sandPos = [sandPos[0] - 1, down]; break
                case !spaceDownRight: sandPos = [sandPos[0] + 1, down]; break
            }
            down = sandPos[1] + 1;
            spaceDown = cave[down][sandPos[0]]
            spaceDownLeft = cave[down][sandPos[0] - 1]
            spaceDownRight = cave[down][sandPos[0] + 1]
            notOverflowing = sandPos[1] < ground && sandPos[0] > leftEdge && sandPos[0] < rightEdge
        }
        if (!notOverflowing) {
            capacityLeft = false
        } else {
            cave[sandPos[1]][sandPos[0]] = true
            capacityCounter++
            console.log(cave)
        }
    } while (capacityLeft)

    console.log(cave)
    return capacityCounter
}

function parseCave(input) {
    const cave: boolean[][] = []
    let leftEdge = Number.MAX_SAFE_INTEGER
    let rightEdge = 0
    input.split('\n')
        .map(line => line
            .split(' -> ')
            .map(xy => xy
                .split(',')
                .map(c => parseInt(c)))
            .forEach((xy, i, coords) => {
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
                        cave[ay][x] = true
                    }
                } else if (ax === bx) {
                    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
                        if (typeof cave[y] === 'undefined') {
                            cave[y] = []
                        }
                        cave[y][ax] = true
                    }
                }
            }))
    const ground = cave.length
    for (let i = 0; i <= ground; i++) {
        if (typeof cave[i] === 'undefined')
            cave[i] = []
    }
    return {cave, leftEdge, rightEdge, ground}
}

console.assert(getSandCapacity(testInput) === 24)
console.log(getSandCapacity(input))
