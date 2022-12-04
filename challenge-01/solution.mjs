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

console.log(findHungriestElf(input))
