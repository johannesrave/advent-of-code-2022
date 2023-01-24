/*
* the valves WITH flow can be modelled as nodes connected by edges.
* the valves WITHOUT flow can be modelled as weights/costs or multipliers associated with these edges.
* this graph can be pre-computed as a map/object of Valves, where each Valve has
* - a name
* - a flow
* - a number of edges with weights connecting it to other Valves
*/

type RawValve = {
    id: string,
    flow: number,
    rawNeighbours: string[]
}

export type Valve = {
    id: string,
    flow: number,
    paths: { [distance: string]: number }
}

export type Valves = { [id: string]: Valve }

/*
* the edges could potentially be listed in a separate map,
* however if the map is a "global" object (within the module),
* then the memory consumption of this one lookup object would be negligible,
* even when both directions of each edge are modelled seperately.
*
* what are the mathematical implications of this task?
* we are looking for a maximum spanning tree of this graph, where each node is visited at least once and the
* incurred cost is maximized. the cost for walking an edge is dynamic and depends on the Valves that have been opened aka
* the nodes that have been visited, which need to be kept in memory (or persisted) as a "current state" for each
* walkthrough.
* the state consists of:
* - the current node (where the character or token is at)
* - the valves that have been opened or at least their cumulated flow
* - the valves that have not been visited and not been targeted (when there are two characters walking, this is not
* equivalent to the last point
* - the remaining cost for reaching the next node
* - the number of "rounds" left
*/

type CharState = [current: string, next: string, distance: number];

type State = [
    hero: CharState,
    elephant: CharState,
    unvisited: string[],
    flow: number,
    released: number,
    roundsLeft: number
]

/*
* this state needs to have a low memory footprint, as several million variants
* can potentially be kept in memory in parallel, and my system appears to be able to hold about 8 mil in memory at once.
* arrays are smaller in memory by a factor of 3, so they will be used instead of the more readable objects
* it would also be feasible to save an array of boolean flags for the targetpool and the visitedpool of nodes, as
* those have an even lower memory consumption
*
* ADR: i will save arrays of strings instead. they appear to a quasi-reference type in JS either way,
* and so their footprint is VERY LOW as only a set of about 10 strings is used.
* also this means that the arrays don't need to remain the same size throughout a walkthrough. if an "opened" array
* turns out not to be necessary, then the memory used per State will actually shrink with state changes
*
* the formula for the memory complexity appears to be very dynamic, but peaks around the 6th advancement of states with 14 nodes
* */

// const testInput = fs.readFileSync('test_input.txt', 'utf-8');
// // const testValves: Map<string, Valve> = parse(testInput)
// const testValves = parseToObject(testInput)
// // console.log(JSON.stringify(testValves, null, 1))
// const rel = maximizePressureReleaseWithElephant(testValves)

// console.log(rel)
export function parseToObject(input): Valves {
    const rawValves: RawValve[] = input.split('\n')
        .map((line) => {
            const [, id, _flow, _rawNeighbours] =
                line.match(/Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]{2,})/)
            return {id, flow: parseInt(_flow), rawNeighbours: _rawNeighbours.split(', ')}
        });

    return rawValves
        .filter(v => v.flow > 0 || v.id === "AA")
        .map((v, _, valvesArr): Valve => ({
            id: v.id,
            flow: v.flow,
            paths: getPaths(valvesArr.filter(v => v.id !== "AA"), v, rawValves)
        }))
        .reduce((obj, v): Valves => {
            obj[v.id] = v;
            return obj
        }, {});
}

function getPaths(valvesArr: RawValve[], v: RawValve, rawValves: RawValve[]) {
    return valvesArr
        .filter(_v => _v !== v)
        .map(t => { return [t.id, findMinimalDistance(v.id, t.id, rawValves)] })
        .reduce((paths, [id, dist]) => {
            paths[id] = dist;
            return paths
        }, {});
}

export function findMinimalDistance(start: string, target: string, rawValves: RawValve[]): number {
    const visited = new Set()
    let steps = 1
    let queueOfValves = rawValves.find(v => v.id === start).rawNeighbours
    while (queueOfValves.length > 0) {
        if (queueOfValves.includes(target)) return steps
        steps++
        queueOfValves = queueOfValves.map(v => rawValves.find(_ => _.id === v).rawNeighbours.filter(t => !visited.has(t))).flat()
        queueOfValves.forEach(t => visited.add(t))
    }
    return -1
}


