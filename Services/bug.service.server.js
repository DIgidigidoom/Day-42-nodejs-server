import fs from 'fs'
import { utilService } from "./util.service.js";
import PDFDocument from 'pdfkit-table'

const bugs = utilService.readJsonFile('Data/bugs.json')
console.log(bugs)

let doc = new PDFDocument({ margin: 30, size: 'A4' })

// connect to a write stream 
doc.pipe(fs.createWriteStream('./bugs.pdf'))
createPdf(doc, bugs)
    .then(() => doc.end())      // close document 

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = {}) {
    let bugToDisplay = bugs
    if (filterBy.title) {
        const regExp = new RegExp(filterBy.title, 'i')
        bugToDisplay = bugToDisplay.filter(bug => regExp.test(bug.title))
    }
    if (filterBy.severity) {
        bugToDisplay = bugToDisplay.filter(bug => bug.severity >= filterBy.severity)
    }

    return Promise.resolve(bugToDisplay)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    console.log("bugToSave Server service before: ", bugToSave)
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugs.push(bugToSave)
        console.log("bugToSave Server service after: ", bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('Data/bugs.json', data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

function createPdf(doc, bugs) {
    const table = {
        title: 'Bugs',
        subtitle: 'Sorted by Alphabetical order',
        headers: ['Bug title', 'Bug Description', 'Severity'],
        rows: bugs.map(bug => [
            bug.title || 'N/A',
            bug.description || 'N/A',
            bug.severity || 'N/A',
        ]),
    }
    return doc.table(table, { columnsSize: [200, 100, 100] })
    
} 