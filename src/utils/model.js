import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
const dirname = fileName => path.join(process.cwd(), 'src', 'json', fileName + '.json')

export default {
    read: fileName => {
        const data = readFileSync(dirname(fileName), 'utf8')
        return data ? JSON.parse(data) : []
    },
    write: (fileName, data) => writeFileSync(path.join(dirname(fileName)), JSON.stringify(data, null, 4))
}