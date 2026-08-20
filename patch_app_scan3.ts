import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `} else {\n                console.log("Not on native, user must use 'Select Local Device Folder'");\n              }`,
  `} else {
                console.log("Not on native, user must use 'Select Local Device Folder'");
                setCurrentTab('scan');
              }`
);

fs.writeFileSync('src/App.tsx', content);
