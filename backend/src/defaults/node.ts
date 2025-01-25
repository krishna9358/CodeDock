// Prmopt for the template of node.ts
export const basePrompt =
  '<dockArtifact id="project-import" title="Project Files"><dockAction type="file" filePath="index.js">// run `node index.js` in the terminal\n\nconsole.log(`Hello Node.js v${process.versions.node}!`);\n</dockAction><dockAction type="file" filePath="package.json">{\n  "name": "node-starter",\n  "private": true,\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  }\n}\n</dockAction></dockArtifact>';
