import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
const input = fs.readFileSync('input.txt', 'utf-8')

console.assert(addUpIndicesOfOrderedPairs(testInput) === 13)
console.log(addUpIndicesOfOrderedPairs(input)) // 6656

console.assert(calculateDecoderKey(testInput) === 140)
console.log(calculateDecoderKey(input)) // 19716

function addUpIndicesOfOrderedPairs(input: string) {
    const pairs = input
        .split('\n\n')
        .map(pair => pair
            .split('\n').map(arr => eval(arr))) as [any[], any[]][]

    let sum = 0
    for (let i = 0; i < pairs.length; i++) {
        sum = isOrdered(pairs[i]) ? sum + i + 1 : sum
    }
    return sum
}

function calculateDecoderKey(input: string) {
    const packages = input
        .split('\n\n')
        .flatMap(pair => pair
            .split('\n').map(arr => eval(arr))) as [any[], any[]][]

    const divA = [[2]];
    const divB = [[6]];
    const sortedList = [...packages, divA, divB].sort((l, r) => compare(l, r)).reverse()
    return (sortedList.indexOf(divA)+1) * (sortedList.indexOf(divB)+1)
}

function isOrdered(pair: [any[], any[]]) {
    const [left, right] = pair
    for (const j of left.keys()) {
        const _isOrdered = compare(left, right)
        switch (_isOrdered) {
            case 1:
                return true
            case -1:
                return false
        }
    }
    return true
}

function compare(a, b) {
    if (typeof a === 'undefined' && typeof b !== 'undefined') {
        return 1
    } else if (typeof b === 'undefined') {
        return -1
    } else if (typeof a === 'number' && typeof b === 'number') {
        if (a < b) {
            return 1
        } else if (a > b) {
            return -1
        }
    } else if (typeof a === 'object' && typeof b === 'number') {
        return compare(a, [b])
    } else if (typeof a === 'number' && typeof b === 'object') {
        return compare([a], b)
    } else if (typeof a === 'object' && typeof b === 'object') {
        if (a.length === 0 && b.length > 0) {
            return 1
        } else if (a.length > 0 && b.length === 0) {
            return -1
        } else if (a.length === 0 && b.length === 0) {
            return 0
        }

        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const res = compare(a[i], b[i])
            if (res !== 0) {
                return res
            }
        }
    }
    return 0
}

console.assert(compare(1, 1) === 0)
console.assert(compare(1, 2) === 1)
console.assert(compare(2, 1) === -1)
console.assert(compare(1, undefined) === -1)
console.assert(compare(1, [2]) === 1)
console.assert(compare([2], 1) === -1)
console.assert(compare([2], []) === -1)
console.assert(compare([], [2]) === 1)
console.assert(compare([2], undefined) === -1)
console.assert(compare([2], [2]) === 0)
console.assert(compare([[1]], [[2]]) === 1)
console.assert(compare([[2]], [[1]]) === -1)
console.assert(compare([[2]], [[]]) === -1)
console.assert(compare([[2]], [[2]]) === 0)
console.assert(compare([], []) === 0)
console.assert(compare([], [[]]) === 1)
console.assert(compare([], [3]) === 1)
console.assert(compare([[]], []) === -1)
console.assert(compare([[]], [[]]) === 0)
