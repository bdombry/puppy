#!/usr/bin/env node

/**
 * 🧪 TEST - Vérifier que le système CSS fonctionne
 * 
 * Usage: node TEST_STYLES.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 TEST SYSTÈME CSS\n');
console.log('=' .repeat(60));

// Test 1: Fichiers existent
console.log('\n✅ TEST 1: Vérifier que les fichiers existent');
const files = [
  'styles/tokens.js',
  'styles/components.js',
  'styles/index.js',
  'styles/homeStyles.js',
  'styles/screenStyles.js',
  'styles/onboardingStyles.js',
  'styles/global.js',
  'styles/commonStyles.js',
];

let allExist = true;
files.forEach(file => {
  const exists = fs.existsSync(file);
  const size = exists ? fs.statSync(file).size : 0;
  console.log(`  ${exists ? '✓' : '✗'} ${file} (${size} bytes)`);
  if (!exists) allExist = false;
});

// Test 2: Fichiers ne sont pas vides
console.log('\n✅ TEST 2: Vérifier que les fichiers ne sont pas vides');
const coreFiles = ['styles/tokens.js', 'styles/components.js', 'styles/index.js'];
let allNotEmpty = true;
coreFiles.forEach(file => {
  const size = fs.statSync(file).size;
  const isOk = size > 100;
  console.log(`  ${isOk ? '✓' : '✗'} ${file} (${size} bytes - ${isOk ? 'OK' : 'TOO SMALL'})`);
  if (!isOk) allNotEmpty = false;
});

// Test 3: Contenu des shims
console.log('\n✅ TEST 3: Vérifier contenu des fichiers shims');
const shims = ['styles/homeStyles.js', 'styles/screenStyles.js', 'styles/onboardingStyles.js'];
let shimsOk = true;
shims.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasRexport = content.includes('export { componentStyles');
  const isOk = hasRexport && content.includes('./index');
  console.log(`  ${isOk ? '✓' : '✗'} ${file} (shim valide: ${isOk})`);
  if (!isOk) shimsOk = false;
});

// Test 4: Index.js exporte tout
console.log('\n✅ TEST 4: Vérifier que index.js exporte les tokens');
const indexContent = fs.readFileSync('styles/index.js', 'utf8');
const exports = ['colors', 'typography', 'spacing', 'componentStyles', 'homeStyles'];
let indexOk = true;
exports.forEach(exp => {
  const has = indexContent.includes(`export { ${exp}`) || indexContent.includes(`export.*${exp}`);
  console.log(`  ${has ? '✓' : '✗'} Exporte '${exp}'`);
  if (!has) indexOk = false;
});

// Résumé
console.log('\n' + '='.repeat(60));
console.log('\n📊 RÉSUMÉ:');
console.log(`  Files exist: ${allExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Files not empty: ${allNotEmpty ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Shims valid: ${shimsOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Index valid: ${indexOk ? '✅ PASS' : '❌ FAIL'}`);

const allPass = allExist && allNotEmpty && shimsOk && indexOk;
console.log(`\n🎯 RÉSULTAT FINAL: ${allPass ? '✅✅✅ TOUS LES TESTS PASSENT!' : '❌ CERTAINS TESTS ÉCHOUENT'}`);
console.log('\n' + '='.repeat(60) + '\n');

process.exit(allPass ? 0 : 1);
