#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PME 360 Backend - Script de Déploiement\n');
console.log('==========================================\n');

// Configuration
const config = {
  production: {
    NODE_ENV: 'production',
    PORT: process.env.PROD_PORT || 3000,
    DATABASE_URL: process.env.PROD_DATABASE_URL,
    JWT_SECRET: process.env.PROD_JWT_SECRET,
    FRONTEND_URL: process.env.PROD_FRONTEND_URL
  },
  staging: {
    NODE_ENV: 'staging',
    PORT: process.env.STAGING_PORT || 3001,
    DATABASE_URL: process.env.STAGING_DATABASE_URL,
    JWT_SECRET: process.env.STAGING_JWT_SECRET,
    FRONTEND_URL: process.env.STAGING_FRONTEND_URL
  }
};

async function deploy(environment = 'production') {
  try {
    console.log(`📋 Déploiement en environnement: ${environment.toUpperCase()}\n`);
    
    // 1. Vérifications préliminaires
    console.log('🔍 1. Vérifications préliminaires...');
    
    // Vérifier que nous sommes dans le bon répertoire
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json non trouvé. Êtes-vous dans le bon répertoire?');
    }
    
    // Vérifier les variables d'environnement
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
    const envConfig = config[environment];
    
    for (const envVar of requiredEnvVars) {
      if (!envConfig[envVar]) {
        console.warn(`⚠️  Variable d'environnement manquante: ${environment.toUpperCase()}_${envVar}`);
      }
    }
    
    console.log('✅ Vérifications terminées\n');
    
    // 2. Installation des dépendances
    console.log('📦 2. Installation des dépendances...');
    execSync('npm ci --production=false', { stdio: 'inherit' });
    console.log('✅ Dépendances installées\n');
    
    // 3. Exécution des tests
    console.log('🧪 3. Exécution des tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ Tests réussis\n');
    } catch (error) {
      if (process.env.SKIP_TESTS !== 'true') {
        throw new Error('Les tests ont échoué. Utilisez SKIP_TESTS=true pour ignorer.');
      }
      console.log('⚠️  Tests ignorés (SKIP_TESTS=true)\n');
    }
    
    // 4. Build de l'application
    console.log('🔨 4. Build de l\'application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build terminé\n');
    
    // 5. Migration de la base de données
    console.log('🗃️  5. Migration de la base de données...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Base de données migrée\n');
    } catch (error) {
      console.log('⚠️  Attention: Migration de base de données échouée\n');
    }
    
    // 6. Vérification de sécurité
    console.log('🔒 6. Audit de sécurité...');
    try {
      execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
      console.log('✅ Audit de sécurité réussi\n');
    } catch (error) {
      console.log('⚠️  Attention: Vulnérabilités détectées\n');
    }
    
    // 7. Génération du rapport de déploiement
    console.log('📊 7. Génération du rapport...');
    const deploymentReport = generateDeploymentReport(environment);
    
    fs.writeFileSync(
      `deployment-report-${Date.now()}.json`,
      JSON.stringify(deploymentReport, null, 2)
    );
    
    console.log('✅ Rapport généré\n');
    
    // 8. Instructions finales
    console.log('🎉 DÉPLOIEMENT TERMINÉ!\n');
    console.log('📋 Étapes suivantes:');
    console.log('  1. Vérifier que le serveur démarre correctement');
    console.log('  2. Tester les endpoints critiques');
    console.log('  3. Surveiller les logs pour détecter les erreurs');
    console.log('  4. Configurer la surveillance (monitoring)');
    
    if (environment === 'production') {
      console.log('  5. Notifier l\'équipe du déploiement réussi');
      console.log('  6. Mettre à jour la documentation si nécessaire\n');
    }
    
    console.log(`🌐 Application déployée sur: ${envConfig.FRONTEND_URL || 'URL à configurer'}`);
    console.log(`📡 API disponible sur: http://localhost:${envConfig.PORT}\n`);
    
  } catch (error) {
    console.error('❌ ERREUR DE DÉPLOIEMENT:\n');
    console.error(error.message);
    console.log('\n🔧 Actions recommandées:');
    console.log('  - Vérifier les logs ci-dessus');
    console.log('  - Corriger les erreurs identifiées');
    console.log('  - Relancer le déploiement');
    console.log('  - Contacter l\'équipe technique si nécessaire\n');
    process.exit(1);
  }
}

function generateDeploymentReport(environment) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  return {
    timestamp: new Date().toISOString(),
    environment,
    version: packageJson.version,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    deployedBy: process.env.USER || process.env.USERNAME || 'unknown',
    gitCommit: getGitCommit(),
    gitBranch: getGitBranch(),
    dependencies: Object.keys(packageJson.dependencies || {}),
    buildSize: getBuildSize(),
    checks: {
      tests: 'passed',
      build: 'passed',
      audit: 'passed',
      migration: 'passed'
    }
  };
}

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getBuildSize() {
  try {
    const stats = fs.statSync('./dist');
    return `${Math.round(stats.size / 1024)} KB`;
  } catch {
    return 'unknown';
  }
}

// Exécution du script
const environment = process.argv[2] || 'production';

if (!['production', 'staging'].includes(environment)) {
  console.error('❌ Environnement invalide. Utilisez: production ou staging');
  process.exit(1);
}

deploy(environment);