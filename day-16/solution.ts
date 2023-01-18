export function main(_valves: Map<string, Valve>, _start: string, _rounds = 30) {

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

export function advanceWithElephant(state: StateWithElephant, _valves: Map<string, Valve>): StateWithElephant[] {
    const {unvisitedValves, roundsLeft, hero, elephant, flowPerRound, pressureReleased} = state;


    // both characters are at the last known location - a valve that they opened
    // each one is moving towards a new valve, the distance to which is known
    // the one closer to its target moves there and opens it and chooses a new target,
    // removing it from their shared pool, and has the new distance calculated
    // the one further away has the number of rounds used by the first one deducted from their roundsLeft
    // if both are the same number of steps away from their target, both choose a new target

    // this only happens at the very beginning, and both characters simply get assigned targets
    // without actually moving them and without deducting any rounds
    if (hero.roundsNeeded === -1) {
        return [...unvisitedValves.values()].map(target => {
            const unvisitedValvesLeft = new Set([...unvisitedValves.values()].filter(v => v !== target));

            const _hero = {
                roundsNeeded: findShortestPath(_valves, hero.position, target),
                walkingTowards: target,
                position: hero.position
            }

            return [...unvisitedValvesLeft.values()].map(target => {
                const unvisitedValvesLeftAfterElephant = new Set([...unvisitedValvesLeft.values()].filter(v => v !== target));

                const _elephant = {
                    roundsNeeded: findShortestPath(_valves, elephant.position, target),
                    walkingTowards: target,
                    position: elephant.position
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
        }).flat(3);
    } else if (hero.roundsNeeded === elephant.roundsNeeded) {
        // this occurs if both chars have the same number of rounds towards their targets
        // so both can be moved and given new targets at the same time
        const _roundsLeft = roundsLeft - hero.roundsNeeded;
        hero.position = hero.walkingTowards
        elephant.position = elephant.walkingTowards
        const unvisitedValvesLeftForHero = new Set([...unvisitedValves.values()]
            .filter(v => v !== hero.position && v !== elephant.position));
        const increasedFlow = flowPerRound + _valves.get(hero.position).flow +_valves.get(elephant.position).flow
        const increasedPressureReleased = pressureReleased + (flowPerRound * (hero.roundsNeeded + 1))

        return [...unvisitedValvesLeftForHero.values()].map(heroTarget => {
            const _hero = {
                roundsNeeded: findShortestPath(_valves, hero.position, heroTarget),
                walkingTowards: heroTarget,
                position: hero.position
            }
            const unvisitedValvesLeftForElephant = new Set([...unvisitedValvesLeftForHero.values()]
                .filter(v => v !== heroTarget));

            return [...unvisitedValvesLeftForElephant.values()].map(elephantTarget => {
                const _elephant = {
                    roundsNeeded: findShortestPath(_valves, elephant.position, elephantTarget),
                    walkingTowards: elephantTarget,
                    position: elephant.position
                }
                const unvisitedValvesLeftAfterElephant = new Set([...unvisitedValvesLeftForElephant.values()]
                    .filter(v => v !== elephantTarget));

                return {
                    hero: _hero,
                    elephant: _elephant,
                    roundsLeft: roundsLeft,
                    flowPerRound: increasedFlow,
                    unvisitedValves: unvisitedValvesLeftAfterElephant,
                    pressureReleased: increasedPressureReleased
                }
            })
        }).flat(3);
    } else {
        const characterAtTarget = hero.roundsNeeded < elephant.roundsNeeded ? {...hero} : {...elephant};
        const characterUnderway = hero.roundsNeeded > elephant.roundsNeeded ? {...hero} : {...elephant};

        const roundsPassed = characterAtTarget.roundsNeeded;
        characterAtTarget.position = characterAtTarget.walkingTowards;
        characterUnderway.roundsNeeded -= roundsPassed;
        const _roundsLeft = roundsLeft - roundsPassed;

        return [...unvisitedValves.values()].map(target => {
                const unvisitedValvesLeft = new Set([...unvisitedValves.values()].filter(v => v !== target));
                characterAtTarget.roundsNeeded = findShortestPath(_valves, characterAtTarget.position, target);
                characterAtTarget.walkingTowards = target
                return {
                    hero: hero.roundsNeeded < elephant.roundsNeeded ? characterAtTarget : characterUnderway,
                    elephant: hero.roundsNeeded > elephant.roundsNeeded ? characterAtTarget : characterUnderway,
                    roundsLeft: _roundsLeft,
                    flowPerRound: flowPerRound + _valves.get(target).flow,
                    unvisitedValves: unvisitedValvesLeft,
                    pressureReleased: pressureReleased + (flowPerRound * (roundsPassed + 1))
                }

            }
        ).flat(3);
    }
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
