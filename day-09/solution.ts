import * as fs from 'fs';

const input = fs.readFileSync('input.txt', 'utf-8')

console.assert(findPlacesTouchedByTail(input, 2) === 6175)
console.assert(findPlacesTouchedByTail(input, 10) === 2578)
console.log(findPlacesTouchedByTail(input, 10))

function findPlacesTouchedByTail(input: string, length: number) {
    const headMoves = parseInput(input)
    let tail: Pos[] = Array(length).fill({x: 0, y: 0})
    let tailMoves: Pos[] = []

    headMoves.forEach(({amt, dir}) => {
        for (let i = 0; i < amt; i++) {
            for (const index of tail.keys()) {
                if (index === 0) {
                    tail[0] = moveHead(tail[0], dir)
                } else {
                    tail[index] = moveIfNecessary(tail[index], tail[index - 1])
                }
            }
            console.log(JSON.stringify(tail))
            tailMoves = pushIfUnique(tail[tail.length-1], tailMoves)
        }
    })
    console.log(JSON.stringify(tailMoves))
    return tailMoves.length
}

function parseInput(input: string) {
    return input.split('\n')
        .map(row => {
            const [dir, amt] = row.split(' ') as [Dir, string]
            return {dir, amt: parseInt(amt)}
        })
}

function moveHead(head: Pos, dir: Dir): Pos {
    switch (dir) {
        case "U":
            return {x: head.x, y: head.y + 1}
        case "D":
            return {x: head.x, y: head.y - 1}
        case "L":
            return {x: head.x - 1, y: head.y}
        case "R":
            return {x: head.x + 1, y: head.y}
    }
}

function moveIfNecessary(startPos: Pos, destPos: Pos) {
    const hDist = destPos.x - startPos.x
    const vDist = destPos.y - startPos.y

    switch (true) {
        case vDist >  1 && hDist > 1:   return {x: destPos.x - 1,   y: destPos.y - 1}
        case vDist >  1 && hDist < -1:  return {x: destPos.x + 1,   y: destPos.y - 1}
        case vDist < -1 && hDist > 1:   return {x: destPos.x - 1,   y: destPos.y + 1}
        case vDist < -1 && hDist < -1:  return {x: destPos.x + 1,   y: destPos.y + 1}
        case vDist >  1:                return {x: destPos.x,       y: destPos.y - 1}
        case vDist < -1:                return {x: destPos.x,       y: destPos.y + 1}
        case hDist >  1:                return {x: destPos.x - 1,   y: destPos.y}
        case hDist < -1:                return {x: destPos.x + 1,   y: destPos.y}
        default: return startPos
    }
}

function pushIfUnique(obj: Pos, arr: Pos[]) {
    const posExists = arr.findIndex((entry) => entry.x === obj.x && entry.y === obj.y) !== -1
    if (!posExists) {
        arr.push(obj)
    }
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

console.assert(findPlacesTouchedByTail(testRows, 2) === 13)
console.assert(findPlacesTouchedByTail(testRows, 10) === 1)

type Pos = {
    x: number,
    y: number
}

type Dir = 'U' | 'D' | 'L' | 'R'
