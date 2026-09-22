const fs = require('fs');  
const filePath = 'C:\\Users\\User\\Documents\\Personal Projects\\salo\\src\\components\\feed\\HeroDashboard.tsx';  
let content = fs.readFileSync(filePath, 'utf8');  
content = content.replace('transition={{\" "duration\: 1.2, \ease\: [0.16, 1, 0.3, 1], \delay\: 0.3}}', 'transition={{duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3}}');  
fs.writeFileSync(filePath, content, 'utf8');  
console.log('Fixed');  
