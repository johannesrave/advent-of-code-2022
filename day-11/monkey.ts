export class Monkey {
    id: number;
    items: number[];
    readonly divisor: number;
    private readonly trueMonkey: number;
    private readonly falseMonkey: number;
    inspections: number = 0;
    private readonly operate: (a) => number;
    commonDivisor: number = 1

    constructor(monkeyString: string) {
        const [idLine, itemsLine, opLine, divisorLine, trueLine, falseLine] = monkeyString.split('\n')

        this.id = this.parseNumber(idLine, /Monkey (\d*):$/)
        this.divisor = this.parseNumber(divisorLine, /Test: divisible by (\d+)/)
        this.trueMonkey = this.parseNumber(trueLine, /If true: throw to monkey (\d+)/)
        this.falseMonkey = this.parseNumber(falseLine, /If false: throw to monkey (\d+)/)

        this.items = itemsLine
            .match(/Starting items: ([0-9, ]*)$/)[1]
            .split(', ')
            .map(n => parseInt(n))

        const [, operator, secondOperand] = opLine.match(/Operation: new = old ([*+]) ([0-9]+|old)$/)

        if (operator === '*' && secondOperand === 'old') {
            this.operate = (a) => (a * a)
        } else if (operator === '*') {
            this.operate = (a) => (a * parseInt(secondOperand))
        } else if (operator === '+') {
            this.operate = (a) => (a + parseInt(secondOperand))
        }
    }

    inspectAllItems(monkeys: Monkey[], method = this.inspect) {
        this.items.forEach((_, i) => method.apply(this, [i, monkeys]))
        this.items = []
    }

    inspect(index: number, monkeys: Monkey[]) {
        let worry = this.items[index]
        worry = this.operate(worry)
        worry = Math.floor(worry / 3)
        const nextMonkey = (worry % this.divisor === 0) ? this.trueMonkey : this.falseMonkey
        monkeys[nextMonkey].items.push(worry)
        this.inspections++
    }

    inspectAndStayCool(index: number, monkeys: Monkey[]) {
        let worry = this.items[index]
        worry = this.operate(worry)
        const nextMonkey = (worry % this.divisor === 0) ? this.trueMonkey : this.falseMonkey
        worry = worry % this.commonDivisor
        // console.log(`throwing ${worry} to ${nextMonkey}`)
        monkeys[nextMonkey].items.push(worry)
        this.inspections++
    }

    private parseNumber(line: string, matcher: RegExp) {
        return parseInt(line.match(matcher)[1])
    }
}

