import {parentPort} from 'worker_threads';
import {Valve} from "./solution";
export function traverse(_valves: Map<string, Valve>, _valve: string, path = [], rounds = 10) {
    const valve = _valves.get(_valve)


    path = [...path, valve.valve]

    if (rounds <= 0) return path.join('');

    if (ababa(path) || abaaba(path))
        return path.join('');

    if ([..._valves.values()].every(v => v.open || v.flow > 0)) {
        return path.join('');
    }

    const paths = []

    for (const tunnel of valve.tunnels) {
        valve.open = true
        const nextValve = _valves.get(tunnel)
        const valveLeft = structuredClone(_valves)
        paths.push(traverse(valveLeft, nextValve.valve, path, rounds - 1))
    }
    return paths

    function ababa(path) {
        return path.at(-1) == path.at(-3)
            && path.at(-1) == path.at(-5)
            && path.at(-2) == path.at(-4);
    }

    function abaaba(arr: string[]) {
        const cur = path.at(-1)
        const prev = path.at(-2)

        if (cur === path.at(-3)) {
            const i = arr.findIndex((v, i) => v === cur && arr[i + 1] === prev && arr[+2] === cur)
            if (i !== -1 && i !== arr.length - 3) {
                // console.log("cur:", cur, "prev:", prev, "i:", i, "arr:", arr)
                return true
            }
        }
        return false
    }
}

parentPort.on("message", ({_valves, _valve, path, rounds}) => {
    console.log("starting new worker")
    // console.log(memoryUsage());
    const value = traverse(_valves, _valve, path, rounds);
    console.log("finished calculation")
    parentPort.postMessage(value)
})