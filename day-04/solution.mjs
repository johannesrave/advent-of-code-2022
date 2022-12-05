import fs from 'fs'

const input = fs.readFileSync('input.txt', 'utf-8')

function sumContainedSections(input) {
    return input.split('\n')
        .map((line) => line
            .split(',')
            .map(elves => elves
                .split('-')
                .map(n => parseInt(n, 10))), 0)
        .reduce((sum, sects) =>
            (eitherIsFullyContained(sects)) ? sum+1 : sum, 0)
}

console.log(sumContainedSections(input))

function sumOverlappingSections(input) {
    return input.split('\n')
        .map((line) => line
            .split(',')
            .map(elves => elves
                .split('-')
                .map(n => parseInt(n, 10))), 0)
        .reduce((sum, sects) =>
            (bothAreOverlapping(sects) || eitherIsFullyContained(sects)) ? sum + 1 : sum, 0)
}

console.log(sumOverlappingSections(input))

function eitherIsFullyContained(sects) {
    return (sects[0][0] >= sects[1][0] && sects[0][1] <= sects[1][1]) ||
        (sects[0][0] <= sects[1][0] && sects[0][1] >= sects[1][1]);
}

function bothAreOverlapping(sects) {
    return (sects[0][0] >= sects[1][0] && sects[0][0] <= sects[1][1]) ||
        (sects[0][1] <= sects[1][1] && sects[0][1] >= sects[1][0]);
}
