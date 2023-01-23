/*
* the valves WITH flow can be modelled as nodes connected by edges.
* the valves WITHOUT flow can be modelled as weights/costs or multipliers associated with these edges.
* this graph can be pre-computed as a map/object of Valves, where each Valve has
* - a name
* - a flow
* - a number of edges with weights connecting it to other Valves
*/


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
*
* this state needs to have a low memory footprint, as several million variants
* can potentially be kept in memory in parallel, and my system appears to be able to hold about 8 mil in memory at once.
* arrays are smaller in memory by a factor of 3, so they will be used instead of the more readable obvjects
* it would also be feasible to save an array of boolean flags for the targetpool and the visitedpool of nodes
*
* the formula for the memory complexity appears to be very dynamic, but peaks around the 6th advancement of states with 14 nodes
* */



export function maximizePressureReleaseWithElephant(_valves: Map<string, Valve>, _start: string, _rounds = 26) {

    const closedValvesWithFlow = new Set([..._valves.values()].filter(v => v.flow > 0 && !v.open).map(v => v.valve))
    const startingState: StateWithElephant = {
        hero: {
            position: _start,
            walkingTowards: undefined,
            roundsNeeded: -1
        },
        elephant: {
            position: _start,
            walkingTowards: undefined,
            roundsNeeded: -1
        },
        roundsLeft: _rounds,
        flowPerRound: 0,
        unvisitedValves: closedValvesWithFlow,
        pressureReleased: 0
    }

    const finalStates = []
    let queue = initializeElephantState(startingState, _valves)
    let counter = closedValvesWithFlow.size - 1

    console.log("valves: " + (closedValvesWithFlow.size - 1))

    while (counter > 0 && queue.length > 0) {
        counter--
        const buffer = []
        for (const state of queue) {
            const newStates = advanceHeroAndElephant(state, _valves)

            for (const newState of newStates) {
                const {elephant, hero} = newState;
                if (hero.walkingTowards === hero.position && elephant.walkingTowards === elephant.position) {
                    // delete newState.hero
                    // delete newState.elephant
                    finalStates.push(newState)
                } else {
                    buffer.push(newState)
                }
            }
        }
        queue = buffer
        console.log("queue is now " + queue.length + " long.")
        // writeHeapSnapshot(`./heapdumps/${Date.now()}_${closedValvesWithFlow.size - counter - 1}.heapsnapshot`)
        // console.log("dumped heap.")
        console.log(queue[0])
    }

    finalStates.push(...queue)

    const pressures = finalStates.map(state => state.pressureReleased + (state.flowPerRound * state.roundsLeft))
    const [maxPressure] = [...pressures].sort((a, b) => b - a)
    return maxPressure
}

export function advanceHeroAndElephant(state: StateWithElephant, _valves: Map<string, Valve>): StateWithElephant[] {
    let {hero, elephant, unvisitedValves, roundsLeft, pressureReleased, flowPerRound} = state;

    const characterAtTarget = hero.roundsNeeded <= elephant.roundsNeeded ? {...hero} : {...elephant};
    const characterUnderway = hero.roundsNeeded > elephant.roundsNeeded ? {...hero} : {...elephant};

    const roundsPassed = characterAtTarget.roundsNeeded + 1 // +1 for opening the current valve(s)
    pressureReleased += flowPerRound * roundsPassed

    characterAtTarget.position = characterAtTarget.walkingTowards
    flowPerRound += _valves.get(characterAtTarget.position).flow // opens valve

    if (hero.roundsNeeded === elephant.roundsNeeded) {
        characterUnderway.position = characterUnderway.walkingTowards
        flowPerRound += _valves.get(characterUnderway.position).flow // opens valve
    } else {
        characterUnderway.roundsNeeded -= roundsPassed
    }

    roundsLeft -= roundsPassed

    if (state.unvisitedValves.size === 0) {
        characterAtTarget.roundsNeeded = Number.MAX_SAFE_INTEGER // the char has reached its target and can not be assigned a new one.
        if (characterUnderway.position === characterUnderway.walkingTowards) {
            characterUnderway.roundsNeeded = Number.MAX_SAFE_INTEGER
        }

        return [{
            hero: hero.roundsNeeded <= elephant.roundsNeeded ? {...characterAtTarget} : {...characterUnderway},
            elephant: hero.roundsNeeded > elephant.roundsNeeded ? {...characterAtTarget} : {...characterUnderway},
            roundsLeft,
            flowPerRound,
            unvisitedValves,
            pressureReleased
        }]
    }

    const unvisitedByHero = [...unvisitedValves.keys()];

    let combinations: {
        characterAtTarget: {
            position: string,
            walkingTowards: string,
            roundsNeeded: number,
        },
        characterUnderway: {
            position: string,
            walkingTowards: string,
            roundsNeeded: number,
        },
        unvisitedValves: Set<string>
    }[] = new Array(unvisitedByHero.length)

    for (let i = 0; i < unvisitedByHero.length; i++) {
        const target = unvisitedByHero[i]
        combinations[i] = {
            characterAtTarget: {
                position: characterAtTarget.position,
                walkingTowards: target,
                roundsNeeded: findShortestPath(_valves, characterAtTarget.position, target),
            },
            characterUnderway: {
                position: characterUnderway.position,
                walkingTowards: characterUnderway.walkingTowards,
                roundsNeeded: (characterUnderway.position === characterUnderway.walkingTowards && unvisitedValves.size === 1) ?
                    Number.MAX_SAFE_INTEGER : characterUnderway.roundsNeeded,
            },
            unvisitedValves: new Set(unvisitedByHero.filter(v => v !== target))
        }
    }

    if (characterUnderway.position === characterUnderway.walkingTowards && unvisitedValves.size > 1) {
        const buffer = []
        for (let i = 0; i < combinations.length; i++) {
            const {unvisitedValves, characterAtTarget} = combinations[i];
            const targets = Array.from(unvisitedValves.keys())
            for (let j = 0; j < targets.length; j++) {
                const target = targets[j]
                buffer.push({
                    characterAtTarget: {...characterAtTarget},
                    characterUnderway: {
                        position: characterUnderway.position,
                        walkingTowards: target,
                        roundsNeeded: findShortestPath(_valves, characterUnderway.position, target),
                    },
                    unvisitedValves: new Set(targets.filter(v => v !== target))
                })
            }
        }

        combinations = buffer.flat()
    }

    const states = new Array(combinations.length)
    for (let i = 0; i < combinations.length; i++) {
        const {characterUnderway, characterAtTarget, unvisitedValves} = combinations[i]
        states[i] = {
            hero: hero.roundsNeeded <= elephant.roundsNeeded ? {...characterAtTarget} : {...characterUnderway},
            elephant: hero.roundsNeeded > elephant.roundsNeeded ? {...characterAtTarget} : {...characterUnderway},
            roundsLeft,
            flowPerRound,
            unvisitedValves: unvisitedValves,
            pressureReleased
        }
    }
    return states
}

