/*
* the valves WITH flow can be modelled as nodes connected by edges.
* the valves WITHOUT flow can be modelled as weights/costs or multipliers associated with these edges.
* this graph can be pre-computed as a map/object of Valves, where each Valve has
* - a name
* - a flow
* - a number of edges with weights connecting it to other Valves
*/

import * as fs from "fs";
import * as readline from "readline";

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
        if (queueOfValves.includes(target)) return steps + 1 // the +1 is for the time it takes to open a valve
        steps++
        queueOfValves = queueOfValves.map(v => rawValves.find(_ => _.id === v).rawNeighbours.filter(t => !visited.has(t))).flat()
        queueOfValves.forEach(t => visited.add(t))
    }
    return -1
}


export async function maximizePressureReleaseWithElephant(valves: Valves, start: string = "AA", rounds = 26) {

    const limit = Object.keys(valves).length - 1
    const maxFlow = Object.values(valves).map((v) => v.flow).reduce((max, flow) => (max + flow), 0)

    console.log(`maxFlow is ${maxFlow}`)

    let counter = 0

    const fileStr = initializeElephantState(valves, start, rounds).reduce((str, line) => str + JSON.stringify(line) + "\n", "")

    fs.rmSync(`./buffer/${counter}_state`)
    fs.writeFileSync(`./buffer/${counter}_state`, fileStr)

    while (counter < limit) {
        if (fs.existsSync(`./buffer/${counter + 1}_state`))
            fs.rmSync(`./buffer/${counter + 1}_state`)
        counter++
    }

    let max = 0
    counter = 0
    while (counter < limit) {
        const inputFile = fs.createReadStream(`./buffer/${counter}_state`);
        const outputFile = fs.createWriteStream(`./buffer/${counter + 1}_state`);

        const lineReader = readline.createInterface({
            input: inputFile,
            crlfDelay: Infinity
        });

        for await (const stateStr of lineReader) {
            const advancedState = advanceHeroAndElephant(valves, JSON.parse(stateStr))
            advancedState.forEach(s => {
                const roundsLeft = s[5];
                const pressureReleased = s[4];
                const flow = s[3];
                if (roundsLeft === 0) {
                    if (pressureReleased > max) {
                        max = pressureReleased
                        console.log(`updated max: ${JSON.stringify(s)}`)
                        fs.writeFileSync(`./buffer/result`, JSON.stringify(s))
                    }
                } else {
                    outputFile.write(JSON.stringify(s) + "\n");
                }
            })
        }

        inputFile.close()
        outputFile.close()
        console.log(`wrote file ./buffer/${counter + 1}_state`)
        counter++
    }

    return max
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
    const [hero, elephant, unvisited, flow, released, roundsLeft] = state;

    const roundsPassed = hero[2] <= elephant[2] ? hero[2] : elephant[2]
    const _roundsLeft = roundsLeft - roundsPassed
    const _released = released + (flow * roundsPassed)

    // filter for unvisited valves that are actually reachable in the rounds Left
    const _unvisited = unvisited.filter(v =>
        valves[hero[1]].paths[v] <= _roundsLeft || valves[elephant[1]].paths[v] <= _roundsLeft)

/*    const minDistance = Object.values(valves)
        .filter(valve => _unvisited.includes(valve.id))
        .map((v) => Object.values(v.paths)
            .reduce((min, dist) => dist < min ? dist : min, 0))
        .reduce((min, dist) => dist < min ? dist : min, 0)*/

    const [, heroTarget, heroDist] = hero
    const [, elephantTarget, elephantDist] = elephant

    const isHeroAtTarget = heroDist <= elephantDist
    const isElephantAtTarget = heroDist >= elephantDist
    const areBothAtTarget = isHeroAtTarget && isElephantAtTarget

    const isOneTargetLeft = _unvisited.length === 1
    const isAtLeastOneTargetLeft = _unvisited.length >= 1
    const areManyTargetsLeft = _unvisited.length > 1


    if (areBothAtTarget) {
        const _heroPos = heroTarget
        const _elephantPos = elephantTarget
        let _flow = flow + valves[_heroPos].flow + valves[_elephantPos].flow;

        if (areManyTargetsLeft) {
            // keeps going at least one more round
            return combineAllUnvisited(
                valves,
                heroTarget,
                elephantTarget,
                _unvisited,
                _flow,
                released + (flow * roundsPassed),
                _roundsLeft
            )
        } else if (isOneTargetLeft) {
            const [lastTarget] = _unvisited
            const heroDistToLastTarget = valves[_heroPos].paths[lastTarget]
            const elephantDistToLastTarget = valves[_elephantPos].paths[lastTarget]
            const _roundsPassed = Math.min(heroDistToLastTarget, elephantDistToLastTarget)

            // opens last valve, is then flagged as finished
            const finalRoundsLeft = _roundsLeft - _roundsPassed
            const finalFlow = _flow + valves[lastTarget].flow
            const finalReleased = _released + _roundsPassed * _flow + finalRoundsLeft * finalFlow
            return [[undefined, undefined, [], finalFlow, finalReleased, 0]]
        } else {
            // is flagged as finished
            const finalRoundsLeft = _roundsLeft
            const finalFlow = _flow
            const finalReleased = _released + finalRoundsLeft * finalFlow
            return [[undefined, undefined, [], finalFlow, finalReleased, 0]]
        }
    } else if (isHeroAtTarget || isElephantAtTarget) {
        const charAtTarget = isHeroAtTarget ? hero : elephant
        const charB = !isHeroAtTarget ? hero : elephant
        const [, _pos] = charAtTarget // the _ denotes the current position (former target)
        const _flow = flow + valves[_pos].flow

        if (isAtLeastOneTargetLeft) {
            const [posB, targetB] = charB
            const distB = charB[2] - roundsPassed
            const states = []
            for (let i = 0; i < _unvisited.length; i++) {

                const _target = _unvisited[i]
                const _dist = valves[_pos].paths[_target];

                states.push([
                    [_pos, _target, _dist],
                    [posB, targetB, distB],
                    unvisited.filter(t => t !== _target),
                    _flow,
                    _released,
                    _roundsLeft
                ])
            }
            return states
        } else {
            const [, _posB] = charB
            const _roundsPassed = charB[2] - roundsPassed
            // open last two valves, is then flagged as finished
            // charB walks to their target as well
            const finalRoundsLeft = _roundsLeft - _roundsPassed
            const finalFlow = _flow + valves[_posB].flow // opens last valve
            const finalReleased = _released + (_roundsPassed * _flow) + finalRoundsLeft * finalFlow

            return [[undefined, undefined, [], finalFlow, finalReleased, 0]]
        }
    }
}

function combineAllUnvisited(valves: Valves, heroTarget: string, elephantTarget: string, unvisited: string[], flow: number, released: number, roundsLeft: number) {
    const states = []
    for (let i = 0; i < unvisited.length; i++) {
        const newHeroPos = heroTarget
        const newHeroTarget = unvisited[i]
        const heroDistance = valves[newHeroPos].paths[newHeroTarget];
        if (heroDistance > roundsLeft) continue;
        const _hero: CharState =
            [newHeroPos, newHeroTarget, heroDistance]

        for (let j = 0; j < unvisited.length; j++) {
            if (unvisited[i] === unvisited[j])
                continue;
            const newElephantPos = elephantTarget
            const newElephantTarget = unvisited[j];
            const elephantDistance = valves[newElephantPos].paths[newElephantTarget];
            if (elephantDistance > roundsLeft)
                continue;
            const _elephant: CharState =
                [newElephantPos, newElephantTarget, elephantDistance]
            const _unvisited = unvisited.filter(t => t !== newHeroTarget && t !== newElephantTarget)
            states.push([_hero, _elephant, _unvisited, flow, released, roundsLeft])
        }
    }
    return states;
}


