import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const replaceNextjs = (filePath) => {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace next/link
    content = content.replace(/import Link from ['"]next\/link['"];?/g, "import { Link } from 'react-router-dom';");

    // Replace next/navigation
    content = content.replace(/import {([^}]*)} from ['"]next\/navigation['"];?/g, (match, imports) => {
        let newImports = imports.replace(/useRouter/g, 'useNavigate').replace(/usePathname/g, 'useLocation');
        return `import {${newImports}} from 'react-router-dom';`;
    });
    content = content.replace(/useRouter\(\)/g, "useNavigate()");
    content = content.replace(/router\.push\(/g, "navigate(");
    content = content.replace(/router\.replace\(/g, "navigate(");
    
    if (content.includes('useNavigate') && !content.includes("const navigate = useNavigate()")) {
        content = content.replace(/const router = useNavigate\(\);?/g, "const navigate = useNavigate();");
    }

    // Replace next/image
    content = content.replace(/import Image from ['"]next\/image['"];?/g, "");
    content = content.replace(/<Image([^>]*)>/g, (match, attrs) => {
        // change to <img, optionally remove fill, priority etc.
        let newAttrs = attrs.replace(/priority(\s|=\{[^}]+\})?/g, "")
                            .replace(/fill(\s|=\{[^}]+\})?/g, "")
                            .replace(/quality=\{[^}]+\}/g, "");
        return `<img${newAttrs}>`;
    });

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log("Refactored: " + filePath);
    }
}

const srcPath = path.join(process.cwd(), 'src');
['components', 'context', 'pages_next'].forEach(folder => {
    const p = path.join(srcPath, folder);
    if (fs.existsSync(p)) walkDir(p, replaceNextjs);
});
