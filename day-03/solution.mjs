import fs from 'fs'

const input = fs.readFileSync('input.txt', 'utf-8')

function sumCompartmentPriorities(input) {
    return input.split('\n')
        .reduce((sum, line) => {
            const firstCompartment = new Set([...line].slice(0, line.length / 2))
            const secondCompartment = new Set([...line].slice(line.length / 2))
            for (const item of secondCompartment) {
                if (firstCompartment.has(item)) return sum + getItemPriority(item)
            }
            return sum
        }, 0)
}

console.log(sumCompartmentPriorities(input))

function sumBadgePriorities(input) {
    return input.split('\n')
        .reduce((sum, _, index, arr) => {
            if(index % 3 === 1 || index % 3 === 2) return sum
            const elf1 = new Set([...arr[index]])
            const elf2 = new Set([...arr[index+1]])
            const elf3 = new Set([...arr[index+2]])
            for (const item of elf1) {
                if (elf2.has(item) && elf3.has(item)) return sum + getItemPriority(item)
            }
        }, 0)
}

console.log(sumBadgePriorities(input))

function getItemPriority(item) {
    const lowercaseOffset = 'a'.charCodeAt(0) - 1
    const uppercaseOffset = 'A'.charCodeAt(0) - 27
    const itemCode = item.charCodeAt(0);

    if (itemCode > 'a'.charCodeAt(0) && itemCode <= 'z'.charCodeAt(0)) {
        return itemCode - lowercaseOffset
    } else if (itemCode > 'A'.charCodeAt(0) && itemCode <= 'Z'.charCodeAt(0)) {
        return itemCode - uppercaseOffset
    } else {
        return 0
    }
}