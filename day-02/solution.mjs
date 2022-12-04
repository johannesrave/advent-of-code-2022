import fs from 'fs';

const input = fs.readFileSync('input.txt', 'utf-8');

const pointsPerCounter = {
  A: {X: 3, Y: 6, Z: 0},
  B: {X: 0, Y: 3, Z: 6},
  C: {X: 6, Y: 0, Z: 3},
}

const pointsPerHand = {X: 1, Y: 2, Z: 3}

function calculateScoreByStrategyGuide(input) {
  return input.split('\n')
    .map(line => line.split(' '))
    .reduce((sum, [opp, me]) => sum + pointsPerCounter[opp][me] + pointsPerHand[me], 0)
}
console.log(calculateScoreByStrategyGuide(input));


const pointsPerNeededHand = {
  A: {X: 3, Y: 1, Z: 2},
  B: {X: 1, Y: 2, Z: 3},
  C: {X: 2, Y: 3, Z: 1},
}
const pointsPerResult = {X: 0, Y: 3, Z: 6}

function calculateScoreByNeededHand(input) {
  return input.split('\n')
    .map(line => line.split(' '))
    .reduce((sum, [opp, result]) => sum + pointsPerNeededHand[opp][result] + pointsPerResult[result], 0)
}
console.log(calculateScoreByNeededHand(input));

