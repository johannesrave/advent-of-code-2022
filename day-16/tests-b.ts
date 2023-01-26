import * as fs from 'fs';
import {
    advanceHeroAndElephant,
    initializeElephantState,
    maximizePressureReleaseWithElephant,
    parseToObject,
} from "./solution-b.js";

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves = parseToObject(testInput)
const rel = await maximizePressureReleaseWithElephant(testValves, "AA", 26)
console.log(rel)
console.log()
//
// const input = fs.readFileSync('input.txt', 'utf-8');
// const valves = parseToObject(input)
// const rel_final = await maximizePressureReleaseWithElephant(valves)
// console.log(rel_final)
// console.log() // 2587 was TOO LOW



// console.log(maximizePressureReleaseWithElephant(valves, 'AA'))

// console.log()
console.log("UNIT TESTS")

const afterFirstElephantMove = initializeElephantState(testValves);
console.log(afterFirstElephantMove)
const firstElephantState = afterFirstElephantMove
    .find(([[,heroTarget], [,elephantTarget]]) =>
        [heroTarget, elephantTarget].includes('DD') && [heroTarget, elephantTarget].includes('JJ')
    )
console.log(JSON.stringify(firstElephantState))

const afterSecondElephantMove = advanceHeroAndElephant(testValves, firstElephantState);
const secondElephantState = afterSecondElephantMove
    .find(([[,heroTarget], [,elephantTarget]]) =>
        (heroTarget === 'JJ' && elephantTarget === 'HH') ||
        (heroTarget === 'HH' && elephantTarget === 'JJ')
    )
console.log(secondElephantState)

const afterThirdElephantMove = advanceHeroAndElephant(testValves, secondElephantState);
const thirdElephantState = afterThirdElephantMove
    .find(([[,heroTarget], [,elephantTarget]]) =>
        (heroTarget === 'BB' && elephantTarget === 'HH') ||
        (heroTarget === 'HH' && elephantTarget === 'BB')
    )
console.log(thirdElephantState)
console.assert(thirdElephantState[3] === 41)
console.assert(thirdElephantState[4] === 20)
console.assert(thirdElephantState[5] === 23)

const afterFourthElephantMove = advanceHeroAndElephant(testValves, thirdElephantState);
const fourthElephantState = afterFourthElephantMove
    .find(([[heroPos,heroTarget], [elephantPos,elephantTarget]]) =>
        (heroPos === 'BB' && heroTarget === 'CC') && (elephantPos === 'HH' && elephantTarget === 'EE')
    )
console.log(fourthElephantState)
console.assert(fourthElephantState[3] === 76)
console.assert(fourthElephantState[4] === 184)
console.assert(fourthElephantState[5] === 19)

const afterFifthElephantMove = advanceHeroAndElephant(testValves, fourthElephantState);
const fifthElephantState = afterFifthElephantMove[0]
console.log(fifthElephantState)
console.assert(fifthElephantState[3] === 81)
console.assert(fifthElephantState[4] === 1707)
console.assert(fifthElephantState[5] === 0)


// const input = fs.readFileSync('input.txt', 'utf-8');
// const valves: Map<string, Valve> = parse(input)
