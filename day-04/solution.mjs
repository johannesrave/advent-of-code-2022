import fs from 'fs'

const input = fs.readFileSync('input.txt', 'utf-8')

function sumContainedSections(input) {
    return input.split('\n')
        .map((line) => line
            .split(',')
            .map(elves => elves
                .split('-')
                .map(n => parseInt(n, 10))), 0)
        .reduce((sum, elves) =>
            (eitherIsFullyContained(elves)) ? sum+1 : sum, 0)
}

console.log(sumContainedSections(input))

function sumOverlappingSections(input) {
    return input.split('\n')
        .map((line) => line
            .split(',')
            .map(elves => elves
                .split('-')
                .map(n => parseInt(n, 10))), 0)
        .reduce((sum, elves) =>
            (bothAreOverlapping(elves) || eitherIsFullyContained(elves)) ? sum + 1 : sum, 0)
}

console.log(sumOverlappingSections(input))

function eitherIsFullyContained(elves) {
    return (elves[0][0] >= elves[1][0] && elves[0][1] <= elves[1][1]) ||
        (elves[0][0] <= elves[1][0] && elves[0][1] >= elves[1][1]);
}

function bothAreOverlapping(elves) {
    return (elves[0][0] >= elves[1][0] && elves[0][0] <= elves[1][1]) ||
        (elves[0][1] <= elves[1][1] && elves[0][1] >= elves[1][0]);
}
