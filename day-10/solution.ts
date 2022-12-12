import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
console.assert(calculateSignalStrength(testInput) === 13140)
console.assert(renderCRT(testInput) ===
"##..##..##..##..##..##..##..##..##..##..\n" +
"###...###...###...###...###...###...###.\n" +
"####....####....####....####....####....\n" +
"#####.....#####.....#####.....#####.....\n" +
"######......######......######......####\n" +
"#######.......#######.......#######....."
)
console.log(renderCRT(testInput))

const input = fs.readFileSync('input.txt', 'utf-8')
console.log(calculateSignalStrength(input))
console.log(renderCRT(input))
// EPJBRKAH


function calculateSignalStrength(input: string) {
    const commands = input.split('\n')
    let signalStrength = 0
    let addReg = 0
    let xReg = 1
    let processing = false;
    let cycle = 1
    while (cycle <= 220) {
        if ((cycle - 20) % 40 === 0) {
            signalStrength += (cycle * xReg)
        }
        cycle++
        if (processing) {
            xReg += addReg
            addReg = 0
            processing = false
            continue
        }
        const command = commands.shift()
        if (command.startsWith('addx')) {
            addReg = parseInt(command.split(' ')[1])
            processing = true
        }
    }
    return signalStrength

}

function renderCRT(input: string) {
    const commands = input.split('\n')
    let addReg = 0
    let xReg = 1
    let processing = false
    let cycle = 1
    let CRT = []
    while (cycle <= 240) {
        CRT = updateCRT(cycle, xReg+1, CRT)
        cycle++
        if (processing) {
            xReg += addReg
            addReg = 0
            processing = false
            continue
        }

        const command = commands.shift()
        if (command.startsWith('addx')) {
            addReg = parseInt(command.split(' ')[1])
            processing = true
        }
    }

    const CRTRows = []
    for (let i = 0; i < CRT.length; i += 40) {
        const chunk = CRT.slice(i, i + 40)
        CRTRows.push(chunk)
    }
    const img = CRTRows.map(row => row.join('')).join('\n')
    return img
}

function updateCRT(cycle: number, xReg: number, CRT: string[]) {
    const pixels = [xReg - 1, xReg, xReg + 1]
    if (pixels.includes(cycle % 40)) {
        CRT.push('#')
    } else {
        CRT.push('.')
    }
    return CRT
}