export function initializeElephantState(state, _valves: Map<string, Valve>) {
    const {unvisitedValves, roundsLeft, hero, elephant}: StateWithElephant = state;

    const states = []
    const targets = Array.from(unvisitedValves.keys())
    for (let i = 0; i < unvisitedValves.size; i++) {
        const target = targets[i]
        const _hero = {
            position: hero.position,
            walkingTowards: target,
            roundsNeeded: findShortestPath(_valves, hero.position, target),
        }

        for (let j = i + 1; j < targets.length; j++) {
            const elephantTarget = targets[j];
            const _elephant = {
                position: elephant.position,
                walkingTowards: elephantTarget,
                roundsNeeded: findShortestPath(_valves, elephant.position, elephantTarget),
            }
            states.push({
                    hero: _hero,
                    elephant: _elephant,
                    roundsLeft: roundsLeft,
                    flowPerRound: 0,
                    unvisitedValves: new Set(targets.filter(t => t !== target && t !== elephantTarget)),
                    pressureReleased: 0
                }
            )
        }
    }
    return states

    // return [...unvisitedValves.values()].map(target => {
    //     const unvisitedValvesLeft = new Set([...unvisitedValves.values()]
    //         .filter(v => v !== target));
    //
    //     const _hero = {
    //         position: hero.position,
    //         walkingTowards: target,
    //         roundsNeeded: findShortestPath(_valves, hero.position, target),
    //     }
    //
    //     return [...unvisitedValvesLeft.values()].map(target => {
    //         const unvisitedValvesLeftAfterElephant = new Set([...unvisitedValvesLeft.values()]
    //             .filter(v => v !== target && v !== _hero.walkingTowards));
    //
    //         const _elephant = {
    //             position: elephant.position,
    //             walkingTowards: target,
    //             roundsNeeded: findShortestPath(_valves, elephant.position, target),
    //         }
    //
    //         return {
    //             hero: _hero,
    //             elephant: _elephant,
    //             roundsLeft: roundsLeft,
    //             flowPerRound: 0,
    //             unvisitedValves: unvisitedValvesLeftAfterElephant,
    //             pressureReleased: 0
    //         }
    //     })
    // }).flat();
}

export function parse(input): Map<string, Valve> {
    const valves = input.split('\n')
        .reduce((map, line) => {
            const [, valve, _flow, _tunnels] = line
                .match(/Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]{2,})/)
            map.set(valve, {valve, flow: parseInt(_flow), tunnels: _tunnels.split(', '), open: false})
            return map
        }, new Map());
    return valves;
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

export function parseToObject(input): Record<string, Valve> {
    return input.split('\n')
        .map((line): Valve => {
            const [, valve, _flow, _tunnels] =
                line.match(/Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]{2,})/)
            return {valve, flow: parseInt(_flow), tunnels: _tunnels.split(', ')}
        })
        .map((v: Valve, _, valvesArr: Valve[]) => ({
            ...v,
            tunnels: valvesArr.filter(t => t !== v).map(t => ([t, findShortestPath2(valvesArr, v, t.valve)]))
        }))
        .reduce((obj, v) => {
            obj[v.valve] = v;
            return obj
        }, {});
}


export function findShortestPath2(valves: Valve[], start: Valve, target: string) {
    const visited = new Set()
    let steps = 1
    let valvesToCheck = start.tunnels
    while (valvesToCheck.length > 0) {
        if (valvesToCheck.includes(target)) return steps;
        steps++
        valvesToCheck = valvesToCheck.map(v => valves[v].tunnels.filter(t => !visited.has(t))).flat()
        valvesToCheck.forEach(t => visited.add(t))
    }
    return -1
}

export type Valve = {
    valve: string,
    flow: number,
    tunnels: string[],
    open?: boolean
}

export type StateWithElephant = {
    hero: {
        position: string,
        walkingTowards: string,
        roundsNeeded: number
    },
    elephant: {
        position: string,
        walkingTowards: string,
        roundsNeeded: number
    },
    roundsLeft: number,
    flowPerRound: number,
    pressureReleased: number,
    unvisitedValves: Set<string>
}
