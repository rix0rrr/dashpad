const { typescript } = require('projen');
const project = new typescript.TypeScriptAppProject({
  defaultReleaseBranch: 'main',
  name: 'dashpad',
  description: 'Use the Novation Launchpad as a dashboard',

  deps: ['launchpad.js@^3', 'yargs', 'open', 'jsonschema'],
  devDeps: ['typescript-json-schema'],

  authorName: 'Rico Huijbers',
  authorEmail: 'rix0rrr@gmail.com',

  release: true,
  releaseToNpm: true,
  package: true, // Not actually enabled by default

  // Necessary to install libalsa2 on GHA
  workflowBootstrapSteps: [
    {
      name: 'Install libalsa',
      run: 'sudo apt-get install -y libasound2-dev',
    },
  ],
});

const genSchema = project.addTask('gen:schema', {
  description: 'Generate JSON schema',
  steps: [
    { exec: 'typescript-json-schema src/protocol.ts DashboardState --refs -o src/schema.json' },
  ],
});
project.compileTask.prependSpawn(genSchema);

project.release;

project.synth();