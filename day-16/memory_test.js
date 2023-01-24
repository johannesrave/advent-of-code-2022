import {writeHeapSnapshot} from "v8";

const n = 1_000_000
const container = []
const vals = ["AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ"]

console.log(process.memoryUsage())
writeHeapSnapshot("./0_empty.heapsnapshot")

// for (let i = 0; i < n; i++) {
//     container.push([i])
// }
//
// console.log(process.memoryUsage())
// writeHeapSnapshot("./1_number-arrays.heapsnapshot")
//
// while (container.length){
//     container.pop()
// }

// console.log(process.memoryUsage())
// writeHeapSnapshot("./empty.heapsnapshot")

// for (let i = 0; i < n; i++) {
//     container.push([true])
// }
//
// console.log(process.memoryUsage())
// writeHeapSnapshot("./boolean-arrays.heapsnapshot")
//
// while (container.length){
//     container.pop()
// }

// console.log(process.memoryUsage())
// writeHeapSnapshot("./empty.heapsnapshot")


for (let i = 0; i < n; i++) {
    container.push([vals[i % vals.length]])
}

console.log(container.slice(0, 10))
console.log(process.memoryUsage())
writeHeapSnapshot("./string-arrays.heapsnapshot")

while (container.length){
    container.pop()
}

for (let i = 0; i < n; i++) {


    container.push(new Set([vals[i % vals.length]]))
}

console.log(container.slice(0, 10))
console.log(process.memoryUsage())
writeHeapSnapshot("./string-sets.heapsnapshot")

// while (container.length){
//     container.pop()
// }

/*
for (let i = 0; i < n; i++) {
    container.push({[i]: i})
    if (i + 1 % 1_000_000 === 0) console.log(i + "objects")
}

console.log(process.memoryUsage())
writeHeapSnapshot("./3_objects.heapsnapshot")

while (container.length){
    container.pop()
}

console.log(process.memoryUsage())
writeHeapSnapshot("./4_empty.heapsnapshot")
*/
