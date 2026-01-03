import fs from 'fs';
import path from 'path';

//
function getDirectoryStructure(dir, ignore = ['node_modules', '.git']) {
  const results = [];

  fs.readdirSync(dir).forEach((file) => {
    if (ignore.includes(file)) return;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    const obj = { name: file };
    if (stat.isDirectory()) {
      obj.type = 'directory';
      obj.children = getDirectoryStructure(filePath, ignore);
    } else {
      obj.type = 'file';
    }
    results.push(obj);
  });

  return results;
}

const structure = getDirectoryStructure('.');
fs.writeFileSync('project_structure.json', JSON.stringify(structure, null, 2));
console.log('Project structure exported to project_structure.json');