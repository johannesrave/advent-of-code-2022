import * as fs from 'fs';

const input = fs.readFileSync('input.txt', 'utf-8')

console.log(findPlacesTouchedByTail(input))


function findPlacesTouchedByTail(input: string) {
    const headMoves = parseInput(input)
    let headPos: Pos = {x: 0, y: 0}
    let tailPos: Pos = {x: 0, y: 0}
    let tailMoves: Pos[] = [{x: 0, y: 0}]

    headMoves.forEach(({amt, dir}) => {
        for (let i = 0; i < amt; i++) {
            headPos = moveEnd(headPos, dir)
            if (isTailMoveNecessary(tailPos, headPos)) {
                tailPos = moveTowards(tailPos, headPos)
                tailMoves = pushIfUnique(tailPos, tailMoves)
            }
        }
    })
    return tailMoves.length
}

function parseInput(input: string) {
    return input.split('\n')
        .map(row => {
            const [dir, amt] = row.split(' ') as [Dir, string]
            return {dir, amt: parseInt(amt)}
        })
}

function moveEnd(ropeEnd: Pos, dir: Dir): Pos {
    switch (dir) {
        case "U":
            return {x: ropeEnd.x, y: ropeEnd.y + 1}
        case "D":
            return {x: ropeEnd.x, y: ropeEnd.y - 1}
        case "L":
            return {x: ropeEnd.x - 1, y: ropeEnd.y}
        case "R":
            return {x: ropeEnd.x + 1, y: ropeEnd.y}
    }
}

function isTailMoveNecessary(tailPos: Pos, headPos: Pos) {
    const vDist = headPos.x - tailPos.x
    const hDist = headPos.y - tailPos.y
    return (vDist > 1 || vDist < -1) || (hDist > 1 || hDist < -1)

}

function moveTowards(startPos: Pos, destPos: Pos) {
    const hDist = destPos.x - startPos.x
    const vDist = destPos.y - startPos.y

    switch (true) {
        case vDist > 1:
            return {x: destPos.x, y: destPos.y - 1}
        case vDist < -1:
            return {x: destPos.x, y: destPos.y + 1}
        case hDist > 1:
            return {x: destPos.x - 1, y: destPos.y}
        case hDist < -1:
            return {x: destPos.x + 1, y: destPos.y}
    }
}

function pushIfUnique(obj: Pos, arr: Pos[]) {
    const posExists = arr.findIndex((entry) => entry.x === obj.x && entry.y === obj.y) !== -1
    if (!posExists)
        arr.push(obj)
    return arr
}

const testRows = `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`

console.assert(findPlacesTouchedByTail(testRows) === 13)

type Pos = {
    x: number,
    y: number
}

type Dir = 'U' | 'D' | 'L' | 'R'
