import fs from 'fs';

const input = fs.readFileSync('input.txt', 'utf-8');

function findHungriestElf(input) {
  return input
    .split('\n\n')
    .map((e) => e
      .split('\n')
      .map(f => parseInt(f)))
    .map(l => l.reduce((sum, cal) => sum + cal))
    .reduce((max, cur) => max = (cur > max) ? cur : max, 0)
}

function findThreeHungriestElves(input) {
  return input
    .split('\n\n')
    .map((e) => e
      .split('\n')
      .map(f => parseInt(f)))
    .map(l => l.reduce((sum, cal) => sum + cal))
    .reduce(
      (max, cur) => (cur > max[0]) ? [cur, ...max].sort().slice(1, 4) : max,
      [0, 0, 0])
    .reduce((sum, cal) => sum + cal, 0);
}

console.log(findHungriestElf(input))
console.log(findThreeHungriestElves(input))
