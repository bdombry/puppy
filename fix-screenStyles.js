const fs = require('fs');
const path = require('path');

const files = [
  '/var/www/html/PupyTracker/puppy/components/charts/AskToGoOutStats.js',
  '/var/www/html/PupyTracker/puppy/components/charts/IncidentReasonChart.js',
  '/var/www/html/PupyTracker/puppy/components/screens/AnalyticsScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/AccountScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/EditActivityScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/FeedingScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/ActivityScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/HomeScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/EditIncidentScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/EditSuccessScreen.js',
  '/var/www/html/PupyTracker/puppy/components/screens/WalkHistoryScreen.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace screenStyles import
    if (content.includes("from '../../styles/screenStyles'")) {
      content = content.replace(
        /import\s*{\s*screenStyles\s*}\s*from\s*['"].*?screenStyles['"]/g,
        "import { componentStyles as screenStyles } from '../../styles'"
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${path.basename(file)}`);
    }
  }
});

console.log('\n✅ All screenStyles imports fixed!');
