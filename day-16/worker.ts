import {parentPort} from 'worker_threads';
import {Valve} from "./solution";

export function traverse(_valves: Map<string, Valve>, _valve: string, path = [], rounds = 10) {
    const valve = _valves.get(_valve)

    path = [...path, valve.valve]
    console.log("traversing", path)
    console.log("open valves:", [..._valves].filter(v => v[1].open).map(v => v[0]))

    if (rounds <= 0)
        return path.join('')
    if (![..._valves].some(([, v]) => !v.open && v.flow > 0)) {
        console.log("all valves with any flow are open, stopping traversal")
        return path.join('')
    }

    const paths = []
    for (const tunnel of valve.tunnels) {
        valve.open = true
        const nextValve = _valves.get(tunnel)
        const valveLeft = structuredClone(_valves)
        paths.push(traverse(valveLeft, nextValve.valve, path, rounds - 2))
    }

    return paths
}

parentPort.on("message", ({_valves, _valve, path, rounds}) => {
    console.log("starting new worker")
    const value = traverse(_valves, _valve, path, rounds);
    console.log("finished calculation")
    parentPort.postMessage(value)
})