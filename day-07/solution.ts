import * as fs from 'fs';

const cdPattern = /^\$ cd ([a-zA-Z]\w*)$/;
const cdUpPattern = /^\$ cd \.\.$/;
const filePattern = /^(\d*) ([a-zA-Z.]*)$/;

const DISK_SIZE = 70_000_000
const NEEDED_SPACE = 30_000_000

const input = fs.readFileSync('input.txt', 'utf-8').split('\n')
const [dirTree] = parseDir(input, 1);

const smallDirSizes = getDirSizes(dirTree)
    .filter(size => size <= 100_000)
    .reduce((sum, size) => sum + size, 0)

console.log(smallDirSizes)

const overallDirSizes = getOverallSize(dirTree)
const neededSpace = overallDirSizes - (DISK_SIZE - NEEDED_SPACE)
const smallestQualifyingDir = getDirSizes(dirTree)
    .filter(size => size >= neededSpace)
    .sort((a,b) => a - b)[0]

console.log(smallestQualifyingDir)



function parseDir(input: string[], index: number): [Dir, number] {

    let dirTree: Dir = {files: {}, dirs: {}}

    for (let i = index; i < input.length; i++) {
        const line = input[i]

        const cdMatch = line.match(cdPattern)
        if (cdMatch) {
            const [, subDirName] = cdMatch
            const [subDirTree, index] = parseDir(input, i + 1);
            dirTree.dirs[subDirName] = subDirTree
            i = index
        }

        const fileMatch = line.match(filePattern)
        if (fileMatch) {
            const [, fileSize, fileName] = fileMatch
            dirTree.files[fileName] = parseInt(fileSize)
        }

        index = i
        if (line.match(cdUpPattern)) {
            break
        }
    }
    return [dirTree, index]
}

function getDirSizes(dir: Dir) {
    const smallDirs = []

    getDirSize(dir)
    function getDirSize (dir: Dir) {
        const fileSizes = Object.values(dir.files).reduce((sum, file) => sum + file, 0)
        const subDirSizes = Object.values(dir.dirs).reduce((sum, dir) => sum + getDirSize(dir), 0)

        const dirSize = fileSizes + subDirSizes;
            smallDirs.push(dirSize)
        return dirSize
    }

    return smallDirs
}

function getOverallSize(dir: Dir) {
    const fileSizes = Object.values(dir.files).reduce((sum, file) => sum + file, 0)
    const subDirSizes = Object.values(dir.dirs).reduce((sum, dir) => sum + getOverallSize(dir), 0)

    return fileSizes + subDirSizes
}


const testInput = `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`

const [testDirTree] = parseDir(testInput.split('\n'), 1);
const testSmallDirSizes = getDirSizes(testDirTree)
    .filter(size => size <= 100_000)
    .reduce((sum, size) => sum + size, 0)
console.assert(testSmallDirSizes === 95437)

const testOverallDirSizes = getOverallSize(testDirTree)
const testNeededSpace = testOverallDirSizes - (DISK_SIZE - NEEDED_SPACE)
const testSmallestQualifyingDir = getDirSizes(testDirTree)
    .filter(size => size >= testNeededSpace)
    .sort()[0]
console.assert(testSmallestQualifyingDir === 24933642)

type Dir = {
    dirs: { [name: string]: Dir },
    files: { [name: string]: number },
};
