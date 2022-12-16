import * as fs from 'fs';
import {Monkey} from "./monkey.js";

const ROUNDS = 20
const INSANE_ROUNDS = 10_000

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
const input = fs.readFileSync('input.txt', 'utf-8')

console.assert(calculateMonkeyBusiness(testInput, ROUNDS) === 10605)
console.assert(calculateMonkeyBusinessAndStayCool(testInput, INSANE_ROUNDS) === 2713310158)

console.log(calculateMonkeyBusinessAndStayCool(input, INSANE_ROUNDS))
console.assert(calculateMonkeyBusinessAndStayCool(input, INSANE_ROUNDS) === 20683044837)

function calculateMonkeyBusiness(input: string, numberOfRounds: number) {
    const monkeys = parseMonkeys(input);

    while (numberOfRounds > 0) {
        monkeys.forEach(monkey => monkey.inspectAllItems(monkeys))
        numberOfRounds--
    }

    return monkeys.sort((a, b) => b.inspections - a.inspections)
        .slice(0, 2)
        .reduce((res, cur) => res * cur.inspections, 1)
}

function calculateMonkeyBusinessAndStayCool(input: string, numberOfRounds: number) {
    const monkeys = parseMonkeys(input);

    while (numberOfRounds > 0) {
        monkeys.forEach(monkey => monkey.inspectAllItems(monkeys, monkey.inspectAndStayCool))
        numberOfRounds--
    }

    return monkeys.sort((a, b) => b.inspections - a.inspections)
        .slice(0, 2)
        .reduce((res, cur) => res * cur.inspections, 1)
}

function parseMonkeys(input: string) {
    const monkeys = input.split('\n\n').map(block => new Monkey(block))
    const commonDivisor = monkeys.map(monkey => monkey.divisor).reduce((product, cur) => product * cur, 1)
    monkeys.forEach(monkey => monkey.commonDivisor = commonDivisor)
    return monkeys;
}
