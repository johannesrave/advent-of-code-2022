import fs from 'fs'

const input = fs.readFileSync('input.txt', 'utf-8')

function findStartOfPacketMarker(input) {
    return [...input].findIndex((symbol, i, arr) => {
        return new Set(arr.slice(i, i + 4)).size === 4
    }) + 4
}

function findStartOfMessageParker(input) {
    return [...input].findIndex((symbol, i, arr) => {
        return new Set(arr.slice(i, i + 14)).size === 14
    }) + 14
}

console.log(findStartOfPacketMarker(input))
console.log(findStartOfMessageParker(input))


console.assert(findStartOfPacketMarker("bvwbjplbgvbhsrlpgdmjqwftvncz") === 5)
console.assert(findStartOfPacketMarker("nppdvjthqldpwncqszvftbrmjlhg") === 6)

console.assert(findStartOfMessageParker("mjqjpqmgbljsphdztnvjfqwrcgsmlb") === 19)
console.assert(findStartOfMessageParker("bvwbjplbgvbhsrlpgdmjqwftvncz") === 23)
