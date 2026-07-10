const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
console.log(rules);
