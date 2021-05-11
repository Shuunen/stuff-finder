const fs = require('fs')
const pkg = require('../package.json')
const { execSync } = require('child_process')

const location = 'public/index.html'
const content = fs.readFileSync(location, 'utf-8')
const lastCommit = execSync('git rev-parse --short HEAD').toString().trim()
const now = (new Date().toISOString()).split('.')[0].replace('T', ' ')

fs.writeFileSync(location, content.replace(/<span id="commit">.*<\/span>/i, `<span id="commit">${pkg.version} - ${lastCommit} - ${now}</span>`))
