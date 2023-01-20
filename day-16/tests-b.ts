import * as fs from 'fs';
import {
    advanceHeroAndElephant,
    initializeElephantState,
    maximizePressureReleaseWithElephant,
    parse,
    Valve
} from "./solution-b.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves: Map<string, Valve> = parse(testInput)

const input = fs.readFileSync('input.txt', 'utf-8');
const valves: Map<string, Valve> = parse(input)

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
console.log(afterFourthElephantMove)
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


// console.log(maximizePressureReleaseWithElephant(valves, 'AA'))


