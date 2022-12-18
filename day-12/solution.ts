import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
const input = fs.readFileSync('input.txt', 'utf-8')


console.assert(findFewestStepsToTheTop(testInput) === 31)
console.log(findFewestStepsToTheTop(testInput))
console.log(findFewestStepsToTheTop(input))
console.assert(findFewestStepsToTheTop(input) === 481)

// 481 is the answer, but this fails - i don't know where
// the fault lies, i always get 483 with an algo that works for the testinput.


function findFewestStepsToTheTop(input: string) {
    const heightMap = input.split('\n')
        .map(row => row.split('').map(toHeight))

    const board = addBorders(heightMap)

    // console.log(board.map(row => row.map(s => (s.toString().padStart(3))).join("|")).join('\n'))

    const startValue = -1
    const startRow = board.findIndex(row => row.includes(startValue))
    const startCol = board[startRow].indexOf(startValue)
    const pos = {x: startCol, y: startRow, z: 0}

    const visited = board.map(row => row.map(() => -1))
    const comingFrom = board.map(row => row.map(() => ({x: 99, y: 99, z: 99})))
    visited[pos.y][pos.x] = 0

    const squaresToExplore = [pos]
    do {
        const pos = squaresToExplore.shift()
        const steps = visited[pos.y][pos.x]

        const neighbours = [
            {x: pos.x, y: pos.y - 1, z: board[pos.y - 1][pos.x]},
            {x: pos.x + 1, y: pos.y, z: board[pos.y][pos.x + 1]},
            {x: pos.x, y: pos.y + 1, z: board[pos.y + 1][pos.x]},
            {x: pos.x - 1, y: pos.y, z: board[pos.y][pos.x - 1]}]

        const candidates = neighbours
            .filter(square => visited[square.y][square.x] === -1)
            .filter(square => square.z <= pos.z + 1);

        for (const square of candidates) {
            if (square.z === 26) {
                return steps+1
            }
            visited[square.y][square.x] = steps + 1
            comingFrom[square.y][square.x] = pos
            squaresToExplore.push(square)
        }
        squaresToExplore.sort((a, b) => visited[a.y][a.x] - visited[b.y][b.x])
    } while (squaresToExplore.length)

    // console.log(visited.map(row => row.map(s => (s.toString().padStart(3))).join("|")).join('\n'))
    // console.log(comingFrom.map(row => row.map(s => (s.x.toString().padStart(3) + "." + s.y.toString().padStart(3))).join('|')).join('\n'))

    return -1
}

function addBorders(board: number[][]) {
    board = board.map(row => [99, ...row, 99])
    board.push(board[0].map(() => 99))
    board.unshift(board[0].map(() => 99))

    return board
}

function toHeight(c: string) {
    switch (c) {
        case 'E':
            return 26
        case 'S':
            return -1
        default:
            return c.charCodeAt(0) - 'a'.charCodeAt(0)
    }
}