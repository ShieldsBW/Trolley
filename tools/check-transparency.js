const fs = require('fs');
const path = require('path');

const assetsDir = 'C:/Users/shiel/OneDrive/Documents/Trolley/assets';

['buttons', 'frames', 'icons'].forEach(folder => {
  const dir = path.join(assetsDir, folder);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  console.log('\n' + folder + ':');
  files.forEach(file => {
    const data = fs.readFileSync(path.join(dir, file));
    const colorType = data[25];
    const hasAlpha = colorType === 6 || colorType === 4;
    console.log('  ' + file + ': hasAlpha=' + hasAlpha);
  });
});
