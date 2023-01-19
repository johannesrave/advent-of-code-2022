export function maximizePressureRelease(_valves: Map<string, Valve>, _start: string, _rounds = 30) {

    const closedValvesWithFlow = new Set([..._valves.values()].filter(v => v.flow > 0 && !v.open).map(v => v.valve))
    const startingState = {
        position: _start,
        roundsLeft: _rounds,
        flowPerRound: 0,
        unvisitedValves: closedValvesWithFlow,
        pressureReleased: 0
    }

    console.log(closedValvesWithFlow)
    const finalStates = []
    let queue = advanceState(startingState, _valves)
    let counter = closedValvesWithFlow.size - 1

    while (counter > 0 && queue.length > 0) {
        counter--
        const _queue = queue.map(state => advanceState(state, _valves)).flat()
        queue = []
        for (const state of _queue) {
            if (state.roundsLeft === 0) {
                finalStates.push(state)
            } else {
                queue.push(state)
            }
        }
    }

    finalStates.push(...queue)

    const pressures = finalStates.map(state => state.pressureReleased + (state.flowPerRound * state.roundsLeft))
    const [maxPressure] = [...pressures].sort((a, b) => b - a)
    return maxPressure
}

export function advanceState(state: State, _valves: Map<string, Valve>): State[] {

    const {unvisitedValves: _unvisitedValves, roundsLeft, position, flowPerRound, pressureReleased} = state;
    return [..._unvisitedValves.values()].map(target => {
            const unvisitedValves = structuredClone(_unvisitedValves);
            unvisitedValves.delete(target)
            const roundsNeeded = findShortestPath(_valves, position, target);
            if (roundsLeft < roundsNeeded) {
                return {
                    position,
                    roundsLeft: 0,
                    flowPerRound,
                    unvisitedValves: _unvisitedValves,
                    pressureReleased: pressureReleased + flowPerRound * roundsLeft
                }
            } else {
                return {
                    position: target,
                    roundsLeft: roundsLeft - roundsNeeded - 1,
                    flowPerRound: flowPerRound + _valves.get(target).flow,
                    unvisitedValves: unvisitedValves,
                    pressureReleased: pressureReleased + (flowPerRound * (roundsNeeded + 1))
                }
            }
        }
    )
}

export function findShortestPath(_valves: Map<string, Valve>, _start: string, _target: string) {
    const visited = new Set()

    let steps = 1
    let valves = [..._valves.get(_start).tunnels]
    while (valves.length > 0) {
        if (valves.includes(_target)) return steps
        steps++
        valves = valves.map(v => _valves.get(v).tunnels.filter(t => !visited.has(t))).flat()
        valves.forEach(t => visited.add(t))
    }
    return -1
}

export function parse(input): Map<string, Valve> {
    return input.split('\n').reduce((map, line) => {
        const [, valve, _flow, _tunnels] = line
            .match(/Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]{2,})/)
        map.set(valve, {valve, flow: parseInt(_flow), tunnels: _tunnels.split(', '), open: false})
        return map
    }, new Map());
}

export type Valve = {
    valve: string,
    flow: number,
    tunnels: string[],
    open: boolean
}

export type State = {
    position: string,
    roundsLeft: number,
    flowPerRound: number,
    pressureReleased: number,
    unvisitedValves: Set<string>
}

