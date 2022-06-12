import os from "os";
import * as path from "path";
import * as fs from "fs";
import * as zlib from "zlib";
import { pipeline } from 'stream'

let userName = '';
let homeDirname = os.homedir()
let currentDirName = os.homedir()

let invalidInputError = new Error('Invalid input')
let operationFailedError = new Error('Operation failed')

try {
    userName = process.argv[2].split('=')[1];
    console.log(`Welcome to the File Manager, ${userName}!`)
    console.log(`You are currently in ${currentDirName} \n`)
} catch (e) {
    throw Error('передайте аргумент с именем вида: --username=your_username')
}

process.on('exit', () => {
    console.log(`Thank you for using File Manager, ${userName}!`);
});

process.stdin.on('data', data => {
    let stringData = data.toString().trim();
    // console.log('StringData:::: ', stringData);

    try {
        switch (stringData) {
            case "up":
                currentDirName = path.join(currentDirName, "../")
                break;
            case `cd ${stringData.split(" ")[1]}`:
                let nextDirName = path.join(currentDirName, stringData.split(" ")[1])

                fs.readdirSync(nextDirName)

                currentDirName = nextDirName
                break;
            case "ls":
                const readFiles = fs.readdirSync(currentDirName)
                for (const file of readFiles) {
                    console.log(file)
                }
                break;
            case `cat ${stringData.split(" ")[1]}`:
                let targetFileName = stringData.split(" ")[1];

                let targetPath = path.join(currentDirName, targetFileName)
                const contentBuffer = fs.readFileSync(targetPath)

                console.log( contentBuffer.toString() )
                break;
            case `add ${stringData.split(" ")[1]}`:
                let newFileName = stringData.split(" ")[1];
                fs.mkdirSync(`${currentDirName}/${newFileName}`)
                console.log('file created')

                break;
            case `rn ${stringData.split(" ")[1]} ${stringData.split(" ")[2]}`: {
                let pathToFile = stringData.split(" ")[1];
                let newFileName = stringData.split(" ")[2];

                fs.renameSync(pathToFile, `${pathToFile}/${newFileName}`)
                console.log('file renamed')

                break;
            }
            case `copy ${stringData.split(" ")[1]} ${stringData.split(" ")[2]}`: {
                let pathToFile = stringData.split(" ")[1];
                let pathToNewDir = stringData.split(" ")[2];

                fs.copyFileSync(pathToFile, pathToNewDir)
                console.log('file copped')

                break;
            }
            case `mv ${stringData.split(" ")[1]} ${stringData.split(" ")[2]}`: {
                let pathToFile = stringData.split(" ")[1];
                let pathToNewDir = stringData.split(" ")[2];

                fs.copyFileSync(pathToFile, pathToNewDir)
                fs.rmSync(pathToFile);
                console.log('file moved')

                break;
            }
            case `rm ${stringData.split(" ")[1]}`: {
                let pathToFile = stringData.split(" ")[1];

                fs.rmSync(pathToFile);

                console.log('file removed')
                break;
            }
            case `os --EOL`: {
                console.log(os.EOL)
                break;
            }
            case `os --cpus`: {
                console.log(os.cpus())
                break;
            }
            case `os --homedir`: {
                console.log(os.homedir())
                break;
            }
            case `os --username`: {
                console.log(os.userInfo().username)
                break;
            }
            case `os --architecture`: {
                console.log(os.arch())
                break;
            }
            case `hash ${stringData.split(" ")[1]}`: {
                let pathToFile = stringData.split(" ")[1];

                const file = fs.readFileSync(pathToFile);
                const hash = crypto.createHash('sha256').update(file).digest('hex');
                console.log(hash)

                break;
            }
            case `compress ${stringData.split(" ")[1]} ${stringData.split(" ")[2]}`: {
                let pathToFile = stringData.split(" ")[1];
                let pathToDest = stringData.split(" ")[2];

                const bzip = zlib.createBrotliCompress();
                const source = fs.createReadStream(pathToFile);
                const destination = fs.createWriteStream(pathToDest);

                pipeline(source, bzip, destination, (err) => {
                    if (err) {
                        console.error('An error occurred:', err);
                    }

                    console.log('file compressed')
                });
                break;
            }
            case `decompress ${stringData.split(" ")[1]} ${stringData.split(" ")[2]}`: {
                let pathToFile = stringData.split(" ")[1];
                let pathToDest = stringData.split(" ")[2];

                const unbzip = zlib.createBrotliDecompress();
                const source = fs.createReadStream(pathToFile);
                const destination = fs.createWriteStream(pathToDest);

                pipeline(source, unbzip, destination, (err) => {
                    if (err) {
                        console.error('An error occurred:', err);
                    }

                    console.log('file decompressed')
                });
                break;
            }
            default:
                throw invalidInputError;
        }
    } catch (e) {
        console.log(e.message)
    }

    console.log(`\n You are currently in ${currentDirName}`)
});