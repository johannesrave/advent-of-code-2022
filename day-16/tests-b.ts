import * as fs from 'fs';
import {
    advanceHeroAndElephant,
    initializeElephantState,
    maximizePressureReleaseWithElephant,
    parseToObject,
} from "./solution-b.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves = parseToObject(testInput)
console.log(JSON.stringify(testValves, null, 2))
const rel = maximizePressureReleaseWithElephant(testValves)
console.log(rel)
console.log()

const input = fs.readFileSync('input.txt', 'utf-8');
const valves = parseToObject(input)
// console.log(maximizePressureReleaseWithElephant(valves, 'AA'))

// console.log()
// console.log("UNIT TESTS")
//
const afterFirstElephantMove = initializeElephantState(testValves);
// console.log(afterFirstElephantMove)
const firstElephantState = afterFirstElephantMove
    .find(([[,heroTarget], [,elephantTarget]]) =>
        [heroTarget, elephantTarget].includes('DD') && [heroTarget, elephantTarget].includes('JJ')
    )
console.log(JSON.stringify(firstElephantState))
//
// const afterSecondElephantMove = advanceHeroAndElephant(testValves, firstElephantState);
// const secondElephantState = afterSecondElephantMove
//     .find(([[,heroTarget], [,elephantTarget]]) =>
//         (heroTarget === 'JJ' && elephantTarget === 'HH') ||
//         (heroTarget === 'HH' && elephantTarget === 'JJ')
//     )
// console.log(secondElephantState)
//
// const afterThirdElephantMove = advanceHeroAndElephant(testValves, secondElephantState);
// const thirdElephantState = afterThirdElephantMove
//     .find(([[,heroTarget], [,elephantTarget]]) =>
//         (heroTarget === 'BB' && elephantTarget === 'HH') ||
//         (heroTarget === 'HH' && elephantTarget === 'BB')
//     )
// console.log(thirdElephantState)
// console.assert(thirdElephantState[3] === 41)
// console.assert(thirdElephantState[4] === 20)
// console.assert(thirdElephantState[5] === 23)
//
// const afterFourthElephantMove = advanceHeroAndElephant(testValves, thirdElephantState);
// const fourthElephantState = afterFourthElephantMove
//     .find(([[heroPos,heroTarget], [elephantPos,elephantTarget]]) =>
//         (heroPos === 'HH' && heroTarget === 'EE') && (elephantPos === 'BB' && elephantTarget === 'CC')
//     )
// console.log(fourthElephantState)
// console.assert(fourthElephantState[3] === 76)
// console.assert(fourthElephantState[4] === 184)
// console.assert(fourthElephantState[5] === 19)
//
// const afterFifthElephantMove = advanceHeroAndElephant(testValves, fourthElephantState);
// const fifthElephantState = afterFifthElephantMove[0]
// console.log(fifthElephantState)
// console.assert(fifthElephantState[3] === 78)
// console.assert(fifthElephantState[4] === 336)
// console.assert(fifthElephantState[5] === 17)
//
// const afterSixthElephantMove = advanceHeroAndElephant(testValves, fifthElephantState);
// const [sixthElephantState] = afterSixthElephantMove
// console.log(sixthElephantState)
// console.assert(sixthElephantState[3] === 81)
// console.assert(sixthElephantState[4] === 492)
// console.assert(sixthElephantState[5] === 15)


// const input = fs.readFileSync('input.txt', 'utf-8');
// const valves: Map<string, Valve> = parse(input)

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


