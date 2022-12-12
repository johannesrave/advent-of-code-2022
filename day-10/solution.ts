import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8')
console.assert(calculateSignalStrength(testInput) === 13140)

const input = fs.readFileSync('input.txt', 'utf-8')
console.log(calculateSignalStrength(input))

function calculateSignalStrength(input: string) {
    const commands = input.split('\n');
    let signalStrength = 0
    let addReg = 0
    let xReg = 1;
    let processing = false;
    let cycle = 1;
    while (cycle <= 220) {
        // console.log({cycle})
        if ((cycle - 20) % 40 === 0) {
            signalStrength += (cycle * xReg)
            // console.log({cycle, xReg, addedSignalStrength: cycle * xReg, signalStrength})
        }
        cycle++;
        if (processing) {
            xReg += addReg
            // console.log({xReg, addReg})
            addReg = 0
            processing = false
            continue
        }

        const command = commands.shift()
        if (command.startsWith('addx')) {
            // console.log({command: command.split(' ')})
            addReg = parseInt(command.split(' ')[1])
            processing = true
        }
    }
    return signalStrength;

}
