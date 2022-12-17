import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
const input = fs.readFileSync('input.txt', 'utf-8')


console.assert(findFewestStepsToTheTop(testInput) === 31)
console.log(findFewestStepsToTheTop(testInput))
console.log(findFewestStepsToTheTop(input))
// 1248 is too high


function findFewestStepsToTheTop(input: string) {
    const board = input.split('\n')
        .map(row => row.split('').map(c => c === 'E' ? 26 : toHeight(c)))
    const visited = board.map(row => row.map(s => -1))
    const startValue = toHeight('S')

    const startRow = board.findIndex(row => row.includes(startValue))
    const startCol = board[startRow].indexOf(startValue)
    let pos = {x: startCol, y: startRow, z: 0}
    let steps = 0

    const res = walkPath(pos, board, visited, steps).flat().sort((a, b) => b - a);

    // console.log(res)
    console.log([...res].sort((a, b) => b - a))

    return res.flat().sort((a, b) => b - a)[0] - 1
}

function walkPath(pos: Pos, board: number[][], visited: number[][], steps: number): number[] {
    let candidates = [pos]
    console.log(candidates, steps)
    do {
        const [pos] = candidates
        visited[pos.y][pos.x] = visited[pos.y][pos.x] > steps || visited[pos.y][pos.x] === -1 ? steps : visited[pos.y][pos.x]
        steps++
        if (pos.z === 26) {
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            console.log("found the top!", pos)
            console.log(visited.map(row => row.join('')).join('\n'))
            return [steps]
            // return [visited.map(row => row.filter(v => v).length).reduce((sum, cur) => sum + cur, 0)]
        }
        const neighbours = {
            ...(pos.y > 0 && {up: {x: pos.x, y: pos.y - 1, z: board[pos.y - 1][pos.x]}}),
            ...(pos.x < board[0].length - 1 && {right: {x: pos.x + 1, y: pos.y, z: board[pos.y][pos.x + 1]}}),
            ...(pos.y < board.length - 1 && {down: {x: pos.x, y: pos.y + 1, z: board[pos.y + 1][pos.x]}}),
            ...(pos.x > 0 && {left: {x: pos.x - 1, y: pos.y, z: board[pos.y][pos.x - 1]}})
        }
        console.log(visited.map(row => row.join('')).join('\n'))

        candidates = Object.values(neighbours)
            .filter((v) => visited[v.y][v.x] === -1 || visited[v.y][v.x] > steps + 1)
            .filter((v) => v.z <= pos.z + 1)
    } while (candidates.length === 1)

    if (candidates.length === 0) {
        // console.log("sackgasse at ", pos)
        return [-1]
    } else {
        // console.log("keep walking")
        console.log(candidates)
        return candidates.map(c => walkPath(c, board, visited, steps)).flat()
    }
}

function toHeight(c: string) {
    return c.charCodeAt(0) - 'a'.charCodeAt(0);
}

type Pos = { x: number; y: number; z: number }