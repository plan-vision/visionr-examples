# visionr-examples

### quickstart import 

vr s import

### Commands - full

## VR Core Commands
- `S`, `SRV`, `SERVER`: Start the server
- `ENC`, `ENCODE`: Encode data or files
- `R`, `RUN`: Run a task or script
- `CREATE`: Create a new project
- `MVN`: Execute Maven commands

## Project Management
- `BACKUP`: Backup project files and data
  - `NATIVE`: Backup native components
  - `PROJ`, `PROJECT`: Backup project files
  - `FULL`: Full backup (dependencies, project, DB, uploads)
  - `DB`, `DATABASE`: Backup the database
  - `UPLOAD`, `UPLOADS`: Backup uploaded files
  - `SERVER`: Backup server configuration
  - `CLONE`: Clone the project (project, dependencies, DB, uploads)
- `CLEAN`: Clean up project files and directories
  - `FULL`: Clean data, work, log, target dirs
  - `RESET`: Clean data, work, log, target, node_modules 
  - `NPM`: Clean node_modules and package-lock.json
- `COMPILE`: Compile project components
  - `npm`: Run npm install
  - `model`: Compile data models
  - `java`: Compile Java code
  - `native`: Compile native code
  - `import`: Import data
  - `forms`: Compile form definitions and templates
  - `all`: Compile everything
  - `vsc`: Compile VisionR script code
- `DB`: Manage the database 
  - `CREATE`: Create the database
  - `STATUS`: Check database status
  - `INIT`: Initialize the database
  - `DUMP`: Dump database content
  - `DROP`: Drop the database
  - `RESTORE`: Restore the database from a dump
- `INSTALL`: Install project dependencies
- `KILL`: Kill running processes
  - `all`: Kill all processes
  - `proj`: Kill project processes
- `RESTORE`: Restore project from backup
- `SERVICE`: Manage the server as a service
  - `INSTALL`: Install the service
  - `UNINSTALL`: Uninstall the service 
  - `START`: Start the service
  - `STOP`: Stop the service
  - `RUN`: Run the service
  - `REBOOT`: Restart the service

## Setup and Configuration
- `SETUP`: Setup project components 
  - `MANAGER`: Setup the manager
  - `SERVICE`: Setup the service
  - `POSTGRE`, `PG`: Setup PostgreSQL 
  - `OFFICE`: Setup Office integration
  - `SMTP`: Setup SMTP for email
  - `JAVA`: Setup Java environment
  - `VIPS`: Setup VIPS for image processing
  - `DIST`: Setup distribution files
  - `ODA`: Setup ODA (OpenDocument API)
  - `NATIVETOOLS`, `TOOLS`: Setup native tools
- `SHOW`: Show project information
  - `JAR`: Show path to server JAR file
  - `VERSION`: Show project version 
  - `REGISTRY`: Show the registry contents
  - `JCONF`: Show Java configuration
  - `REGFILE`: Show path to registry file
  - `CONFIG`: Show configuration
  - `MODULES`: Show installed modules 
  - `PROCESSES`: Show running processes
  - `LICENSE`: Show license information 
  - `FILES`: Show project files
  - `FORMSDEF`: Show compiled form definitions
  - `DIR`: Show a directory path
  - `ENV`: Show environment variables
  - `STATUS`: Show project status
  - `UPDATE`: Show available updates
- `START`: Start the server
  - Prepares server options based on CLI args and project config
  - Determines the server engine (native or Java)
