const express = require('express')
require('dotenv').config()
const app = express()
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

let participants = []

let errorMessage = ''
let formedTeams = []

app.get('/', (req, res) => {
  res.render('index', { participants, errorMessage, formedTeams })
  errorMessage = ''
})

app.post('/randomize', (req, res) => {
  if (req.body.password !== process.env.SECRET) {
    errorMessage = 'Wrong password'
    return res.redirect('/')
  }
  if (participants.length < 6) {
    errorMessage = 'Not enough participants to form valid teams'
    return res.redirect('/')
  }
  shuffle(participants)
  let teams = formTeams(participants)
  if (!teams) {
    errorMessage = 'Unable to form valid teams'
    return res.redirect('/')
  }
  formedTeams = teams
  res.redirect('/')
})

app.post('/add-participant', (req, res) => {
  const { firstName, lastName, year } = req.body
  if (!firstName || !lastName || !year) {
    errorMessage = 'All fields must be filled'
    return res.redirect('/')
  }
  if (parseInt(year) < 1) {
    errorMessage = 'Year must be at least 1'
    return res.redirect('/')
  }
  const exists = participants.some(
    p => p.firstName === firstName && p.lastName === lastName && p.year === parseInt(year)
  )
  if (exists) {
    errorMessage = 'Participant already exists'
    return res.redirect('/')
  }
  participants.push({ firstName, lastName, year: parseInt(year) })
  res.redirect('/')
})

app.post('/delete-participant', (req, res) => {
  const { firstName, lastName, year, password } = req.body
  if (password !== process.env.SECRET) {
    errorMessage = 'Wrong password'
    return res.redirect('/')
  }
  const index = participants.findIndex(
    p => p.firstName === firstName && p.lastName === lastName && p.year === parseInt(year)
  )
  if (index === -1) {
    errorMessage = 'Participant not found'
    return res.redirect('/')
  }
  participants.splice(index, 1)
  res.redirect('/')
})

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[r]] = [arr[r], arr[i]]
  }
}

function getScore(year) {
  if (year === 1) return 10
  if (year === 2) return 20
  if (year === 3) return 30
  return 40
}

function formTeams(list) {
  let sizes = getTeamSizes(list.length)
  if (!sizes) return null
  let sorted = list.slice().sort((a, b) => getScore(b.year) - getScore(a.year))
  let teams = sizes.map(s => ({ size: s, members: [], sum: 0 }))
  sorted.forEach(p => {
    let best = teams.reduce((acc, t) => (t.sum < acc.sum ? t : acc))
    best.members.push(p)
    best.sum += getScore(p.year)
  })
  return teams
}

function getTeamSizes(n) {
  if (n < 6) return null
  let result = []
  while (n > 0) {
    if (n === 6) { result.push(3, 3); break }
    else if (n === 7) { result.push(3, 4); break }
    else if (n === 8) { result.push(4, 4); break }
    else if (n === 9) { result.push(3, 3, 3); break }
    else if (n === 10) { result.push(3, 3, 4); break }
    else if (n === 11) { result.push(3, 4, 4); break }
    else if (n === 12) { result.push(4, 4, 4); break }
    else {
      if (n >= 4) { result.push(4); n -= 4 }
      else { result.push(3); n -= 3 }
    }
  }
  return result
}

app.listen(PORT, () => {})
