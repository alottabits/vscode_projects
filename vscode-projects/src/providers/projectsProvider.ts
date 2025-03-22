import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectManager } from '../models/projectManager';
import { ProjectDefinition, ViewDefinition } from '../models/settings';

/**
 * Tree item types for the Projects view
 */
enum TreeItemType {
  Project,
  View,
  Archive
}

/**
 * Tree node for the Projects view
 */
export class ProjectTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: TreeItemType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id?: string,
    public readonly projectId?: string,
    public readonly project?: ProjectDefinition,
    public readonly view?: ViewDefinition
  ) {
    super(label, collapsibleState);
    
    // Set context value for when-clause in package.json
    this.contextValue = type === TreeItemType.Project 
      ? 'project' 
      : type === TreeItemType.View 
        ? 'view' 
        : 'archive';
    
    // Set icon based on type
    switch (type) {
      case TreeItemType.Project:
        this.iconPath = new vscode.ThemeIcon('project');
        break;
      case TreeItemType.View:
        // Determine icon based on view type
        if (view?.type === 'table') {
          this.iconPath = new vscode.ThemeIcon('list-tree');
        } else if (view?.type === 'board') {
          this.iconPath = new vscode.ThemeIcon('layout');
        } else if (view?.type === 'calendar') {
          this.iconPath = new vscode.ThemeIcon('calendar');
        } else if (view?.type === 'gallery') {
          this.iconPath = new vscode.ThemeIcon('multiple-windows');
        } else {
          this.iconPath = new vscode.ThemeIcon('preview');
        }
        break;
      case TreeItemType.Archive:
        this.iconPath = new vscode.ThemeIcon('archive');
        break;
    }
    
    // Set description based on data source for projects
    if (type === TreeItemType.Project && project?.dataSource) {
      if (project.dataSource.kind === 'folder') {
        this.description = `Folder: ${path.basename(project.dataSource.config.path)}`;
      } else if (project.dataSource.kind === 'tag') {
        this.description = `Tag: ${project.dataSource.config.tag}`;
      } else if (project.dataSource.kind === 'query') {
        this.description = `Query`;
      }
    }
    
    // Set command for when the item is clicked
    if (type === TreeItemType.View && projectId && id) {
      this.command = {
        command: 'vscode-projects.openView',
        title: 'Open View',
        arguments: [projectId, id]
      };
    } else if (type === TreeItemType.Project && id) {
      // For projects, show the default view when clicked
      this.command = {
        command: 'vscode-projects.openProject',
        title: 'Open Project',
        arguments: [id]
      };
    }
  }
}

/**
 * Tree data provider for the Projects view
 */
export class ProjectsProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ProjectTreeItem | undefined | null | void> = new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ProjectTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
  
  private showArchives: boolean = false;
  
  constructor(private projectManager: ProjectManager) {}
  
  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  /**
   * Toggle whether to show archives
   */
  public toggleArchives(): void {
    this.showArchives = !this.showArchives;
    this.refresh();
  }
  
  /**
   * Get the tree item for a given element
   */
  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element;
  }
  
  /**
   * Get the children of a given element
   */
  getChildren(element?: ProjectTreeItem): Thenable<ProjectTreeItem[]> {
    if (!element) {
      // Root level - show projects and archives section
      const items: ProjectTreeItem[] = [];
      
      // Add projects
      const projects = this.projectManager.getProjects();
      projects.forEach(project => {
        items.push(new ProjectTreeItem(
          project.name,
          TreeItemType.Project,
          vscode.TreeItemCollapsibleState.Collapsed,
          project.id,
          project.id,
          project
        ));
      });
      
      // Add archives section if enabled
      if (this.showArchives) {
        const archives = this.projectManager.getArchives();
        if (archives.length > 0) {
          items.push(new ProjectTreeItem(
            'Archives',
            TreeItemType.Archive,
            vscode.TreeItemCollapsibleState.Collapsed
          ));
        }
      }
      
      return Promise.resolve(items);
    } else if (element.type === TreeItemType.Project && element.projectId) {
      // Project level - show views
      const project = this.projectManager.getProject(element.projectId);
      if (!project) {
        return Promise.resolve([]);
      }
      
      return Promise.resolve(project.views.map(view => 
        new ProjectTreeItem(
          view.name,
          TreeItemType.View,
          vscode.TreeItemCollapsibleState.None,
          view.id,
          project.id,
          project,
          view
        )
      ));
    } else if (element.type === TreeItemType.Archive) {
      // Archive level - show archived projects
      const archives = this.projectManager.getArchives();
      
      return Promise.resolve(archives.map(archive => 
        new ProjectTreeItem(
          archive.name,
          TreeItemType.Project,
          vscode.TreeItemCollapsibleState.Collapsed,
          archive.id,
          archive.id,
          archive
        )
      ));
    }
    
    return Promise.resolve([]);
  }
}
