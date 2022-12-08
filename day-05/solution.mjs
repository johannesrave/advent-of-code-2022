import fs from 'fs'

const input = fs.readFileSync('input.txt', 'utf-8')

function moveAllCrates(moves, stacks) {
    moves.forEach(move => makeMove(move, stacks))
    return [...stacks.values()].map((stack) => stack.pop()).join('')
}

console.log(moveAllCrates(parseMoves(input), parseStacks(input)))

function parseMoves(input) {
    const rx = /^move (\d*) from (\d) to (\d)$/
    return input.split('\n\n')[1]
        .split('\n')
        .map(line => line.match(rx))
        .map(match => ({
            amount: parseInt(match[1]), start: parseInt(match[2]) - 1, end: parseInt(match[3]) - 1
        }))
}

function parseStacks(input) {
    const matrix = input.split('\n\n')[0]
        .split('\n')
        .reverse()
        .slice(1)
        .map(line => [...line])
        .map(line => line.filter((symbol, i) => (i - 1) % 4 === 0))

    return matrix[0]
        .map((val, index) => matrix.map(row => row[row.length - 1 - index]))
        .reverse()
        .map(stack => stack.filter(crate => crate !== ' '))

}

function makeMove(move, stacks) {
    for (let m = move.amount; m > 0; m--) {
        const crate = stacks[move.start].pop()
        stacks[move.end].push(crate)
    }
    return stacks
}
// CNSZFDVLJ
