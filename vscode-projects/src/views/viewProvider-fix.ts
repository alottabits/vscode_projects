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
    
    // Base CSS for all views with improved layout structure
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
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      /* Improved layout with fixed structure */
      header {
        padding: 8px 16px;
        background-color: var(--header-background);
        border-bottom: 1px solid var(--border-color);
      }
      
      .app-container {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 60px); /* Adjust for header */
        overflow: hidden;
      }
      
      .filter-container {
        flex: 0 0 auto;
        padding: 8px 16px;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--item-background);
        z-index: 10; /* Keep filters above content */
      }
      
      .data-container {
        flex: 1 1 auto;
        padding: 16px;
        overflow: auto;
      }
      
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-color-secondary, #888);
        background-color: var(--item-background);
        border-radius: 4px;
        margin: 16px 0;
        padding: 16px;
        text-align: center;
      }
      
      /* Filter Styles */
      .filter-section {
        margin-bottom: 8px;
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

      .filter-error {
        background-color: #5a1d1d;
        color: #e9614e;
        padding: 10px;
        margin: 10px 0;
        border-radius: 3px;
        border-left: 3px solid #f14c4c;
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
        height: 100%;
      }
      
      .board-column {
        min-width: 250px;
        background-color: var(--item-background);
        border-radius: 4px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        max-height: 100%;
      }
      
      .column-header {
        font-weight: bold;
        padding: 8px;
        background-color: var(--header-background);
        margin-bottom: 8px;
        border-radius: 4px;
        position: sticky;
        top: 0;
        z-index: 1;
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
            
            // Expose dataframe fields globally for potential use
            window.dataframeFields = ${fieldsJson};
            
            // Initialize global filterState for the filter handlers
            window.filterState = {
              version: '1.0.1',
              activeBuilder: null,
              conditions: [],
              conjunction: 'and'
            };
            
            // Handle file links
            document.addEventListener('DOMContentLoaded', () => {
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
            });
            
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

  /**
   * Renders a gallery view of the data
   */
  private renderGalleryView(dataframe: DataFrame): string {
    // Generate the filter UI section
    const filterSection = this.renderFilterUI(dataframe, { id: "", name: "", type: "gallery" });
    
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
    
    // Create the gallery HTML
    let galleryHtml = `<div class="gallery-grid">`;
    
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
    
    galleryHtml += `</div>`;
    
    // Combine filter UI and gallery in the new layout
    return `
      <div class="app-container">
        <div class="filter-container">
          ${filterSection}
        </div>
        <div class="data-container">
          ${galleryHtml}
        </div>
      </div>
    `;
  }
