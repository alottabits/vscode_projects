import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectManager } from '../models/projectManager';
import { ProjectDefinition, ViewDefinition } from '../models/settings';
import { DataFrame } from '../models/dataframe';
import { DataFilterEngine } from '../models/dataFilterEngine';

/**
 * ViewProvider handles the webview panel for displaying project data
 */
export class ViewProvider {
  private webviewPanels = new Map<string, vscode.WebviewPanel>();
  
  constructor(
    private context: vscode.ExtensionContext,
    private projectManager: ProjectManager
  ) {}
  
  /**
   * Opens a specific view from a project
   */
  public async openView(projectId: string, viewId: string): Promise<void> {
    try {
      const project = this.projectManager.getProject(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      const view = project.views.find((v: any) => v.id === viewId);
      
      if (!view) {
        throw new Error(`View with ID ${viewId} not found in project ${project.name}`);
      }
      
      await this.showView(project, view);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open view: ${error}`);
    }
  }
  
  /**
   * Opens the default view for a project
   */
  public async openProject(projectId: string): Promise<void> {
    try {
      const project = this.projectManager.getProject(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Use the first view as default
      if (project.views.length > 0) {
        await this.showView(project, project.views[0]);
      } else {
        throw new Error(`Project ${project.name} has no views`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open project: ${error}`);
    }
  }
  
  /**
   * Shows a specific view in a webview panel
   */
  private async showView(project: ProjectDefinition, view: ViewDefinition): Promise<void> {
    // Generate a unique key for this view
    const viewKey = `${project.id}:${view.id}`;
    
    // Check if we already have a panel for this view
    const existingPanel = this.webviewPanels.get(viewKey);
    if (existingPanel) {
      // If the panel exists, reveal it
      existingPanel.reveal();
      return;
    }
    
    // Create a new webview panel
    const panel = vscode.window.createWebviewPanel(
      'projectsView',
      `${project.name} - ${view.name}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ]
      }
    );
    
    // Store the panel
    this.webviewPanels.set(viewKey, panel);
    
    // Handle panel disposal
    panel.onDidDispose(() => {
      this.webviewPanels.delete(viewKey);
    });
    
    // Create filter engine
    const filterEngine = new DataFilterEngine();
    
    // Query project data
    const rawDataframe = await this.projectManager.queryProject(project);
    
    // Apply filters if they exist
    let dataframe = rawDataframe;
    if (view.filter && view.filter.conditions && view.filter.conditions.length > 0) {
      dataframe = filterEngine.applyFilters(rawDataframe, view.filter);
    }
    
    // Get the required scripts
    const filterBuilderScript = await this.getFilterBuilderScript();
    const filterHandlerScript = await this.getFilterHandlerScript();
    
    // Set the webview HTML with filtered data
    panel.webview.html = this.getWebviewContent(
      panel.webview,
      project,
      view,
      dataframe,
      filterBuilderScript,
      filterHandlerScript
    );
    
    // Handle debug messages
    const logDebug = (msg: string, data?: any) => {
      console.log(`[ViewProvider] ${msg}`, data);
    };
    
    // Handle webview messages
    panel.webview.onDidReceiveMessage(async (message) => {
      logDebug(`Received message: ${message.command}`, message);
      
      switch (message.command) {
        case 'openFile':
          if (message.path) {
            const document = await vscode.workspace.openTextDocument(message.path);
            await vscode.window.showTextDocument(document);
          }
          break;
        case 'refreshData':
          try {
            // Update the local reference
            const updatedRawDataframe = await this.projectManager.queryProject(project);
            dataframe = updatedRawDataframe;
            
            // Refresh the webview content
            panel.webview.html = this.getWebviewContent(
              panel.webview,
              project,
              view,
              dataframe,
              filterBuilderScript,
              filterHandlerScript
            );
          } catch (error) {
            console.error('Failed to refresh data:', error);
          }
          break;
      }
    });
  }
  
  /**
   * Get the filter builder script code
   */
  private async getFilterBuilderScript(): Promise<string> {
    try {
      const scriptPath = path.join(this.context.extensionPath, 'media', 'js', 'common-filter-builder.js');
      const scriptUri = vscode.Uri.file(scriptPath);
      const scriptContent = await vscode.workspace.fs.readFile(scriptUri);
      return Buffer.from(scriptContent).toString();
    } catch (error) {
      console.error('Failed to load filter builder script:', error);
      return `console.error("Failed to load filter builder script: ${error}");`;
    }
  }

  /**
   * Get the filter handler script code
   */
  private async getFilterHandlerScript(): Promise<string> {
    try {
      const scriptPath = path.join(this.context.extensionPath, 'media', 'js', 'filter-handler.js');
      const scriptUri = vscode.Uri.file(scriptPath);
      const scriptContent = await vscode.workspace.fs.readFile(scriptUri);
      return Buffer.from(scriptContent).toString();
    } catch (error) {
      console.error('Failed to load filter handler script:', error);
      return `console.error("Failed to load filter handler script: ${error}");`;
    }
  }

  /**
   * Creates main webview content
   */
  private getWebviewContent(
    webview: vscode.Webview, 
    project: ProjectDefinition, 
    view: ViewDefinition, 
    dataframe: DataFrame,
    filterBuilderScript: string = '',
    filterHandlerScript: string = ''
  ): string {
    // Basic HTML structure with scripts
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${project.name} - ${view.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 0;
              margin: 0;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .filter-panel {
              margin-bottom: 20px;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .filter-button {
              background-color: #0e639c;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 2px;
              cursor: pointer;
              margin-right: 5px;
            }
            .filter-error {
              background-color: #5a1d1d;
              color: #e9614e;
              padding: 10px;
              margin: 10px 0;
              border-radius: 3px;
              border-left: 3px solid #f14c4c;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${project.name} - ${view.name}</h1>
            <div id="filterPanel" class="filter-panel">
              <h3>Filters</h3>
              <div id="filterBuilder"></div>
              <button id="addFilterBtn" class="filter-add">+ Add Condition</button>
              <div style="margin-top: 10px; display: flex; justify-content: space-between;">
                <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
                <button id="applyFiltersBtn" class="filter-button">Apply Filters</button>
                <button id="saveFilterBtn" class="filter-button">Save Filter</button>
              </div>
            </div>
            
            <div id="contentArea">
              <table>
                <thead>
                  <tr>
                    ${dataframe.fields.map(field => `<th>${field.name}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${dataframe.records.map(record => 
                    `<tr>${dataframe.fields.map(field => {
                      const value = record.values[field.name];
                      if (value === null || value === undefined) {
                        return '<td></td>';
                      } else if (Array.isArray(value)) {
                        return '<td>' + value.join(', ') + '</td>';
                      } else {
                        return '<td>' + value + '</td>';
                      }
                    }).join('')}</tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <script>
            // Initialize dataframe fields for filter builder
            window.dataframeFields = ${JSON.stringify(dataframe.fields)};
            
            // Establish connection to VSCode extension
            const vscode = acquireVsCodeApi();
            
            // Initialize global filter state
            window.filterState = {
              version: '1.3.0',
              activeBuilder: null,
              conditions: [],
              conjunction: 'and'
            };
          </script>
          
          <!-- Load Filter Scripts -->
          <script>${filterBuilderScript}</script>
          <script>${filterHandlerScript}</script>
        </body>
      </html>`;
  }
}
