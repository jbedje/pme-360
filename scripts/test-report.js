#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 PME 360 Backend - Rapport de Tests\n');
console.log('=====================================\n');

try {
  // Exécuter les tests avec couverture
  console.log('📊 Exécution des tests avec couverture...\n');
  
  const testOutput = execSync('npm run test:coverage', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log(testOutput);
  
  // Vérifier si le fichier de couverture existe
  const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');
  
  if (fs.existsSync(coveragePath)) {
    console.log('✅ Rapport de couverture généré avec succès!');
    console.log(`📂 Fichier: ${coveragePath}`);
    console.log('🌐 Ouvrir dans le navigateur pour voir le rapport détaillé\n');
  }
  
  // Générer un résumé des métriques
  console.log('📈 Résumé des Métriques:\n');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const srcFiles = getAllTypeScriptFiles('./src');
  const testFiles = getAllTypeScriptFiles('./tests');
  
  console.log(`📁 Fichiers source: ${srcFiles.length}`);
  console.log(`🧪 Fichiers de test: ${testFiles.length}`);
  console.log(`📦 Version: ${packageJson.version}`);
  console.log(`🔧 Node.js: ${process.version}\n`);
  
  // Instructions pour l'amélioration
  console.log('💡 Recommandations:\n');
  console.log('  - Maintenir une couverture de tests > 80%');
  console.log('  - Ajouter des tests d\'intégration pour les nouveaux endpoints');
  console.log('  - Documenter tous les nouveaux endpoints dans Swagger');
  console.log('  - Valider la sécurité avec des tests de penetration\n');
  
  console.log('✨ Tests terminés avec succès!\n');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'exécution des tests:\n');
  console.error(error.message);
  console.log('\n🔧 Solutions possibles:');
  console.log('  - Vérifier que toutes les dépendances sont installées (npm install)');
  console.log('  - Vérifier la configuration de la base de données de test');
  console.log('  - Consulter les logs d\'erreur ci-dessus\n');
  process.exit(1);
}

function getAllTypeScriptFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}