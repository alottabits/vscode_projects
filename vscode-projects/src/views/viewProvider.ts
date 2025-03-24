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
    panel.webview.html = this.getSimpleWebviewContent(
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
        case 'refreshData':
          try {
            // Get fresh data
            const updatedRawDataframe = await this.projectManager.queryProject(project);
            
            // Apply filters using the filter engine
            let updatedDataframe = updatedRawDataframe;
            
            // Update view filter configuration if filter conditions provided
            if (message.filterConditions) {
              // Update the view filter with the new conditions
              view.filter = {
                conjunction: message.conjunction || 'and',
                conditions: message.filterConditions
              };
              
              // Update the project with the modified view
              await this.projectManager.updateProject({
                ...project,
                views: project.views.map((v: any) => v.id === view.id ? view : v)
              });
              
              // Apply the updated filters to the data
              updatedDataframe = filterEngine.applyFilters(updatedRawDataframe, view.filter);
            } else if (view.filter && view.filter.conditions && view.filter.conditions.length > 0) {
              // Apply existing filters
              updatedDataframe = filterEngine.applyFilters(updatedRawDataframe, view.filter);
            }
            
            // Update the local reference 
            dataframe = updatedDataframe;
            
            // Regenerate the HTML content with the updated data
            panel.webview.html = this.getSimpleWebviewContent(
              panel.webview,
              project,
              view,
              dataframe,
              filterBuilderScript,
              filterHandlerScript
            );
          } catch (error) {
            console.error('Failed to refresh data:', error);
            vscode.window.showErrorMessage(`Failed to refresh data: ${error}`);
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
      const scriptUri = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'js', 'common-filter-builder.js'));
      const scriptContent = await vscode.workspace.fs.readFile(scriptUri);
      return Buffer.from(scriptContent).toString();
    } catch (error) {
      console.error('Failed to load filter builder script:', error);
      return '';
    }
  }

  /**
   * Get the filter handler script code
   */
  private async getFilterHandlerScript(): Promise<string> {
    try {
      const scriptUri = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'js', 'filter-handler.js'));
      const scriptContent = await vscode.workspace.fs.readFile(scriptUri);
      return Buffer.from(scriptContent).toString();
    } catch (error) {
      console.error('Failed to load filter handler script:', error);
      return '';
    }
  }

  /**
   * A simplified version of the webview content that focuses on the filter functionality
   */
  private getSimpleWebviewContent(
    webview: vscode.Webview,
    project: ProjectDefinition,
    view: ViewDefinition,
    dataframe: DataFrame,
    filterBuilderScript: string = '',
    filterHandlerScript: string = ''
  ): string {
    const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    
    // Simplified CSS
    const baseCss = `
      :root {
        --container-background: ${isDarkTheme ? '#252526' : '#f3f3f3'};
        --item-background: ${isDarkTheme ? '#2d2d2d' : '#ffffff'};
        --text-color: ${isDarkTheme ? '#e7e7e7' : '#333333'};
        --border-color: ${isDarkTheme ? '#3c3c3c' : '#dddddd'};
        --highlight-color: ${isDarkTheme ? '#264f78' : '#ddddff'};
        --header-background: ${isDarkTheme ? '#333333' : '#eeeeee'};
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: var(--text-color);
        background-color: var(--container-background);
        padding: 0;
        margin: 0;
      }
      
      .container {
        padding: 16px;
      }
      
      .filter-bar {
        margin-bottom: 16px;
      }
      
      .filter-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .filter-button {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 4px 8px;
        cursor: pointer;
      }
      
      .filter-panel {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 4px;
      }
      
      .filter-builder {
        margin-bottom: 16px;
      }
      
      .filter-add {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        text-decoration: underline;
        padding: 0;
        margin-bottom: 16px;
      }
      
      .filter-actions {
        display: flex;
        justify-content: space-between;
      }
    `;
    
    // Generate the project fields array for the filter builder
    const fields = dataframe.fields.map(field => ({
      name: field.name,
      type: field.type
    }));
    
    // Serialize the fields to a JSON string for use in the filter builder
    const fieldsJson = JSON.stringify(fields);
    
    // Simple HTML content focusing on the filter functionality
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.name} - ${view.name}</title>
        <style>${baseCss}</style>
      </head>
      <body>
        <div class="container">
          <h1>${project.name} - ${view.name}</h1>
          
          <div class="filter-bar">
            <div class="filter-controls">
              <button id="showFiltersBtn" class="filter-button">Show Filters</button>
            </div>
            <div id="filterPanel" class="filter-panel" style="display: none;">
              <h3>Filters</h3>
              
              <div id="filterBuilder" class="filter-builder">
                <!-- Dynamic filter conditions will be added here -->
              </div>
              
              <button id="addFilterBtn" class="filter-add">+ Add Condition</button>
              
              <div class="filter-actions">
                <div>
                  <button id="saveFilterBtn" class="filter-button">Save Filter</button>
                </div>
                <div>
                  <button id="applyFiltersBtn" class="filter-button">Apply Filters</button>
                  <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
                </div>
              </div>
            </div>
          </div>
          
          <div id="dataView">
            <h3>Data Records: ${dataframe.records.length}</h3>
            <p>This is a simplified view focusing on the filter functionality.</p>
          </div>
        </div>
        
        <script>
          // Client-side code for interactivity
          (function() {
            // Acquire the VS Code API once and make it globally available
            window.vscode = window.vscode || acquireVsCodeApi();
            
            // Global state for filter components
            window.filterState = {
              activeBuilder: null
            };
            
            // Initialize event listeners
            document.addEventListener('DOMContentLoaded', () => {
              // Handle filter panel toggle
              const showFiltersBtn = document.getElementById('showFiltersBtn');
              const filterPanel = document.getElementById('filterPanel');
              
              if (showFiltersBtn && filterPanel) {
                showFiltersBtn.addEventListener('click', () => {
                  filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
                });
              }
              
              // Clear filter button
              const clearFilterBtn = document.getElementById('clearFilterBtn');
              if (clearFilterBtn) {
                clearFilterBtn.addEventListener('click', () => {
                  if (window.projectsFilter && typeof window.projectsFilter.clearFilters === 'function') {
                    window.projectsFilter.clearFilters();
                  }
                });
              }
            });
            
            // Initialize filter builder if script is loaded
            if (typeof createFilterBuilder === 'function') {
              // Pass the available fields to the filter builder
              const fields = ${fieldsJson};
              
              // Create the filter builder instance
              if (document.getElementById('filterBuilder')) {
                window.filterBuilderComponent = createFilterBuilder({
                  container: document.getElementById('filterBuilder'),
                  fields: fields,
                  addButton: document.getElementById('addFilterBtn'),
                  conjunction: ${view.filter?.conjunction ? `"${view.filter.conjunction}"` : '"and"'},
                  conditions: ${view.filter?.conditions ? JSON.stringify(view.filter.conditions) : '[]'}
                });
                
                // Store reference in global state
                window.filterState.activeBuilder = window.filterBuilderComponent;
              }
            }
          })();
        </script>
        
        <!-- Filter Builder Script -->
        <script>${filterBuilderScript}</script>
        
        <!-- Filter Handler Script -->
        <script>${filterHandlerScript}</script>
      </body>
    </html>`;
  }
}
