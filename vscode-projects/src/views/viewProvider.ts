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
   * Renders a table view of the data
   */
  private renderTableView(dataframe: DataFrame): string {
    if (dataframe.records.length === 0) {
      return `<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;
    }
    
    // Get visible fields (could be customized based on view config)
    const visibleFields = dataframe.fields;
    
    // Add filter bar
    let tableHtml = `
    <div class="container">
      <div class="filter-bar">
        <div class="filter-controls">
          <input type="text" id="searchInput" placeholder="Search..." class="search-box">
          <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
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
            </div>
          </div>
          
          <div id="savedFilters" class="filter-saved" style="display: none;">
            <h3>Saved Filters</h3>
            <div id="savedFiltersList">
              <!-- Saved filters will be displayed here -->
            </div>
          </div>
        </div>
      </div>
      
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
    </div>`;
    
    return tableHtml;
  }

  /**
   * Renders a board view of the data
   */
  private renderBoardView(dataframe: DataFrame, view: ViewDefinition): string {
    if (dataframe.records.length === 0) {
      return `<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;
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
    
    let boardHtml = `
    <div class="container">
      <div class="filter-bar">
        <div class="filter-controls">
          <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
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
            </div>
          </div>
        </div>
      </div>
      
      <div class="board-container">`;
    
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
    
    boardHtml += `</div></div>`;
    return boardHtml;
  }

  /**
   * Renders a calendar view of the data
   */
  private renderCalendarView(dataframe: DataFrame, view: ViewDefinition): string {
    if (dataframe.records.length === 0) {
      return `<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;
    }
    
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
    
    // Generate the calendar grid
    let calendarHtml = `
    <div class="container">
      <div class="calendar-container">
        <div class="calendar-toolbar">
          <button id="prevMonth">←</button>
          <h2 id="currentMonthDisplay">${firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button id="nextMonth">→</button>
          <button id="todayBtn">Today</button>
        </div>
        
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
          
          <div id="calendarFilterPanel" class="filter-panel" style="display: none;">
            <h3>Filters</h3>
            
            <div id="calendarFilterBuilder" class="filter-builder">
              <!-- Dynamic filter conditions will be added here -->
            </div>
            
            <button id="calendarAddFilterBtn" class="filter-add">+ Add Condition</button>
            
            <div class="filter-actions">
              <div>
                <button id="calendarSaveFilterBtn" class="filter-button">Save Filter</button>
              </div>
              <div>
                <button id="calendarApplyFiltersBtn" class="filter-button">Apply Filters</button>
                <button id="calendarClearFilterBtn" class="filter-button">Clear</button>
              </div>
            </div>
          </div>
        </div>
        
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
          
          <div class="calendar-body">`;
    
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
    
    // Create calendar cells
    let day = 1;
    const totalDays = lastDayOfMonth.getDate();
    
    // Create rows for the calendar
    for (let i = 0; i < 6; i++) { // Maximum 6 weeks in a month view
      calendarHtml += `<div class="calendar-row">`;
      
      // Create 7 cells for each day of the week
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDay) || day > totalDays) {
          // Empty cell
          calendarHtml += `<div class="calendar-cell empty"></div>`;
        } else {
          // Format the date for this cell
          const cellDate = new Date(currentYear, currentMonth, day);
          const dateKey = cellDate.toISOString().split('T')[0];
          
          // Check if there are records for this date
          const recordsForDate = recordsByDate.get(dateKey) || [];
          const isToday = day === today.getDate() && 
                         currentMonth === today.getMonth() && 
                         currentYear === today.getFullYear();
          
          calendarHtml += `
            <div class="calendar-cell ${isToday ? 'today' : ''}" data-date="${dateKey}">
              <div class="calendar-date">${day}</div>
              <div class="calendar-events">`;
          
          // Add up to 3 events for this date, with a "+X more" indicator if more exist
          if (recordsForDate.length > 0) {
            // Sort records by some criteria (e.g., name or priority)
            recordsForDate.sort((a, b) => {
              const aName = a.values.name || a.values.title || a.id;
              const bName = b.values.name || b.values.title || b.id;
              return String(aName).localeCompare(String(bName));
            });
            
            // Display limited number of events
            const displayLimit = 3;
            const displayEvents = recordsForDate.slice(0, displayLimit);
            
            displayEvents.forEach(record => {
              const name = record.values.name || record.values.title || record.id;
              const filePath = record.values.path || '';
              
              calendarHtml += `
                <div class="calendar-event" data-record-id="${record.id}" data-path="${filePath}">
                  <span title="${name}">${name}</span>
                </div>`;
            });
            
            // If there are more events than the display limit, show a count
            if (recordsForDate.length > displayLimit) {
              const moreCount = recordsForDate.length - displayLimit;
              calendarHtml += `<div class="more-events">+${moreCount} more</div>`;
            }
          }
          
          calendarHtml += `</div></div>`;
          day++;
        }
      }
      
      calendarHtml += `</div>`;
      
      // If we've displayed all days of the month, exit the loop
      if (day > totalDays) {
        break;
      }
    }
    
    calendarHtml += `
          </div>
        </div>
        
        <div class="event-details" id="eventDetails" style="display: none;">
          <div class="event-details-header">
            <h3>Events for <span id="selectedDate"></span></h3>
            <button id="closeEventDetails">✕</button>
          </div>
          <div id="eventDetailsList"></div>
        </div>
      </div>
    </div>`;
    
    return calendarHtml;
  }

  /**
   * Renders a gallery view of the data
   */
  private renderGalleryView(dataframe: DataFrame): string {
    if (dataframe.records.length === 0) {
      return `<div class="container">
        <div class="card">
          <h2>No data</h2>
          <p>This project has no data records.</p>
        </div>
      </div>`;
    }
    
    let galleryHtml = `
    <div class="container">
      <div class="filter-bar">
        <div class="filter-controls">
          <button id="clearFilterBtn" class="filter-button">Clear Filters</button>
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
            </div>
          </div>
        </div>
      </div>
      
      <div class="gallery-grid">`;
    
    // Add cards for each record
    dataframe.records.forEach(record => {
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
      
      galleryHtml += `
        <div class="gallery-card">
          <div class="card-header">
            <div class="file-link" data-path="${filePath}">${title}</div>
          </div>
          <div class="card-body">
            <p>${description}</p>
          </div>
        </div>`;
    });
    
    galleryHtml += `</div></div>`;
    return galleryHtml;
  }
  
  /**
   * Main method to generate webview content based on view type
   */
  private getWebviewContent(
    webview: vscode.Webview,
    project: ProjectDefinition,
    view: ViewDefinition,
    dataframe: DataFrame,
    filterBuilderScript: string = '',
    filterHandlerScript: string = ''
  ): string {
    const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    
    // Base CSS for all views
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
        max-width: 100%;
      }
      
      /* Filter Styles */
      .filter-bar {
        margin-bottom: 16px;
      }
      
      .filter-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      
      .filter-button {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
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
      
      .filter-condition {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .filter-property, .filter-operator, .filter-value, .filter-join {
        padding: 4px;
        background-color: var(--container-background);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        border-radius: 4px;
      }
      
      .filter-remove {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        font-size: 16px;
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
      
      /* Table View Styles */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      
      th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
      }
      
      th {
        position: sticky;
        top: 0;
        background-color: var(--header-background);
        z-index: 10;
      }
      
      .th-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .sort-controls {
        display: flex;
        gap: 4px;
      }
      
      .sort-control {
        cursor: pointer;
        opacity: 0.5;
      }
      
      .sort-control:hover {
        opacity: 1;
      }
      
      /* Board View Styles */
      .board-container {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 16px;
      }
      
      .board-column {
        min-width: 250px;
        background-color: var(--item-background);
        border-radius: 4px;
        padding: 8px;
      }
      
      .column-header {
        font-weight: bold;
        padding: 8px;
        background-color: var(--header-background);
        margin-bottom: 8px;
        border-radius: 4px;
      }
      
      .board-card {
        background-color: var(--container-background);
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      
      /* Calendar View Styles */
      .calendar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .calendar-toolbar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        align-items: center;
      }
      
      .calendar-grid {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      
      .calendar-header {
        display: flex;
        background-color: var(--header-background);
      }
      
      .calendar-body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      
      .calendar-row {
        display: flex;
        flex: 1;
      }
      
      .calendar-cell {
        flex: 1;
        min-height: 100px;
        border: 1px solid var(--border-color);
        padding: 4px;
        position: relative;
      }
      
      .calendar-cell.empty {
        background-color: var(--container-background);
      }
      
      .calendar-cell.today {
        background-color: var(--highlight-color);
      }
      
      .calendar-date {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 12px;
      }
      
      .calendar-events {
        margin-top: 20px;
      }
      
      .calendar-event {
        background-color: var(--item-background);
        margin-bottom: 4px;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
      
      .more-events {
        text-align: center;
        font-size: 10px;
        color: var(--text-color);
        opacity: 0.7;
      }
      
      /* Gallery View Styles */
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .gallery-card {
        background-color: var(--item-background);
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      
      .card-header {
        background-color: var(--header-background);
        padding: 8px;
        font-weight: bold;
      }
      
      .card-body {
        padding: 8px;
      }
      
      /* Common components */
      .file-link {
        color: var(--text-color);
        text-decoration: underline;
        cursor: pointer;
      }
      
      .search-box {
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        background-color: var(--item-background);
        color: var(--text-color);
        border-radius: 4px;
      }
    `;
    
    // Generate the project fields array for the filter builder
    const fields = dataframe.fields.map(field => ({
      name: field.name,
      type: field.type
    }));
    
    // Serialize the fields to a JSON string for use in the filter builder
    const fieldsJson = JSON.stringify(fields);
    
    // Generate the view HTML based on view type
    let viewHtml = '';
    
    switch (view.type) {
      case 'table':
        viewHtml = this.renderTableView(dataframe);
        break;
      case 'board':
        viewHtml = this.renderBoardView(dataframe, view);
        break;
      case 'calendar':
        viewHtml = this.renderCalendarView(dataframe, view);
        break;
      case 'gallery':
        viewHtml = this.renderGalleryView(dataframe);
        break;
      default:
        // Default to table view
        viewHtml = this.renderTableView(dataframe);
    }
    
    // Complete HTML content
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.name} - ${view.name}</title>
        <style>${baseCss}</style>
      </head>
      <body>
        <header>
          <h1>${project.name} - ${view.name}</h1>
        </header>
        
        ${viewHtml}
        
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
              // Handle file links
              document.querySelectorAll('.file-link').forEach(link => {
                link.addEventListener('click', (e) => {
                  const path = link.getAttribute('data-path');
                  if (path) {
                    window.vscode.postMessage({
                      command: 'openFile',
                      path: path
                    });
                  }
                });
              });
              
              // Handle filter panel toggle
              const showFiltersBtn = document.getElementById('showFiltersBtn');
              const filterPanel = document.getElementById('filterPanel');
              
              if (showFiltersBtn && filterPanel) {
                showFiltersBtn.addEventListener('click', () => {
                  filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
                });
              }
              
              // For calendar view
              const calendarShowFiltersBtn = document.getElementById('calendarShowFiltersBtn');
              const calendarFilterPanel = document.getElementById('calendarFilterPanel');
              
              if (calendarShowFiltersBtn && calendarFilterPanel) {
                calendarShowFiltersBtn.addEventListener('click', () => {
                  calendarFilterPanel.style.display = calendarFilterPanel.style.display === 'none' ? 'block' : 'none';
                });
              }
              
              // Calendar date field selection
              const dateFieldSelect = document.getElementById('dateFieldSelect');
              if (dateFieldSelect) {
                dateFieldSelect.addEventListener('change', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: {
                      dateField: dateFieldSelect.value
                    }
                  });
                });
              }
              
              // Calendar navigation
              const prevMonthBtn = document.getElementById('prevMonth');
              const nextMonthBtn = document.getElementById('nextMonth');
              const todayBtn = document.getElementById('todayBtn');
              
              if (prevMonthBtn) {
                prevMonthBtn.addEventListener('click', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: { month: 'prev' }
                  });
                });
              }
              
              if (nextMonthBtn) {
                nextMonthBtn.addEventListener('click', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: { month: 'next' }
                  });
                });
              }
              
              if (todayBtn) {
                todayBtn.addEventListener('click', () => {
                  window.vscode.postMessage({
                    command: 'updateCalendarConfig',
                    config: { month: 'today' }
                  });
                });
              }
            });
            
          // Expose dataframe fields globally for potential use
          window.dataframeFields = ${fieldsJson};
          
          // Initialize filter builder if script is loaded
          function initializeFilterBuilder() {
            try {
              console.log('Initializing filter builder...');
              
              if (typeof createFilterBuilder !== 'function') {
                console.error('createFilterBuilder function not found - filter builder script may not be loaded yet');
                return false;
              }
              
              // Pass the available fields to the filter builder
              const fields = window.dataframeFields || ${fieldsJson};
              
              // Create the main filter builder instance
              const filterBuilder = document.getElementById('filterBuilder');
              if (filterBuilder) {
                // Create filter builder and store reference
                window.filterBuilderComponent = createFilterBuilder({
                  container: filterBuilder,
                  fields: fields,
                  addButton: document.getElementById('addFilterBtn'),
                  conjunction: ${view.filter?.conjunction ? `"${view.filter.conjunction}"` : '"and"'},
                  conditions: ${view.filter?.conditions ? JSON.stringify(view.filter.conditions) : '[]'}
                });
                
                // Ensure filterState is created before setting activeBuilder
                window.filterState = window.filterState || {
                  builders: {},
                  activeBuilder: null,
                  conditions: [],
                  conjunction: 'and'
                };
                
                // Store reference in global state
                window.filterState.activeBuilder = window.filterBuilderComponent;
                console.log('Filter builder initialized successfully');
                return true;
              } else {
                console.error('Filter builder container element not found');
                return false;
              }
            } catch (error) {
              console.error('Error initializing filter builder:', error);
              return false;
            }
          }
          
          // Try to initialize immediately
          const initialized = initializeFilterBuilder();
          
          // If not successful, retry on load and with a delay
          if (!initialized) {
            window.addEventListener('load', function() {
              console.log('Window loaded, trying to initialize filter builder again');
              if (!window.filterState?.activeBuilder) {
                initializeFilterBuilder();
              }
            });
            
            // Also try after a short delay as a fallback
            setTimeout(function() {
              console.log('Delayed initialization check');
              if (!window.filterState?.activeBuilder) {
                initializeFilterBuilder();
              }
            }, 500);
          }
              
          // Initialize calendar filter builder
          function initializeCalendarFilterBuilder() {
            try {
              if (typeof createFilterBuilder !== 'function') {
                return false;
              }
              
              // Create a separate filter builder for calendar view if needed
              const calendarFilterBuilder = document.getElementById('calendarFilterBuilder');
              if (calendarFilterBuilder) {
                window.calendarFilterBuilderComponent = createFilterBuilder({
                  container: calendarFilterBuilder,
                  fields: window.dataframeFields || ${fieldsJson},
                  addButton: document.getElementById('calendarAddFilterBtn'),
                  conjunction: ${view.filter?.conjunction ? `"${view.filter.conjunction}"` : '"and"'},
                  conditions: ${view.filter?.conditions ? JSON.stringify(view.filter.conditions) : '[]'}
                });
                
                // Ensure filterState exists
                window.filterState = window.filterState || {
                  builders: {},
                  activeBuilder: null,
                  conditions: [],
                  conjunction: 'and'
                };
                
                // Store reference for the calendar filter builder
                window.filterState.calendarBuilder = window.calendarFilterBuilderComponent;
                return true;
              }
              return false;
            } catch (error) {
              console.error('Error initializing calendar filter builder:', error);
              return false;
            }
          }
          
          // Try to initialize calendar builder
          setTimeout(function() {
            if (document.getElementById('calendarFilterBuilder')) {
              initializeCalendarFilterBuilder();
            }
          }, 300);
            }
            
            // Handle messages from extension
            window.addEventListener('message', event => {
              const message = event.data;
              console.log('Received message from extension:', message);
              
              switch(message.command) {
                case 'filterSaved':
                  if (message.success) {
                    console.log('Filter saved successfully');
                    // Optional notification to the user
                  }
                  break;
                
                case 'dataRefreshed':
                  console.log('Data refreshed:', message.recordCount, 'records');
                  break;
                
                case 'itemUpdated':
                  console.log('Item updated:', message.recordId, message.success);
                  break;
                
                case 'configUpdated':
                  console.log('Configuration updated:', message.config);
                  break;
              }
            });
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
