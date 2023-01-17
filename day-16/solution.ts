import * as fs from 'fs';

const testInput = fs.readFileSync('test_input.txt', 'utf-8');
const testValves: Map<string, Valve> = parse(testInput)

const input = fs.readFileSync('input.txt', 'utf-8');
const valves: Map<string, Valve> = parse(input)

console.assert(testValves.get('AA'))
console.assert(testValves.get('AA').valve === 'AA')
console.assert(testValves.get('AA').flow === 0)
console.assert(testValves.get('AA').tunnels.includes('DD'))
console.assert(testValves.get('DD'))
console.assert(findShortestPath(testValves, 'AA', 'DD') === 1)
console.assert(findShortestPath(testValves, 'AA', 'JJ') === 2)
console.assert(findShortestPath(testValves, 'AA', 'CC') === 2)
console.assert(findShortestPath(testValves, 'AA', 'HH') === 5)

const afterFirstMove = advanceState({
    position: 'AA',
    roundsLeft: 30,
    flowPerRound: 0,
    unvisitedValves: new Set(['BB', 'CC', 'DD', 'EE', 'HH', 'JJ']),
    pressureReleased: 0
}, testValves);
const firstState = afterFirstMove.find(state => state.position === 'DD');
console.assert(firstState.roundsLeft === 28)
console.assert(firstState.flowPerRound === 20)
console.assert(firstState.pressureReleased === 0)

const afterSecondMove = advanceState(firstState, testValves);
const secondState = afterSecondMove.find(state => state.position === 'BB');
console.assert(secondState.roundsLeft === 25)
console.assert(secondState.flowPerRound === 33)
console.assert(secondState.pressureReleased === 60)
// console.log(afterSecondMove)

const afterThirdMove = advanceState(secondState, testValves);
const thirdState = afterThirdMove.find(state => state.position === 'JJ');
console.assert(thirdState.roundsLeft === 21)
console.assert(thirdState.flowPerRound === 54)
console.assert(thirdState.pressureReleased === 192)
// console.log(afterThirdMove)

const afterFourthMove = advanceState(thirdState, testValves);
const fourthState = afterFourthMove.find(state => state.position === 'HH');
console.assert(fourthState.roundsLeft === 13)
console.assert(fourthState.flowPerRound === 76)
console.assert(fourthState.pressureReleased === 624)
console.log(afterFourthMove)

console.assert(main(testValves, 'AA') === 1651)

// console.log(main(testValves, 'AA', 6))
// console.log(testValves)
console.log(main(valves, 'AA'))


function main(_valves: Map<string, Valve>, _start: string, _rounds = 30) {

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
            if (state.roundsLeft === 0){
                finalStates.push(state)
            } else  {
                queue.push(state)
            }
        }
    }

    finalStates.push(...queue)

    const pressures = finalStates.map(state => state.pressureReleased + (state.flowPerRound * state.roundsLeft))
    const [maxPressure] = [...pressures].sort((a,b) => b-a)
    return maxPressure
}

function advanceState(state: State, _valves: Map<string, Valve>): State[] {
    const {unvisitedValves: _unvisitedValves, roundsLeft, position, flowPerRound, pressureReleased} = state;
    return [..._unvisitedValves.values()].map(target => {
            const unvisitedValves = structuredClone(_unvisitedValves);
            unvisitedValves.delete(target)
            const roundsNeeded = findShortestPath(_valves, position, target);
            if (roundsLeft < roundsNeeded){
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


function findShortestPath(_valves: Map<string, Valve>, _start: string, _target: string) {
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

function parse(input): Map<string, Valve> {
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
