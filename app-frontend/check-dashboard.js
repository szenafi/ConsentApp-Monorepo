const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'app', 'dashboard.js');

if (!fs.existsSync(dashboardPath)) {
  console.error('❌ Le fichier app/dashboard.js est introuvable.');
  process.exit(1);
}

console.log('✅ Le fichier app/dashboard.js existe.');

// Lire le contenu
const content = fs.readFileSync(dashboardPath, 'utf-8');

// Vérifie l'import
const hasImport = content.includes("import DashboardScreen from '../screens/DashboardScreen'") ||
                  content.includes('import DashboardScreen from "../screens/DashboardScreen"');

const hasExport = content.includes('export default DashboardScreen');

if (hasImport && hasExport) {
  console.log('✅ Le fichier app/dashboard.js importe et exporte correctement DashboardScreen.');
} else {
  console.warn('⚠️ Le fichier app/dashboard.js ne semble pas importer ou exporter correctement DashboardScreen.');
  if (!hasImport) console.warn('  ↪️ Vérifie la ligne d’import.');
  if (!hasExport) console.warn('  ↪️ Vérifie la ligne d’export.');
}
