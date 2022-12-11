import * as fs from 'fs';

const forest = fs.readFileSync('input.txt', 'utf-8')
    .split('\n')
    .map(row => row.split('').map(n => parseInt(n)))

console.log(findVisibleTrees(forest))
console.log(findHighestScenicScore(forest))

function findVisibleTrees(forest: number[][]) {
    const verticalForest = transpose(forest)

    return forest.map((row, y) => row
        .filter((tree, x) =>
            isGreaterThanAll(tree, row.slice(0, x)) ||
            isGreaterThanAll(tree, row.slice(x + 1)) ||
            isGreaterThanAll(tree, verticalForest[x].slice(0, y)) ||
            isGreaterThanAll(tree, verticalForest[x].slice(y + 1))))
        .reduce((sum, row) => sum + row.length, 0)
}

function findHighestScenicScore(forest: number[][]) {
    const verticalForest = transpose(forest)

    return forest.map((row, y) => row
        .map((tree, x) =>
            findTreesVisibleFrom(tree, row.slice(0, x).reverse()) *
            findTreesVisibleFrom(tree, row.slice(x + 1)) *
            findTreesVisibleFrom(tree, verticalForest[x].slice(0, y).reverse()) *
            findTreesVisibleFrom(tree, verticalForest[x].slice(y + 1)))
        .reduce((max, tree) => tree > max ? tree : max, 0)
    )
    .reduce((max, row) => row > max ? row : max, 0)
}

function transpose(matrix) {
    return matrix[0].map((col, index) => matrix.map(row => row[index]));
}

function isGreaterThanAll(num, arr) {
    return [...new Set(arr)].every(n => num > n)
}

function findTreesVisibleFrom(tree: number, lane: number[]) {
    let visibleTrees = 0
    for (let i = visibleTrees; i < lane.length; i++) {
        visibleTrees = i+1;
        if (tree <= lane[i]) break;
    }
    return visibleTrees
}

const testRows = [
    [3, 0, 3, 7, 3],
    [2, 5, 5, 1, 2],
    [6, 5, 3, 3, 2],
    [3, 3, 5, 4, 9],
    [3, 5, 3, 9, 0]
]

console.assert(findVisibleTrees(testRows) === 21)
console.assert(findHighestScenicScore(testRows) === 8)
