import * as fs from 'fs';
import {advanceState, findShortestPath, maximizePressureRelease, parse, Valve} from "./solution.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves: Map<string, Valve> = parse(testInput)

const input = fs.readFileSync('input.txt', 'utf-8');
parse(input);
/* TESTS PART A */

console.assert(testValves.get('AA'))
console.assert(testValves.get('AA').valve === 'AA')
console.assert(testValves.get('AA').flow === 0)
console.assert(testValves.get('AA').tunnels.includes('DD'))
console.assert(testValves.get('DD'))
console.assert(findShortestPath(testValves, 'AA', 'DD') === 1)
console.assert(findShortestPath(testValves, 'AA', 'JJ') === 2)
console.assert(findShortestPath(testValves, 'AA', 'CC') === 2)
console.assert(findShortestPath(testValves, 'AA', 'HH') === 5)

const afterFirstMove = advanceState({
    position: 'AA',
    roundsLeft: 30,
    flowPerRound: 0,
    unvisitedValves: new Set(['BB', 'CC', 'DD', 'EE', 'HH', 'JJ']),
    pressureReleased: 0
}, testValves);
const firstState = afterFirstMove.find(state => state.position === 'DD');
console.assert(firstState.roundsLeft === 28)
console.assert(firstState.flowPerRound === 20)
console.assert(firstState.pressureReleased === 0)

const afterSecondMove = advanceState(firstState, testValves);
const secondState = afterSecondMove.find(state => state.position === 'BB');
console.assert(secondState.roundsLeft === 25)
console.assert(secondState.flowPerRound === 33)
console.assert(secondState.pressureReleased === 60)
// console.log(afterSecondMove)

const afterThirdMove = advanceState(secondState, testValves);
const thirdState = afterThirdMove.find(state => state.position === 'JJ');
console.assert(thirdState.roundsLeft === 21)
console.assert(thirdState.flowPerRound === 54)
console.assert(thirdState.pressureReleased === 192)
// console.log(afterThirdMove)

const afterFourthMove = advanceState(thirdState, testValves);
const fourthState = afterFourthMove.find(state => state.position === 'HH');
console.assert(fourthState.roundsLeft === 13)
console.assert(fourthState.flowPerRound === 76)
console.assert(fourthState.pressureReleased === 624)
console.log(afterFourthMove)

console.assert(maximizePressureRelease(testValves, 'AA') === 1651)
// console.assert(main(valves, 'AA') === 1923)


/* TESTS PART B */
new Set(['BB', 'CC', 'DD', 'EE', 'HH', 'JJ']);
