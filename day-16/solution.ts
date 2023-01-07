import * as fs from 'fs';
import {Worker} from 'worker_threads';

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const input = fs.readFileSync('input.txt', 'utf-8');

export type Valve = {
    valve: string,
    flow: number,
    tunnels: string[],
    open: boolean
}

const testValves: Map<string, Valve> = parse(testInput)

console.assert(testValves.get('AA'))
console.assert(testValves.get('AA').valve === 'AA')
console.assert(testValves.get('AA').flow === 0)
console.assert(testValves.get('AA').tunnels.includes('DD'))
console.assert(testValves.get('DD'))
console.log(testValves)

// const testPaths = traverse(testValves, 'AA');
// console.log(JSON.stringify(testPaths, null, 2))

const testPathsParallel = startTraversal(testValves, 'AA')

async function startTraversal(_valves: Map<string, Valve>, _valve: string, path = [], rounds = 10) {
    const valve = _valves.get(_valve)
    path = [valve.valve]

    const threads = []
    for (const tunnel of valve.tunnels) {
        const nextValve = _valves.get(tunnel)
        const valvesLeft = structuredClone(_valves)

        threads.push(new Promise((resolve) => {
            const worker = new Worker('./worker.js');
            worker.postMessage({_valves: valvesLeft, _valve: nextValve.valve, path, rounds: rounds - 2})

            worker.on('message', (value) => {
                console.log("received value")
                void worker.terminate()
                return resolve(value)
            });

        }))
        // paths.push(traverse(valvesLeft, nextValve.valve, path, rounds - 2))
        // pressureReleased.push([tunnel, traverse(valveLeft, nextValve.valve, path, rounds - 1)])
    }

    // for (const tunnel of valve.tunnels) {
    //     const nextValve = _valves.get(tunnel)
    //     const valveLeft = structuredClone(_valves)
    //     pressureReleased.push([tunnel, traverse(valveLeft, nextValve.valve, rounds - 1)])
    // }

    const paths = await Promise.all(threads)
    console.log(paths.flat(6))

    // console.log(paths.flat(8).map(s => s.join('')))
    return paths
}

function parse(input): Map<string, Valve> {
    return input.split('\n').reduce((map, line) => {
        const [, valve, _flow, _tunnels] = line
            .match(/Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]{2,})/)
        map.set(valve, {valve, flow: parseInt(_flow), tunnels: _tunnels.split(', '), open: false})
        return map
    }, new Map());
}

