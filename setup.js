// setup.js - 项目设置脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up English Vocabulary Learning System...\n');

// 创建必要的目录
const directories = ['public', 'uploads'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`✅ Directory exists: ${dir}`);
    }
});

// 检查重要文件
const requiredFiles = [
    { file: 'server.js', description: 'Node.js server file' },
    { file: 'package.json', description: 'Package configuration' },
    { file: 'public/index.html', description: 'Frontend HTML file' }
];

let allFilesExist = true;

console.log('\n📋 Checking required files:');
requiredFiles.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
        console.log(`✅ Found: ${file} (${description})`);
    } else {
        console.log(`❌ Missing: ${file} (${description})`);
        allFilesExist = false;
    }
});

// 显示系统信息
console.log(`\n📊 System Information:`);
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current directory: ${process.cwd()}`);

// 检查网络连接
console.log('\n🌐 Testing network connection...');
try {
    execSync('ping -n 1 8.8.8.8', { stdio: 'ignore' });
    console.log('✅ Network connection: OK');
} catch (error) {
    console.log('❌ Network connection: Failed (Dictionary API may not work)');
}

// 检查端口是否被占用
console.log('\n🔌 Checking port availability...');
try {
    const netstat = execSync('netstat -an', { encoding: 'utf8' });
    if (netstat.includes(':3000')) {
        console.log('⚠️  Port 3000 might be in use. You may need to stop other applications.');
    } else {
        console.log('✅ Port 3000: Available');
    }
} catch (error) {
    console.log('⚠️  Could not check port status');
}

// 检查防火墙设置
console.log('\n🛡️  Firewall Notice:');
console.log('If other devices cannot access the system, you may need to:');
console.log('1. Allow Node.js through Windows Defender Firewall');
console.log('2. Or run this command as Administrator:');
console.log('   netsh advfirewall firewall add rule name="Vocabulary System" dir=in action=allow protocol=TCP localport=3000');

if (allFilesExist) {
    console.log('\n🎉 Setup check completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npm start" to start the server');
    console.log('3. Open http://localhost:3000 in your browser');
    
    // 尝试自动安装依赖
    console.log('\n🔄 Would you like to install dependencies now? (automatic in 5 seconds)');
    
    setTimeout(() => {
        try {
            console.log('\n📦 Installing dependencies...');
            execSync('npm install', { stdio: 'inherit' });
            console.log('\n🎉 Dependencies installed successfully!');
            console.log('\n🚀 Ready to start! Run "npm start" to launch the server.');
        } catch (error) {
            console.log('\n❌ Failed to install dependencies automatically.');
            console.log('Please run "npm install" manually.');
        }
    }, 5000);
    
} else {
    console.log('\n❌ Setup incomplete. Missing required files:');
    console.log('Please ensure all code files are copied to the correct locations.');
    console.log('Refer to the installation guide for detailed instructions.');
}

// 创建示例CSV文件
const sampleCSV = `word,level
apple,elementary
beautiful,elementary
computer,middle
education,middle
knowledge,high
challenge,university
vocabulary,university`;

if (!fs.existsSync('sample_words.csv')) {
    fs.writeFileSync('sample_words.csv', sampleCSV);
    console.log('\n📄 Created sample_words.csv for testing');
}

// 创建启动脚本
const startScript = `@echo off
echo Starting English Vocabulary Learning System...
cd /d "%~dp0"
npm start
pause`;

if (!fs.existsSync('start.bat')) {
    fs.writeFileSync('start.bat', startScript);
    console.log('📄 Created start.bat - double-click to start the system');
}

console.log('\n' + '='.repeat(60));
console.log('🎓 English Vocabulary Learning System Setup Complete');
console.log('='.repeat(60));