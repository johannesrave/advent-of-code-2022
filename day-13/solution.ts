import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
const input = fs.readFileSync('input.txt', 'utf-8')

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

function isOrdered(pair: [any[], any[]]) {
    const [left, right] = pair
    for (const j of left.keys()) {
        const _isOrdered = compare(left, right)
        switch (_isOrdered) {
            case 'ordered':
                return true
            case 'unordered':
                return false
        }
    }
    return true
}

function compare(a, b) {
    if (typeof a === 'undefined' && typeof b !== 'undefined') {
        return 'ordered'
    } else if (typeof b === 'undefined') {
        return 'unordered'
    } else if (typeof a === 'number' && typeof b === 'number') {
        if (a < b) {
            return 'ordered'
        } else if (a > b) {
            return 'unordered'
        }
    } else if (typeof a === 'object' && typeof b === 'number') {
        return compare(a, [b])
    } else if (typeof a === 'number' && typeof b === 'object') {
        return compare([a], b)
    } else if (typeof a === 'object' && typeof b === 'object') {
        if (a.length === 0 && b.length > 0) {
            return 'ordered'
        } else if (a.length > 0 && b.length === 0) {
            return 'unordered'
        } else if (a.length === 0 && b.length === 0) {
            return 'inconclusive'
        }

        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const res = compare(a[i], b[i])
            if (res !== 'inconclusive') {
                return res
            }
        }
    }
    return 'inconclusive'
}

console.assert(compare(1, 1) === 'inconclusive')
console.assert(compare(1, 2) === 'ordered')
console.assert(compare(2, 1) === 'unordered')
console.assert(compare(1, undefined) === 'unordered')
console.assert(compare(1, [2]) === 'ordered')
console.assert(compare([2], 1) === 'unordered')
console.assert(compare([2], []) === 'unordered')
console.assert(compare([], [2]) === 'ordered')
console.assert(compare([2], undefined) === 'unordered')
console.assert(compare([2], [2]) === 'inconclusive')
console.assert(compare([[1]], [[2]]) === 'ordered')
console.assert(compare([[2]], [[1]]) === 'unordered')
console.assert(compare([[2]], [[]]) === 'unordered')
console.assert(compare([[2]], [[2]]) === 'inconclusive')
console.assert(compare([], []) === 'inconclusive')
console.assert(compare([], [[]]) === 'ordered')
console.assert(compare([], [3]) === 'ordered')
console.assert(compare([[]], []) === 'unordered')
console.assert(compare([[]], [[]]) === 'inconclusive')

console.assert(addUpIndicesOfOrderedPairs(testInput) === 13)
console.log(addUpIndicesOfOrderedPairs(testInput))
console.log(addUpIndicesOfOrderedPairs(input))
