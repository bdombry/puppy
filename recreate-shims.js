const fs = require('fs');
const path = require('path');

const shims = {
  'homeStyles.js': "export { componentStyles as homeStyles } from './index';",
  'screenStyles.js': "export { componentStyles as screenStyles } from './index';",
  'onboardingStyles.js': "export { componentStyles as onboardingStyles } from './index';",
  'global.js': "export { componentStyles as GlobalStyles } from './index';",
  'commonStyles.js': "export { componentStyles as commonStyles } from './index';",
};

Object.entries(shims).forEach(([filename, content]) => {
  const filepath = path.join(__dirname, 'styles', filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ ${filename} created`);
});

console.log('\n✅ All shims recreated successfully!');
