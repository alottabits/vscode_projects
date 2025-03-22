import * as vscode from 'vscode';
import { ProjectsProvider } from './providers/projectsProvider';
import { ProjectManager } from './models/projectManager';
import { VSCodeFileSystem } from './utils/vsCodeFileSystem';
import { createProject, createNote } from './utils/commands';

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Activating VSCode Projects extension');

  // Initialize the file system adapter
  const fileSystem = new VSCodeFileSystem();
  
  // Initialize the project manager with the extension context
  const projectManager = new ProjectManager(context, fileSystem);
  
  // Create the projects tree data provider
  const projectsProvider = new ProjectsProvider(projectManager);
  
  // Register the tree view
  const treeView = vscode.window.createTreeView('vscode-projects-sidebar', {
    treeDataProvider: projectsProvider,
    showCollapseAll: true
  });
  
  // Register commands
  const showProjectsCmd = vscode.commands.registerCommand('vscode-projects.showProjects', () => {
    // Focus the projects tree view
    treeView.reveal(undefined, { focus: true, select: false });
  });
  
  const createProjectCmd = vscode.commands.registerCommand('vscode-projects.createProject', async () => {
    await createProject(projectManager, projectsProvider);
  });
  
  const createNoteCmd = vscode.commands.registerCommand('vscode-projects.createNote', async () => {
    await createNote(projectManager);
  });
  
  // Add disposables to context
  context.subscriptions.push(
    treeView,
    showProjectsCmd,
    createProjectCmd,
    createNoteCmd
  );
}

// This method is called when the extension is deactivated
export function deactivate() {
  console.log('Deactivating VSCode Projects extension');
}
