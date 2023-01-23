import * as fs from 'fs';
import {
    advanceHeroAndElephant,
    initializeElephantState,
    maximizePressureReleaseWithElephant,
    parse, parseToObject,
    Valve
} from "./solution-b.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves: Map<string, Valve> = parse(testInput)
const testValvesObj = parseToObject(testInput)
console.log(JSON.stringify(testValvesObj, null, 1))

const input = fs.readFileSync('input.txt', 'utf-8');
const valves: Map<string, Valve> = parse(input)

/* TESTS PART B */

/*
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
// console.log(afterFirstElephantMove)
const firstElephantState = afterFirstElephantMove
    .find(state => state.elephant.walkingTowards === 'JJ' && state.hero.walkingTowards === 'DD')
console.log(firstElephantState)

const afterSecondElephantMove = advanceHeroAndElephant(firstElephantState, testValves);
const secondElephantState = afterSecondElephantMove
    .find(state => state.elephant.walkingTowards === 'JJ' && state.hero.walkingTowards === 'HH')
console.log(secondElephantState)

const afterThirdElephantMove = advanceHeroAndElephant(secondElephantState, testValves);
const thirdElephantState = afterThirdElephantMove
    .find(state => state.elephant.walkingTowards === 'BB' && state.hero.walkingTowards === 'HH')
console.log(thirdElephantState)
console.assert(thirdElephantState.roundsLeft === 23)
console.assert(thirdElephantState.flowPerRound === 41)
console.assert(thirdElephantState.pressureReleased === 20)

const afterFourthElephantMove = advanceHeroAndElephant(thirdElephantState, testValves);
console.log(afterFourthElephantMove)
const fourthElephantState = afterFourthElephantMove
    .find(state => state.elephant.walkingTowards === 'CC' && state.hero.walkingTowards === 'EE')
console.log(fourthElephantState)
console.assert(fourthElephantState.roundsLeft === 19)
console.assert(fourthElephantState.flowPerRound === 76)
console.assert(fourthElephantState.pressureReleased === 184)

const afterFifthElephantMove = advanceHeroAndElephant(fourthElephantState, testValves);
const fifthElephantState = afterFifthElephantMove
    .find(state => state.hero.walkingTowards === 'EE')
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
*/
// console.assert(maximizePressureReleaseWithElephant(testValves, 'AA') === 1707)


// console.log(maximizePressureReleaseWithElephant(valves, 'AA'))


