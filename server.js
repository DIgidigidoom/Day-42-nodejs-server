import express from 'express'
import { bugService } from './Services/bug.service.server.js'
import cookieParser from 'cookie-parser'
const app = express()

//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())

//* Express Routing:
//* Read
app.get('/api/bug', (req, res) => {
    console.log("req.query: ", req.query)
    const filterBy = {
        title: req.query.txt || '',
        severity: +req.query.minSeverity,
    }
    console.log("filterBy server: ", filterBy)
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            // loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot load bugs')
        })
})
app.get('/api/bug/save', (req, res) => {

    const bugToSave = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        _id: req.query._id,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            // loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = []

    if (req.cookies.visitedBugs) {
        const raw = req.cookies.visitedBugs
        if (raw.startsWith('[') && raw.endsWith(']')) {
            visitedBugs = JSON.parse(raw)
        }
    }

    
    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    console.log('User visited the following bugs:', visitedBugs)

    if (visitedBugs.length > 3) {
        return res.status(401).send('Wait for a bit')
    }

    
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
        maxAge: 30000,
        httpOnly: true
    })
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            // loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })

})


app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug removed - ${bugId}`))
        .catch(err => {
            // loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})



const port = 3030

app.listen(port)





