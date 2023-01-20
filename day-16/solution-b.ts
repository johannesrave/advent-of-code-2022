import {writeHeapSnapshot} from "v8";

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
                    finalStates.push(newState)
                } else {
                    buffer.push(newState)
                }
            }
        }
        queue = buffer
        console.log("queue is now " + queue.length + " long.")
        writeHeapSnapshot("./heapdumps/" + (closedValvesWithFlow.size - counter - 1) + ".heapdump")
        console.log("dumped heap.")
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

    let combinations = unvisitedByHero.map(target => ({
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
    }))

    if (characterUnderway.position === characterUnderway.walkingTowards && unvisitedValves.size > 1) {
        combinations = combinations.map(c => {
            const unvisitedByElephant = [...c.unvisitedValves.keys()];
            return unvisitedByElephant.map(target => ({
                characterAtTarget: {...c.characterAtTarget},
                characterUnderway: {
                    position: characterUnderway.position,
                    walkingTowards: target,
                    roundsNeeded: findShortestPath(_valves, characterUnderway.position, target),
                },
                unvisitedValves: new Set(unvisitedByElephant.filter(v => v !== target))
            }))
        }).flat(2)
    }

    return combinations.map(c => ({
        hero: hero.roundsNeeded <= elephant.roundsNeeded ? {...c.characterAtTarget} : {...c.characterUnderway},
        elephant: hero.roundsNeeded > elephant.roundsNeeded ? {...c.characterAtTarget} : {...c.characterUnderway},
        roundsLeft,
        flowPerRound,
        unvisitedValves: c.unvisitedValves,
        pressureReleased
    }))
}

export function initializeElephantState(state, _valves: Map<string, Valve>) {
    const {unvisitedValves, roundsLeft, hero, elephant} = state;
    return [...unvisitedValves.values()].map(target => {
        const unvisitedValvesLeft = new Set([...unvisitedValves.values()].filter(v => v !== target));

        const _hero = {
            position: hero.position,
            walkingTowards: target,
            roundsNeeded: findShortestPath(_valves, hero.position, target),
        }

        return [...unvisitedValvesLeft.values()].map(target => {
            const unvisitedValvesLeftAfterElephant = new Set([...unvisitedValvesLeft.values()].filter(v => v !== target));

            const _elephant = {
                position: elephant.position,
                walkingTowards: target,
                roundsNeeded: findShortestPath(_valves, elephant.position, target),
            }

            return {
                hero: _hero,
                elephant: _elephant,
                roundsLeft: roundsLeft,
                flowPerRound: 0,
                unvisitedValves: unvisitedValvesLeftAfterElephant,
                pressureReleased: 0
            }
        })
    }).flat();
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
