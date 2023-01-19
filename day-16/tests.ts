import * as fs from 'fs';
import {advanceState, findShortestPath, maximizePressureRelease, parse, Valve} from "./solution.js";
import {advanceHeroAndElephant, initializeElephantState, maximizePressureReleaseWithElephant} from "./solution-b.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves: Map<string, Valve> = parse(testInput)

const input = fs.readFileSync('input.txt', 'utf-8');
const valves: Map<string, Valve> = parse(input)

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
const initialElephantState = {
    hero: {
        position: 'AA',
        walkingTowards: undefined,
        roundsNeeded: -1
    },
    elephant: {
        position: 'AA',
        walkingTowards: undefined,
        roundsNeeded: -1
    },
    roundsLeft: 26,
    flowPerRound: 0,
    unvisitedValves: new Set(['BB', 'CC', 'DD', 'EE', 'HH', 'JJ']),
    pressureReleased: 0
};
const afterFirstElephantMove = initializeElephantState(initialElephantState, testValves);
const firstElephantState = afterFirstElephantMove
    .find(state => state.elephant.walkingTowards === 'DD' && state.hero.walkingTowards === 'JJ')
console.log(firstElephantState)

const afterSecondElephantMove = advanceHeroAndElephant(firstElephantState, testValves);
const secondElephantState = afterSecondElephantMove
    .find(state => state.elephant.walkingTowards === 'HH' && state.hero.walkingTowards === 'JJ')
console.log(secondElephantState)

const afterThirdElephantMove = advanceHeroAndElephant(secondElephantState, testValves);
const thirdElephantState = afterThirdElephantMove
    .find(state => state.elephant.walkingTowards === 'HH' && state.hero.walkingTowards === 'BB')
console.log(thirdElephantState)
console.assert(thirdElephantState.roundsLeft === 23)
console.assert(thirdElephantState.flowPerRound === 41)
console.assert(thirdElephantState.pressureReleased === 20)

const afterFourthElephantMove = advanceHeroAndElephant(thirdElephantState, testValves);
const fourthElephantState = afterFourthElephantMove
    .find(state => state.elephant.walkingTowards === 'EE' && state.hero.walkingTowards === 'CC')
console.log(fourthElephantState)
console.assert(fourthElephantState.roundsLeft === 19)
console.assert(fourthElephantState.flowPerRound === 76)
console.assert(fourthElephantState.pressureReleased === 184)

const afterFifthElephantMove = advanceHeroAndElephant(fourthElephantState, testValves);
const fifthElephantState = afterFifthElephantMove
    .find(state => state.elephant.walkingTowards === 'EE')
console.log(fifthElephantState)
console.assert(fifthElephantState.roundsLeft === 17)
console.assert(fifthElephantState.flowPerRound === 78)
console.assert(fifthElephantState.pressureReleased === 336)

const afterSixthElephantMove = advanceHeroAndElephant(fifthElephantState, testValves);
const [sixthElephantState] = afterSixthElephantMove
console.log(sixthElephantState)
console.assert(sixthElephantState.roundsLeft === 15)
console.assert(sixthElephantState.flowPerRound === 81)
console.assert(sixthElephantState.pressureReleased === 492)


console.log(maximizePressureReleaseWithElephant(testValves, 'AA'))
console.assert(maximizePressureReleaseWithElephant(testValves, 'AA') === 1707)
