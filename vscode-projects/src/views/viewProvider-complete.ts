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
        case 'editItem':
          if (message.recordId && message.recordData) {
            try {
              // Find the record in the dataframe
              const recordIndex = dataframe.records.findIndex((r: any) => r.id === message.recordId);
              
              if (recordIndex === -1) {
                throw new Error(`Record with ID ${message.recordId} not found`);
              }
              
              // Update the record values
              const updatedRecord = {
                ...dataframe.records[recordIndex],
                values: message.recordData
              };
              
              // Update the local dataframe
              dataframe.records[recordIndex] = updatedRecord;
              
              // Refresh the view
              panel.webview.html = this.getWebviewContent(
                panel.webview,
                project,
                view,
                dataframe,
                filterBuilderScript,
                filterHandlerScript
              );
              
              // Send confirmation back to webview
              panel.webview.postMessage({
                command: 'itemUpdated',
                recordId: message.recordId,
                success: true
              });
            } catch (error) {
              console.error('Failed to update item:', error);
              panel.webview.postMessage({
                command: 'itemUpdated',
                recordId: message.recordId,
                success: false,
                error: String(error)
              });
            }
          }
          break;
        case 'saveFilter':
          try {
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
              
              // Success message or notification
              panel.webview.postMessage({
                command: 'filterSaved',
                success: true
              });
              
              logDebug('Filter configuration saved', view.filter);
            }
          } catch (error) {
            console.error('Failed to save filter:', error);
            panel.webview.postMessage({
              command: 'filterSaved',
              success: false,
              error: String(error)
            });
          }
          break;
        case 'refreshData':
          try {
            logDebug('Refreshing data with filters', {
              conditions: message.filterConditions,
              conjunction: message.conjunction
            });
            
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
              logDebug('Applied filters', {
                recordsBefore: updatedRawDataframe.records.length,
                recordsAfter: updatedDataframe.records.length
              });
            } else if (view.filter && view.filter.conditions && view.filter.conditions.length > 0) {
              // Apply existing filters
              updatedDataframe = filterEngine.applyFilters(updatedRawDataframe, view.filter);
            }
            
            // Update the local reference 
            dataframe = updatedDataframe;
            
            // Regenerate the HTML content with the updated data
            panel.webview.html = this.getWebviewContent(
              panel.webview,
              project,
              view,
              dataframe,
              filterBuilderScript,
              filterHandlerScript
            );
            
            // Notify webview of data refresh
            panel.webview.postMessage({
              command: 'dataRefreshed',
              recordCount: dataframe.records.length
            });
          } catch (error) {
            console.error('Failed to refresh data:', error);
            vscode.window.showErrorMessage(`Failed to refresh data: ${error}`);
          }
          break;
        case 'updateCalendarConfig':
          try {
            // Update view configuration with calendar settings
            if (view.type === 'calendar' && message.config) {
              // Create a copy of the current view to modify
              const updatedView = { ...view };
              
              // Handle special month navigation values
              if (message.config.month !== undefined) {
                // Get current calendar state
                const currentYear = updatedView.config?.year || new Date().getFullYear();
                const currentMonth = updatedView.config?.month !== undefined ? 
                  updatedView.config.month : new Date().getMonth();
                
                // Process special month values
                if (message.config.month === 'prev') {
                  // Go to previous month, handle year change
                  if (currentMonth === 0) {
                    updatedView.config = {
                      ...updatedView.config,
                      year: currentYear - 1,
                      month: 11 // December
                    };
                  } else {
                    updatedView.config = {
                      ...updatedView.config,
                      month: currentMonth - 1
                    };
                  }
                } else if (message.config.month === 'next') {
                  // Go to next month, handle year change
                  if (currentMonth === 11) {
                    updatedView.config = {
                      ...updatedView.config,
                      year: currentYear + 1,
                      month: 0 // January
                    };
                  } else {
                    updatedView.config = {
                      ...updatedView.config,
                      month: currentMonth + 1
                    };
                  }
                } else if (message.config.month === 'today') {
                  // Reset to current month/year
                  const today = new Date();
                  updatedView.config = {
                    ...updatedView.config,
                    year: today.getFullYear(),
                    month: today.getMonth()
                  };
                } else if (typeof message.config.month === 'number') {
                  // If a direct month number is provided, use it
                  updatedView.config = {
                    ...updatedView.config,
                    month: message.config.month
                  };
                }
                // Ignore any other values for month
              } else {
                // Handle non-month config changes
                updatedView.config = {
                  ...updatedView.config,
                  ...message.config
                };
              }
              
              // Validate the month and year values
              if (updatedView.config?.month !== undefined) {
                const month = updatedView.config.month;
                // Ensure month is in valid range (0-11)
                if (typeof month === 'number' && (month < 0 || month > 11)) {
                  throw new Error(`Invalid month value: ${month}. Must be between 0 and 11.`);
                }
              }
              
              // Update the project with the new view configuration
              const updatedProject = {
                ...project,
                views: project.views.map((v: any) => v.id === view.id ? updatedView : v)
              };
              
              // Save the updated project
              await this.projectManager.updateProject(updatedProject);
              
              // Update our local reference
              view = updatedView;
              
              // Get fresh data
              const updatedCalendarDataframe = await this.projectManager.queryProject(project);
              
              // Apply filters if they exist
              let filteredDataframe = updatedCalendarDataframe;
              if (view.filter && view.filter.conditions && view.filter.conditions.length > 0) {
                filteredDataframe = filterEngine.applyFilters(updatedCalendarDataframe, view.filter);
              }
              
              // Update the dataframe
              dataframe = filteredDataframe;
              
              // Refresh the webview content with the new configuration and data
              panel.webview.html = this.getWebviewContent(
                panel.webview,
                project,
                view,
                dataframe,
                filterBuilderScript,
                filterHandlerScript
              );
              
              // Send confirmation back to webview
              panel.webview.postMessage({
                command: 'configUpdated',
                config: updatedView.config
              });
            }
          } catch (error) {
            console.error('Failed to update calendar config:', error);
            vscode.window.showErrorMessage(`Failed to update calendar configuration: ${error}`);
          }
          break;
      }
    });
  }
  
  /**
   * Find a suitable date field from the available fields
   */
  private findSuitableDateField(fields: any[]): string {
    // Try to find a field with 'date' in the name
    const dateField = fields.find(field => 
      field.name.toLowerCase().includes('date') ||
      field.name.toLowerCase().includes('time') ||
      field.name.toLowerCase().includes('deadline') ||
      field.name.toLowerCase().includes('due')
    );
    
    return dateField ? dateField.name : 'date';
  }
  
  /**
   * Get all date-like fields from the available fields
   */
  private findDateFields(fields: any[]): any[] {
    // Return fields that are likely to contain dates
    return fields.filter(field => 
      field.name.toLowerCase().includes('date') ||
      field.name.toLowerCase().includes('time') ||
      field.name.toLowerCase().includes('deadline') ||
      field.name.toLowerCase().includes('due') ||
      field.name.toLowerCase().includes('created') ||
      field.name.toLowerCase().includes('modified')
    );
  }
  
  /**
   * Get the filter builder script code
   */
  private async getFilterBuilderScript(): Promise<string> {
    try {
      // Log the extension path to debug script loading
      console.log(`[ViewProvider] Extension path: ${this.context.extensionPath}`);
      
      const scriptPath = path.join(this.context.extensionPath, 'media', 'js', 'common-filter-builder.js');
      console.log(`[ViewProvider] Loading filter builder script from: ${scriptPath}`);
      
      const scriptUri = vscode.Uri.file(scriptPath);
      const scriptContent = await vscode.workspace.fs.readFile(scriptUri);
      const scriptText = Buffer.from(scriptContent).toString();
      
      // Log script content length and a snippet to verify it's the right version
      console.log(`[ViewProvider] Loaded filter builder script: ${scriptText.length} bytes`);
      console.log(`[ViewProvider] Script snippet: ${scriptText.substring(0, 100)}...`);
      
      // Add timestamp to prevent caching
      return `
        // Version: ${new Date().toISOString()}
        ${scriptText}
      `;
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
      console.log(`[ViewProvider] Loading filter handler script from: ${scriptPath}`);
      
      const scriptUri = vscode.Uri.file(scriptPath);
      const scriptContent = await vscode.workspace.fs.readFile(scriptUri);
      const scriptText = Buffer.from(scriptContent).toString();
      
      console.log(`[ViewProvider] Loaded filter handler script: ${scriptText.length} bytes`);
      
      // Add timestamp to prevent caching
      return `
        // Version: ${new Date().toISOString()}
        ${scriptText}
      `;
    } catch (error) {
      console.error('Failed to load filter handler script:', error);
      return `console.error("Failed to load filter handler script: ${error}");`;
    }
  }

  /**
   * Creates an empty state message for when no data is available
   */
  private renderEmptyState(message: string = "No matching data found"): string {
    return `
      <div class="empty-state">
        <div style="font-size: 24px; margin-bottom: 8px;">📂</div>
        <h3>${message}</h3>
        <p>Try adjusting your filters to see more results</p>
      </div>
    `;
  }

  /**
   * Renders the filter UI section for all views
   */
  private renderFilterUI(dataframe: DataFrame, view: ViewDefinition, prefix: string = ""): string {
    const prefixId = prefix ? `${prefix}-` : "";

    return `
      <div class="filter-section">
        <div class="filter-controls">
          <button id="${prefixId}clearFilterBtn" class="filter-button">Clear Filters</button>
          <button id="${prefixId}showFiltersBtn" class="filter-button">Show Filters</button>
        </div>
        <div id="${prefixId}filterPanel" class="filter-panel" style="display: none;">
          <h3>Filters</h3>
          
          <div id="${prefixId}filterBuilder" class="filter-builder">
            <!-- Dynamic filter conditions will be added here -->
          </div>
          
          <button id="${prefixId}addFilterBtn" class="filter-add">+ Add Condition</button>
          
          <div class="filter-actions">
            <div>
              <button id="${prefixId}saveFilterBtn" class="filter-button">Save Filter</button>
            </div>
            <div>
              <button id="${prefixId}applyFiltersBtn" class="filter-button">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders a table view of the data
   */
  private renderTableView(dataframe: DataFrame): string {
    // Generate the filter UI section
    const filterSection = this.renderFilterUI(dataframe, { id: "", name: "", type: "table" });
    
    // If no data, show empty state but keep filter UI
    if (dataframe.records.length === 0) {
      return `
        <div class="app-container">
          <div class="filter-container">
            ${filterSection}
          </div>
          <div class="data-container">
            ${this.renderEmptyState()}
          </div>
        </div>
      `;
    }
    
    // Get visible fields
    const visibleFields = dataframe.fields;
    
    // Create the table HTML
    const tableHtml = `
      <table>
        <thead>
          <tr>
            ${visibleFields.map(field => `
              <th>
                <div class="th-content">
                  <span>${field.name}</span>
                  <div class="sort-controls">
                    <span class="sort-control sort-asc" data-field="${field.name}" title="Sort ascending">↑</span>
                    <span class="sort-control sort-desc" data-field="${field.name}" title="Sort descending">↓</span>
                  </div>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
        ${dataframe.records.map(record => `
          <tr>
            ${visibleFields.map(field => {
              const value = record.values[field.name];
              
              // For file paths, make them clickable
              if (field.name === 'path' && typeof value === 'string') {
                return `<td>
                  <span class="file-link" data-path="${value}">${path.basename(value)}</span>
                </td>`;
              } else {
                // Format different data types appropriately
                let displayValue = '';
                
                if (value === null || value === undefined) {
                  displayValue = '';
                } else if (value instanceof Date) {
                  displayValue = value.toLocaleDateString();
                } else if (Array.isArray(value)) {
                  displayValue = value.filter(v => v !== null && v !== undefined).join(', ');
                } else {
                  displayValue = String(value);
                }
                
                return `<td>${displayValue}</td>`;
              }
            }).join('')}
          </tr>
        `).join('')}
        </tbody>
      </table>
    `;
    
    // Combine filter UI and table in the new layout
    return `
      <div class="app-container">
        <div class="filter-container">
          ${filterSection}
        </div>
        <div class="data-container">
          ${tableHtml}
        </div>
      </div>
    `;
  }

  /**
   * Renders a board view of the data
   */
  private renderBoardView(dataframe: DataFrame, view: ViewDefinition): string {
    // Generate the filter UI section
    const filterSection = this.renderFilterUI(dataframe, view);
    
    // If no data, show empty state but keep filter UI
    if (dataframe.records.length === 0) {
      return `
        <div class="app-container">
          <div class="filter-container">
            ${filterSection}
          </div>
          <div class="data-container">
            ${this.renderEmptyState()}
          </div>
        </div>
      `;
    }
    
    // In a real implementation, we would use the view config to determine
    // the grouping field. For now, we'll use a placeholder approach.
    const statusField = view.config?.groupByField || 'status';
    
    // Group records by the status field
    const groups = new Map<string, Array<any>>();
    
    // Add a default "No Status" group
    groups.set('No Status', []);
    
    dataframe.records.forEach(record => {
      // Ensure status is always a string
      let statusValue = record.values[statusField];
      let status = 'No Status';
      
      if (statusValue !== null && statusValue !== undefined) {
        status = String(statusValue);
      }
      
      if (!groups.has(status)) {
        groups.set(status, []);
      }
      
      const recordsForStatus = groups.get(status);
      if (recordsForStatus) {
        recordsForStatus.push(record);
      }
    });
    
    // Create the board columns HTML
    let boardHtml = `<div class="board-container">`;
    
    // Create a column for each status group
    groups.forEach((records, status) => {
      boardHtml += `
        <div class="board-column">
          <div class="column-header">${String(status)} (${records.length})</div>`;
      
      // Add cards for each record in this group
      records.forEach(record => {
        let title = '';
        if (record.values.name !== undefined) {
          title = String(record.values.name);
        } else if (record.values.title !== undefined) {
          title = String(record.values.title);
        } else {
          title = record.id;
        }
        
        const description = record.values.description !== undefined ? String(record.values.description) : '';
        const filePath = record.values.path !== undefined ? String(record.values.path) : '';
        
        boardHtml += `
          <div class="board-card">
            <div class="file-link" data-path="${filePath}">${title}</div>
            <div>${description}</div>
          </div>`;
      });
      
      boardHtml += `</div>`;
    });
    
    boardHtml += `</div>`;
    
    // Combine filter UI and board in the new layout
    return `
      <div class="app-container">
        <div class="filter-container">
          ${filterSection}
        </div>
        <div class="data-container">
          ${boardHtml}
        </div>
      </div>
    `;
  }

  /**
   * Renders a calendar view of the data
   */
  private renderCalendarView(dataframe: DataFrame, view: ViewDefinition): string {
    // Get current date for reference
    const today = new Date();
    
    // Determine which date field to use for the calendar
    const dateField = view.config?.dateField || this.findSuitableDateField(dataframe.fields);
    
    // Use saved year and month from config if available, otherwise use current date
    const currentYear = view.config?.year || today.getFullYear();
    const currentMonth = view.config?.month !== undefined ? view.config.month : today.getMonth();
    
    // Get first day of the month and last day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get the starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startingDay = firstDayOfMonth.getDay();
    
    // Create calendar filter controls
    const calendarFilterControls = `
      <div class="calendar-filter">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <label>Date field: 
              <select id="dateFieldSelect">
                ${this.findDateFields(dataframe.fields).map(field => 
                  `<option value="${field.name}" ${field.name === dateField ? 'selected' : ''}>${field.name}</option>`
                ).join('')}
              </select>
            </label>
          </div>
          <div>
            <button id="calendarShowFiltersBtn" class="filter-button">Show Filters</button>
          </div>
        </div>
      </div>
    `;
    
    // Generate the filter UI section with calendar prefix
    const filterSection = this.renderFilterUI(dataframe, view, "calendar");
    
    // If no data, show empty state but keep filter UI
    if (dataframe.records.length === 0) {
      return `
        <div class="app-container">
          <div class="filter-container">
            <div class="calendar-toolbar">
              <button id="prevMonth">←</button>
              <h2 id="currentMonthDisplay">${firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button id="nextMonth">→</button>
              <button id="todayBtn">Today</button>
            </div>
            ${calendarFilterControls}
            ${filterSection}
          </div>
          <div class="data-container">
            ${this.renderEmptyState("No events found for this view")}
          </div>
        </div>
      `;
    }
    
    // Group records by date
    const recordsByDate = new Map<string, Array<any>>();
    
    dataframe.records.forEach(record => {
      // Get the date value from the record
      let dateValue = record.values[dateField];
      
      // Skip records with no date value
      if (dateValue === null || dateValue === undefined) {
        return;
      }
      
      // Convert the date value to a Date object
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // Try to parse the date string
        date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          return; // Invalid date
        }
      } else if (typeof dateValue === 'number') {
        // Assume timestamp
        date = new Date(dateValue);
      } else {
        return; // Unsupported date format
      }
      
      // Format the date to YYYY-MM-DD for grouping
      const dateKey = date.toISOString().split('T')[0];
      
      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }
      
      const recordsForDate = recordsByDate.get(dateKey);
      if (recordsForDate) {
        recordsForDate.push(record);
      }
    });
    
    // Create the calendar grid HTML
    let calendarGridHtml = `
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="calendar-cell">Sun</div>
          <div class="calendar-cell">Mon</div>
          <div class="calendar-cell">Tue</div>
          <div class="calendar-cell">Wed</div>
          <div class="calendar-cell">Thu</div>
          <div class="calendar-cell">Fri</div>
          <div class="calendar-cell">Sat</div>
        </div>
        
        <div class="calendar-body">
    `;
    
    // Create calendar cells
    let day = 1;
    const totalDays = lastDayOfMonth.getDate();
    
    // Create rows for the calendar
    for (let i = 0; i < 6; i++) { // Maximum 6 weeks in a month view
      calendarGridHtml += `<div class="calendar-row">`;
      
      // Create 7 cells for each day of the week
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDay) || day > totalDays) {
          // Empty cell
          calendarGridHtml += `<div class="calendar-cell empty"></div>`;
        } else {
          // Format the date for this cell
          const cellDate = new Date(currentYear, currentMonth, day);
          const dateKey = cellDate.toISOString().split('T')[0];
          
          // Check if there are records for this date
          const recordsForDate = recordsByDate.get(dateKey) || [];
          const isToday = day === today.getDate() && 
                         currentMonth === today.getMonth() && 
                         currentYear === today.getFullYear();
          
          calendarGridHtml += `
            <div class="calendar-cell ${isToday ? 'today' : ''}" data-date="${dateKey}">
              <div class="calendar-date">${day}</div>
              <div class="