export function maximizePressureReleaseWithElephant(valves: Valves, start: string = "AA", rounds = 26) {

    // const closedValvesWithFlow = new Set([...valves.values()].filter(v => v.flow > 0 && !v.open).map(v => v.valve))

    const finalStates: State[] = []
    let queue: State[] = initializeElephantState(valves, start, rounds)
    let counter = Object.keys(valves).length - 1

    console.log("queue is now " + queue.length + " long.")
    console.log(queue[0] ?? "Nothing in the queue.")

    while (counter > 0 && queue.length > 0) {
        counter--
        const buffer = []
        for (const state of queue) {
            const newStates: State[] = advanceHeroAndElephant(valves, state)

            for (const newState of newStates) {
                const [hero, elephant] = newState;
                if (hero || elephant) {
                    buffer.push(newState)
                } else {
                    finalStates.push(newState)
                }
            }
        }
        queue = buffer
        console.log("queue is now " + queue.length + " long.")
        // writeHeapSnapshot(`./heapdumps/${Date.now()}_${valves.size - counter - 1}.heapsnapshot`)
        // console.log("dumped heap.")
        console.log(queue[0] ?? "Nothing in the queue.")
    }

    finalStates.push(...queue)

    const pressures = finalStates.map(([, , , flow, released, roundsLeft]) => released + (flow * roundsLeft))
    const [maxPressure] = [...pressures].sort((a, b) => b - a)
    return maxPressure


}
export function initializeElephantState(valves: Valves, start: string = "AA", rounds: number = 26) {

    const states: State[] = []

    const unvisited = Object.entries(valves).filter(([v]) => v !== start).map(([v]) => v)
    for (let i = 0; i < unvisited.length; i++) {
        const heroTarget = unvisited[i]
        const _hero: CharState = [start, heroTarget, valves[start].paths[heroTarget]]

        for (let j = i + 1; j < unvisited.length; j++) {
            const elephantTarget = unvisited[j];
            const _elephant: CharState = [start, elephantTarget, valves[start].paths[elephantTarget]]
            const _unvisited = unvisited.filter(t => t !== heroTarget && t !== elephantTarget)
            states.push([_hero, _elephant, _unvisited, 0, 0, rounds])
        }
    }
    return states
}
export function advanceHeroAndElephant(valves: Valves, state: State): State[] {
    let [hero, elephant, unvisited, flow, released, roundsLeft] = state;
    const isElephantFinished = !elephant
    const isAtLeastOneTargetLeft = unvisited.length >= 1
    const areManyTargetsLeft = unvisited.length > 1

    const [heroPos, heroTarget, heroDist] = hero;

    if(isElephantFinished){
        const roundsPassed = heroDist + 1 // +1 for opening the current valve(s)
        roundsLeft -= roundsPassed
        released += flow * roundsPassed
        flow += valves[heroTarget].flow // opens valve
        return [[undefined, undefined, [], flow, released, roundsLeft]]
    }

    const [elephantPos, elephantTarget, elephantDist] = elephant;

    const isHeroAtTarget = heroDist <= elephantDist
    const isElephantAtTarget = heroDist >= elephantDist

    if (isHeroAtTarget && isElephantAtTarget) {
        const roundsPassed = heroDist + 1 // +1 for opening the current valve(s)
        roundsLeft -= roundsPassed
        released += flow * roundsPassed
        flow += valves[heroTarget].flow + valves[elephantTarget].flow // opens valve

        if (areManyTargetsLeft) {
            const states = []
            for (let i = 0; i < unvisited.length; i++) {
                const newHeroPos = heroTarget
                const newHeroTarget = unvisited[i]
                const _hero: CharState =
                    [newHeroPos, newHeroTarget, valves[newHeroPos].paths[newHeroTarget]]

                for (let j = 0; j < unvisited.length; j++) {
                    if(unvisited[i] === unvisited[j]) continue;
                    const newElephantPos = elephantTarget
                    const newElephantTarget = unvisited[j];
                    const _elephant: CharState =
                        [newElephantPos, newElephantTarget, valves[newElephantPos].paths[newElephantTarget]]
                    const _unvisited = unvisited.filter(t => t !== newHeroTarget && t !== newElephantTarget)
                    states.push([_hero, _elephant, _unvisited, flow, released, roundsLeft])
                }
            }
            return states

        } else if (isAtLeastOneTargetLeft) {
            const heroDistToLastTarget = valves[heroTarget].paths[unvisited[0]]
            const elephantDistToLastTarget = valves[elephantTarget].paths[unvisited[0]]
            const heroIsCloser = heroDistToLastTarget < elephantDistToLastTarget
            const movingChar: CharState = heroIsCloser ?
                [heroTarget, unvisited[0], heroDistToLastTarget] :
                [elephantTarget, unvisited[0], elephantDistToLastTarget]
            return [[movingChar, undefined, [], flow, released, roundsLeft]]
        } else {
            return [[undefined, undefined, [], flow, released, roundsLeft]]
        }
    } else if (isHeroAtTarget) {
        const roundsPassed = heroDist + 1 // +1 for opening the current valve(s)
        roundsLeft -= roundsPassed
        released += flow * roundsPassed
        flow += valves[heroTarget].flow // opens valve
        if (isAtLeastOneTargetLeft) {
            const states = []
            for (let i = 0; i < unvisited.length; i++) {
                const newHeroPos = heroTarget
                const newHeroTarget = unvisited[i]
                const _hero: CharState = [newHeroPos, newHeroTarget, valves[newHeroPos].paths[newHeroTarget]]
                const _elephant: CharState = [elephantPos, elephantTarget, elephantDist - roundsPassed]
                const _unvisited = unvisited.filter(t => t !== newHeroTarget)
                states.push([_hero, _elephant, _unvisited, flow, released, roundsLeft])
            }
            return states

        } else {
            return [[undefined, undefined, [], flow, released, roundsLeft]]
        }
    } else if (isElephantAtTarget) {
        const roundsPassed = elephantDist + 1 // +1 for opening the current valve(s)
        roundsLeft -= roundsPassed
        released += flow * roundsPassed
        flow += valves[elephantTarget].flow // opens valve
        if (isAtLeastOneTargetLeft) {
            const states = []
            for (let i = 0; i < unvisited.length; i++) {
                const newElephantPos = elephantTarget
                const newElephantTarget = unvisited[i]
                const _hero: CharState = [heroPos, heroTarget, heroDist - roundsPassed]
                const _elephant: CharState = [newElephantPos, newElephantTarget, valves[newElephantPos].paths[newElephantTarget]]
                const _unvisited = unvisited.filter(t => t !== newElephantTarget)
                states.push([_hero, _elephant, _unvisited, flow, released, roundsLeft])
            }
            return states

        } else {
            const _hero: CharState = [heroPos, heroTarget, heroDist - roundsPassed]
            return [[_hero, undefined, [], flow, released, roundsLeft]]
        }
    }
}
