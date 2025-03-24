import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectManager } from '../models/projectManager';
import { ProjectDefinition, ViewDefinition } from '../models/settings';
import { DataFrame } from '../models/dataframe';
import { DataFilterEngine, FilterConfig, FilterCondition } from '../models/dataFilterEngine';

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
    
    // Handle webview messages
    panel.webview.onDidReceiveMessage(async (message) => {
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
              
              // Note: No direct dataframe update method available in ProjectManager
              // We'll just refresh the view with the updated dataframe
              // This will be lost on refresh, but serves as a preview until the user saves the file
              
              // In a complete implementation, we would need to:
              // 1. Parse the file
              // 2. Update its frontmatter 
              // 3. Save it back
              // For now, we'll just update the in-memory representation
              
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
            vscode.window.showErrorMessage(`Failed to refresh data: ${error}`);
          }
          break;
        case 'updateCalendarConfig':
          // Update view configuration with calendar settings
          if (view.type === 'calendar' && message.config) {
            // Create a copy of the current view to modify
            const updatedView = { ...view };
            
            // Create or update the config object
            updatedView.config = {
              ...updatedView.config,
              ...message.config
            };
            
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
              const filterEngine = new DataFilterEngine();
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
            
            <div id="calendarSavedFilters" class="filter-saved" style="display: none;">
              <h3>Saved Filters</h3>
              <div id="calendarSavedFiltersList">
                <!-- Saved filters will be displayed here -->
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
    
    let galleryHtml = `<div class="container">
      <h2>Gallery View</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">`;
    
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
        <div class="card" style="height: 200px; overflow: hidden;">
          <h3><span class="file-link" data-path="${filePath}">${title}</span></h3>
          <p>${description}</p>
        </div>`;
    });
    
    galleryHtml += `</div></div>`;
    return galleryHtml;
  }
  
  /**
   * Generates the HTML content for the webview
   */
  private getWebviewContent(
    webview: vscode.Webview,
    project: ProjectDefinition,
    view: ViewDefinition,
    dataframe: DataFrame,
    filterBuilderScript: string = '',
    filterHandlerScript: string = ''
  ): string {
    // Get the style for the current VS Code theme
    const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    
    // Base CSS for the view
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
      
      .toolbar {
        padding: 8px;
        background-color: var(--header-background);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
      }
      
      .toolbar button {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 4px 8px;
        margin-right: 8px;
        cursor: pointer;
      }
      
      .toolbar button:hover {
        background-color: var(--highlight-color);
      }
      
      .container {
        padding: 16px;
      }
      
      .card {
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 8px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        background-color: var(--item-background);
        border-radius: 4px;
        overflow: hidden;
      }
      
      th {
        text-align: left;
        padding: 8px;
        background-color: var(--header-background);
        position: sticky;
        top: 0;
        z-index: 10;
      }
      
      td {
        padding: 8px;
        border-top: 1px solid var(--border-color);
      }
      
      tr:hover {
        background-color: var(--highlight-color);
      }
      
      .th-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .sort-controls {
        display: flex;
        flex-direction: column;
      }
      
      .sort-control {
        cursor: pointer;
        padding: 0 4px;
        font-size: 10px;
      }
      
      .sort-control:hover {
        background-color: var(--highlight-color);
      }
      
      .file-link {
        color: var(--text-color);
        text-decoration: underline;
        cursor: pointer;
      }
      
      .filter-bar {
        margin-bottom: 16px;
      }
      
      .filter-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .search-box {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid var(--border-color);
        background-color: var(--item-background);
        color: var(--text-color);
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
      
      .filter-condition {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
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
        padding: 8px;
        font-weight: bold;
        margin-bottom: 8px;
        background-color: var(--header-background);
        border-radius: 4px;
      }
      
      .board-card {
        background-color: var(--container-background);
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
      }
      
      .calendar-container {
        background-color: var(--item-background);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .calendar-toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background-color: var(--header-background);
      }
      
      .calendar-filter {
        padding: 8px 16px;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
      }
      
      .calendar-grid {
        display: flex;
        flex-direction: column;
      }
      
      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      
      .calendar-cell {
        padding: 8px;
        height: 120px;
        border-right: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        overflow: hidden;
      }
      
      .calendar-header .calendar-cell {
        height: auto;
        text-align: center;
        font-weight: bold;
        background-color: var(--header-background);
      }
      
      .calendar-row {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      
      .calendar-date {
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .calendar-cell.empty {
        background-color: var(--container-background);
      }
      
      .calendar-cell.today {
        background-color: var(--highlight-color);
      }
      
      .calendar-event {
        background-color: var(--container-background);
        padding: 2px 4px;
        margin-bottom: 2px;
        border-radius: 2px;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }
      
      .event-details {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--item-background);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 16px;
        min-width: 300px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 100;
      }
      
      .event-details-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      
      .more-events {
        font-size: 12px;
        color: var(--text-color);
        opacity: 0.8;
        text-align: center;
      }
    `;
    
    // View-specific CSS
    let viewCss = '';
    
    switch (view.type) {
      case 'board':
        viewCss = `
          body {
            overflow-x: auto;
          }
          
          .board-container {
            display: flex;
            gap: 16px;
            padding: 16px;
            min-height: calc(100vh - 32px);
          }
        `;
        break;
      case 'calendar':
        viewCss = `
          .calendar-container {
            height: calc(100vh - 32px);
            display: flex;
            flex-direction: column;
          }
          
          .calendar-grid {
            flex: 1;
            overflow-y: auto;
          }
        `;
        break;
    }
    
    // Decide which view to render based on the view type
    let viewContent = '';
    switch (view.type) {
      case 'table':
        viewContent = this.renderTableView(dataframe);
        break;
      case 'board':
        viewContent = this.renderBoardView(dataframe, view);
        break;
      case 'calendar':
        viewContent = this.renderCalendarView(dataframe, view);
        break;
      case 'gallery':
        viewContent = this.renderGalleryView(dataframe);
        break;
      default:
        viewContent = this.renderTableView(dataframe); // Default to table view
    }
    
    // Generate the project fields array for the filter builder
    const fields = dataframe.fields.map(field => ({
      name: field.name,
      type: field.type
    }));
    
    // Serialize the fields to a JSON string for use in the filter builder
    const fieldsJson = JSON.stringify(fields);
    
    // Final HTML output
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.name} - ${view.name}</title>
        <style>
          ${baseCss}
          ${viewCss}
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button id="backButton">← Back to Projects</button>
          <span>${project.name} - ${view.name}</span>
        </div>
        
        ${viewContent}
        
        <script>
          // Client-side code for interactivity
          (function() {
            // Acquire the VS Code API once and make it globally available
            window.vscode = window.vscode || acquireVsCodeApi();
            const vscode = window.vscode;
            
            // Initialize event listeners
            document.addEventListener('DOMContentLoaded', () => {
              // Back button to return to projects tree view
              const backButton = document.getElementById('backButton');
              if (backButton) {
                backButton.addEventListener('click', () => {
                  vscode.postMessage({ command: 'showProjects' });
                });
              }
              
              // Make file links clickable
              document.querySelectorAll('.file-link').forEach(link => {
                link.addEventListener('click', () => {
                  const path = link.getAttribute('data-path');
                  if (path) {
                    vscode.postMessage({
                      command: 'openFile',
                      path: path
                    });
                  }
                });
              });
              
              // Table view related event listeners
              if (document.querySelector('table')) {
                // Handle sort controls
                document.querySelectorAll('.sort-control').forEach(sortControl => {
                  sortControl.addEventListener('click', () => {
                    const field = sortControl.getAttribute('data-field');
                    const direction = sortControl.classList.contains('sort-asc') ? 'asc' : 'desc';
                    
                    vscode.postMessage({
                      command: 'sortData',
                      field: field,
                      direction: direction
                    });
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
                
                // Clear filter button
                const clearFilterBtn = document.getElementById('clearFilterBtn');
                if (clearFilterBtn) {
                  clearFilterBtn.addEventListener('click', () => {
                    if (window.projectsFilter && typeof window.projectsFilter.clearFilters === 'function') {
                      window.projectsFilter.clearFilters();
                    }
                  });
                }
              }
              
              // Calendar view related event listeners
              if (document.querySelector('.calendar-container')) {
                // Date field selector
                const dateFieldSelect = document.getElementById('dateFieldSelect');
                if (dateFieldSelect) {
                  dateFieldSelect.addEventListener('change', () => {
                    vscode.postMessage({
                      command: 'updateCalendarConfig',
                      config: {
                        dateField: dateFieldSelect.value
                      }
                    });
                  });
                }
                
                // Month navigation
                const prevMonthBtn = document.getElementById('prevMonth');
                const nextMonthBtn = document.getElementById('nextMonth');
                const todayBtn = document.getElementById('todayBtn');
                
                if (prevMonthBtn) {
                  prevMonthBtn.addEventListener('click', () => {
                    vscode.postMessage({
                      command: 'updateCalendarConfig',
                      config: {
                        month: ${view.config?.month !== undefined ? view.config.month : 'new Date().getMonth()'} - 1
                      }
                    });
                  });
                }
                
                if (nextMonthBtn) {
                  nextMonthBtn.addEventListener('click', () => {
                    vscode.postMessage({
                      command: 'updateCalendarConfig',
                      config: {
                        month: ${view.config?.month !== undefined ? view.config.month : 'new Date().getMonth()'} + 1
                      }
                    });
                  });
                }
                
                if (todayBtn) {
                  todayBtn.addEventListener('click', () => {
                    const today = new Date();
                    vscode.postMessage({
                      command: 'updateCalendarConfig',
                      config: {
                        year: today.getFullYear(),
                        month: today.getMonth()
                      }
                    });
                  });
                }
                
                // Calendar filters
                const calendarShowFiltersBtn = document.getElementById('calendarShowFiltersBtn');
                const calendarFilterPanel = document.getElementById('calendarFilterPanel');
                
                if (calendarShowFiltersBtn && calendarFilterPanel) {
                  calendarShowFiltersBtn.addEventListener('click', () => {
                    calendarFilterPanel.style.display = calendarFilterPanel.style.display === 'none' ? 'block' : 'none';
                  });
                }
                
                // Calendar clear filter button
                const calendarClearFilterBtn = document.getElementById('calendarClearFilterBtn');
                if (calendarClearFilterBtn) {
                  calendarClearFilterBtn.addEventListener('click', () => {
                    if (window.projectsFilter && typeof window.projectsFilter.clearFilters === 'function') {
                      window.projectsFilter.clearFilters();
                    }
                  });
                }
                
                // Calendar event details
                const eventDetails = document.getElementById('eventDetails');
                const closeEventDetails = document.getElementById('closeEventDetails');
                const selectedDate = document.getElementById('selectedDate');
                const eventDetailsList = document.getElementById('eventDetailsList');
                
                // Add click event to calendar cells to show events for that day
                document.querySelectorAll('.calendar-cell:not(.empty)').forEach(cell => {
                  cell.addEventListener('click', () => {
                    const date = cell.getAttribute('data-date');
                    if (date && eventDetails && selectedDate && eventDetailsList) {
                      // Format date for display
                      const displayDate = new Date(date).toLocaleDateString();
                      selectedDate.textContent = displayDate;
                      
                      // Get all events for this date
                      const events = cell.querySelectorAll('.calendar-event');
                      let eventDetailsHtml = '';
                      
                      if (events.length === 0) {
                        eventDetailsHtml = '<p>No events for this date.</p>';
                      } else {
                        events.forEach(event => {
                          const title = event.querySelector('span').getAttribute('title');
                          const recordId = event.getAttribute('data-record-id');
                          const path = event.getAttribute('data-path');
                          
                          eventDetailsHtml += \`
                            <div class="event-detail">
                              <h4><span class="file-link" data-path="\${path}">\${title}</span></h4>
                            </div>
                          \`;
                        });
                      }
                      
                      eventDetailsList.innerHTML = eventDetailsHtml;
                      eventDetails.style.display = 'block';
                      
                      // Make file links in event details clickable
                      eventDetailsList.querySelectorAll('.file-link').forEach(link => {
                        link.addEventListener('click', () => {
                          const path = link.getAttribute('data-path');
                          if (path) {
                            vscode.postMessage({
                              command: 'openFile',
                              path: path
                            });
                          }
                        });
                      });
                    }
                  });
                });
                
                // Close event details
                if (closeEventDetails && eventDetails) {
                  closeEventDetails.addEventListener('click', () => {
                    eventDetails.style.display = 'none';
                  });
                }
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
              }
              
              if (document.getElementById('calendarFilterBuilder')) {
                window.calendarFilterBuilderComponent = createFilterBuilder({
                  container: document.getElementById('calendarFilterBuilder'),
                  fields: fields,
                  addButton: document.getElementById('calendarAddFilterBtn'),
                  conjunction: ${view.filter?.conjunction ? `"${view.filter.conjunction}"` : '"and"'},
                  conditions: ${view.filter?.conditions ? JSON.stringify(view.filter.conditions) : '[]'}
                });
              }
            }
          })();
        </script>
        
        <!-- Custom Filter Builder Script -->
        <script>${filterBuilderScript}</script>
        
        <!-- Filter Handler Script -->
        <script>${filterHandlerScript}</script>
      </body>
    </html>`;
  }
}
