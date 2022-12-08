import fs from 'fs'

const input = fs.readFileSync('input.txt', 'utf-8')

function findBeginMarker(input) {
    return [...input].findIndex((symbol, i, arr) => {
        return new Set(arr.slice(i, i + 4)).size === 4
    }) + 4
}

console.log(findBeginMarker(input))


console.assert(findBeginMarker("bvwbjplbgvbhsrlpgdmjqwftvncz") === 5)
console.assert(findBeginMarker("nppdvjthqldpwncqszvftbrmjlhg") === 6)