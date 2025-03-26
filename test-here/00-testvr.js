// Test create command
async function testCreate() {
  try {
    process.argv = ['node', 'vr', 'create', 'myproject'];
    await require('./create').execute();
    console.log('Project created successfully');
  } catch (err) {
    console.error('Error creating project:', err);
    process.exit(1);
  }
}

// Test import command 
async function testImport() {
  try {
    process.argv = ['node', 'vr', 'import', 'myproject', 'data.json'];
    await require('./import').execute();
    console.log('Data imported successfully');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('File not found:', err.path);
    } else if (err instanceof SyntaxError) {
      console.error('Invalid JSON syntax in import file');
    } else {
      console.error('Error importing data:', err);
    }
    process.exit(1); 
  }
}

testCreate();
testImport();