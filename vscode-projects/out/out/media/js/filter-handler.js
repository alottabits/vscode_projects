/**
 * Filter handler for VSCode Projects extension
 * This script manages the filter UI components and handles the communication with the extension.
 */

// Immediately log that the script is loading for debugging
console.log("[FILTER-BUILDER] Script loading - Timestamp: " + new Date().toISOString());

// Namespace to avoid global pollution
window.FilterHandler = {
  initialized: false,
  filterState: null,
  filterPanel: null,
  filterBuilder: null,
  showFiltersButton: null,
  hideFiltersButton: null,
  clearFilterButton: null,
  applyFilterButton: null,
  saveFilterButton: null,
  addFilterButton: null,
  
  // Log function with identifier
  log(message, data) {
    console.log(`[FilterHandler] ${message}`, data);
  },
  
  /**
   * Initialize filter handler
   */
  initialize() {
    if (this.initialized) {
      return;
    }
    
    this.log('Initializing filter handlers');
    
    // Find filter UI elements
    this.filterPanel = document.getElementById('filterPanel');
    this.filterBuilder = document.getElementById('filterBuilder');
    this.showFiltersButton = document.getElementById('showFiltersBtn');
    this.clearFilterButton = document.getElementById('clearFilterBtn');
    this.applyFilterButton = document.getElementById('applyFiltersBtn');
    this.saveFilterButton = document.getElementById('saveFilterBtn');
    this.addFilterButton = document.getElementById('addFilterBtn');
    
    // Attach event handlers to filter controls
    this.attachFilterHandlers();
    
    // Force immediate initialization of filter builder
    this.initFilterBuilder();
    
    // Mark as initialized
    this.initialized = true;
    
    // Schedule a delayed check to ensure filter builder was created
    setTimeout(() => this.checkFilterBuilder(), 500);
  },
  
  /**
   * Check if filter builder was properly initialized and retry if not
   */
  checkFilterBuilder() {
    this.log('Running delayed initialization check');
    
    // Access the filter builder from the global window object
    const activeBuilder = window.filterState?.activeBuilder;
    
    if (!activeBuilder) {
      this.log('Filter builder not found in delayed check, trying to initialize again');
      this.initFilterBuilder();
    }
  },
  
  /**
   * Initialize the filter builder component
   */
  initFilterBuilder() {
    this.log('Initializing filter handlers');
    
    // Ensure the filter builder is created
    if (this.filterBuilder && typeof createFilterBuilder === 'function') {
      // If we already have a filter state reference, use it
      if (window.filterState && window.filterState.activeBuilder) {
        this.filterState = window.filterState;
        return;
      }
      
      // Create a filter builder with an empty condition to start
      const fields = window.dataframeFields || [];
      
      try {
        // Create initial empty condition
        const defaultConditions = [{
          property: fields.length > 0 ? fields[0].name : 'name',
          operator: 'contains',
          value: ''
        }];
        
        // Create the filter builder
        const filterBuilder = createFilterBuilder({
          container: this.filterBuilder,
          fields: fields,
          addButton: this.addFilterButton,
          conjunction: 'and',
          conditions: defaultConditions
        });
        
        // Store reference to the builder
        if (!window.filterState) {
          window.filterState = {
            activeBuilder: filterBuilder,
            conditions: defaultConditions,
            conjunction: 'and'
          };
        } else {
          window.filterState.activeBuilder = filterBuilder;
        }
        
        this.filterState = window.filterState;
        
        this.log('Filter builder initialized with empty condition');
      } catch (error) {
        console.error('Error initializing filter builder:', error);
      }
    }
  },

  /**
   * Attempt to create the filter builder if it doesn't exist
   */
  createFilterBuilderIfMissing() {
    // Check if we have the filter state
    if (!this.filterState || !this.filterState.activeBuilder) {
      this.log('Attempting to create missing filter builder');
      
      // Only proceed if the create function exists
      if (typeof createFilterBuilder === 'function') {
        // Create with default options
        const options = {
          container: this.filterBuilder,
          fields: window.dataframeFields || [],
          addButton: this.addFilterButton,
          conjunction: 'and',
          conditions: [{
            property: (window.dataframeFields && window.dataframeFields.length > 0) 
              ? window.dataframeFields[0].name 
              : 'name',
            operator: 'contains',
            value: ''
          }]
        };
        
        this.log('Creating filter builder with options:', options);
        
        try {
          // If we have an external add button, connect it
          if (this.addFilterButton) {
            this.log('Connecting external add button', this.addFilterButton);
          }
          
          // Create the builder instance
          const builder = createFilterBuilder(options);
          this.log('Filter builder created successfully', builder);
          
          // Store the reference
          if (!window.filterState) {
            window.filterState = { activeBuilder: builder };
          } else {
            window.filterState.activeBuilder = builder;
          }
          
          this.filterState = window.filterState;
          this.log('Successfully created missing filter builder', builder);
          return true;
        } catch (error) {
          console.error('Failed to create filter builder:', error);
          return false;
        }
      } else {
        console.error('createFilterBuilder function not available');
        return false;
      }
    }
    
    return true; // Builder already exists
  },
  
  /**
   * Attach event handlers to filter controls
   */
  attachFilterHandlers() {
    // Show/Hide filters button
    if (this.showFiltersButton) {
      this.log('Attaching click handler to Show Filters button');
      this.showFiltersButton.addEventListener('click', () => this.toggleFilterPanel());
    }
    
    // Clear filter button
    if (this.clearFilterButton) {
      this.log('Attaching click handler to Clear Filter button');
      this.clearFilterButton.addEventListener('click', () => this.handleClearFilter());
    }
    
    // Apply filter button
    if (this.applyFilterButton) {
      this.log('Attaching click handler to Apply Filter button');
      this.applyFilterButton.addEventListener('click', () => this.handleApplyFilter());
    }
    
    // Save filter button
    if (this.saveFilterButton) {
      this.log('Attaching click handler to Save Filter button');
      this.saveFilterButton.addEventListener('click', () => this.handleSaveFilter());
    }
  },
  
  /**
   * Toggle filter panel visibility
   */
  toggleFilterPanel() {
    if (!this.filterPanel) return;
    
    const isVisible = this.filterPanel.style.display !== 'none';
    this.filterPanel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      this.log('Filter panel shown');
      // If showing the panel, ensure filter builder is initialized
      this.initFilterBuilder();
    } else {
      this.log('Filter panel hidden');
    }
  },
  
  /**
   * Handle clear filter button click
   */
  handleClearFilter() {
    this.log('Clear Filter button clicked');
    
    // Make sure we have our references
    if (!this.createFilterBuilderIfMissing()) return;
    
    try {
      // First hide any error message
      const errorElement = document.getElementById('filterError');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
      
      // Remove all conditions except one
      if (this.filterState && this.filterState.activeBuilder) {
        const builder = this.filterState.activeBuilder;
        
        // Clear all conditions and add a single empty one
        builder.clearConditions();
        
        // Add a default empty condition
        const fields = window.dataframeFields || [];
        const defaultProperty = fields.length > 0 ? fields[0].name : 'name';
        
        builder.addCondition({
          property: defaultProperty,
          operator: 'contains',
          value: ''
        });
        
        // Send message to extension
        this.sendRefreshMessage([]);
      }
    } catch (error) {
      console.error('Failed to clear filter:', error);
      this.showError('Failed to clear filter: ' + error.message);
    }
  },
  
  /**
   * Handle apply filter button click
   */
  handleApplyFilter() {
    this.log('Apply Filter button clicked');
    this.log('handleApplyFilter() called');
    
    // Make sure we have filter state
    if (!this.filterState) {
      this.log('Looking for filterState:', window.filterState);
      this.filterState = window.filterState;
      
      // If still no filter state, attempt to create it
      if (!this.filterState) {
        this.log('No filter state found, creating default state');
        window.filterState = {
          version: '1.3.0',
          activeBuilder: null,
          conditions: [],
          conjunction: 'and'
        };
        this.filterState = window.filterState;
      }
    }
    
    // Create filter builder if it doesn't exist
    if (!this.createFilterBuilderIfMissing()) {
      this.log('Error: Failed to create filter builder on demand');
      this.showError('Filter builder not initialized properly. Please refresh the page and try again.');
      return;
    }
    
    try {
      // Get the active builder
      const builder = this.filterState.activeBuilder;
      this.log('Active filter builder found:', builder);
      
      // Get conditions from the builder
      this.log('Getting conditions from builder:', builder);
      const conditions = builder.getConditions();
      this.log('Retrieved conditions:', conditions);
      
      // Get conjunction (AND/OR)
      const conjunction = builder.getConjunction();
      this.log('Retrieved conjunction:', conjunction);
      
      // Send message to extension
      const message = {
        command: 'refreshData',
        filterConditions: conditions,
        conjunction: conjunction
      };
      
      this.log('Sending message to extension:', message);
      this.sendMessageToExtension(message);
    } catch (error) {
      console.error('Failed to apply filter:', error);
      this.showError('Failed to apply filter: ' + error.message);
    }
  },
  
  /**
   * Handle save filter button click
   */
  handleSaveFilter() {
    this.log('Save Filter button clicked');
    
    // Make sure filter builder exists
    if (!this.createFilterBuilderIfMissing()) {
      this.showError('Filter builder not initialized properly.');
      return;
    }
    
    try {
      // Get the active builder
      const builder = this.filterState.activeBuilder;
      
      // Get conditions from the builder
      const conditions = builder.getConditions();
      
      // Get conjunction (AND/OR)
      const conjunction = builder.getConjunction();
      
      // Send message to extension
      const message = {
        command: 'saveFilter',
        filterConditions: conditions,
        conjunction: conjunction
      };
      
      this.sendMessageToExtension(message);
    } catch (error) {
      console.error('Failed to save filter:', error);
      this.showError('Failed to save filter: ' + error.message);
    }
  },
  
  /**
   * Send a refresh message to the extension
   */
  sendRefreshMessage(conditions, conjunction = 'and') {
    const message = {
      command: 'refreshData',
      filterConditions: conditions,
      conjunction: conjunction
    };
    
    this.sendMessageToExtension(message);
  },
  
  /**
   * Send a message to the VSCode extension
   */
  sendMessageToExtension(message) {
    // Check if vscode API is available
    if (window.vscode) {
      window.vscode.postMessage(message);
    } else {
      console.error('VSCode API not available');
    }
  },
  
  /**
   * Show an error message
   */
  showError(message) {
    // Try to find or create error element
    let errorElement = document.getElementById('filterError');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'filterError';
      errorElement.className = 'filter-error';
      
      // Insert after filter panel if it exists
      if (this.filterPanel && this.filterPanel.parentNode) {
        this.filterPanel.parentNode.insertBefore(errorElement, this.filterPanel.nextSibling);
      } else {
        // Otherwise try to add to the body
        document.body.appendChild(errorElement);
      }
    }
    
    // Set the error message
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
};

// When DOM is loaded, look for new filter elements to initialize
function checkForFilterElements() {
  FilterHandler.log('New filter elements detected, attaching handlers');
  FilterHandler.initialize();
  
  // Check window.filterState initialization to ensure proper sync
  if (!window.filterState) {
    FilterHandler.log('Initializing global filter state');
    window.filterState = {
      version: '1.3.0',
      activeBuilder: null,
      conditions: [],
      conjunction: 'and'
    };
    
    // Log for debugging
    FilterHandler.log('Filter state initialized with version ' + window.filterState.version);
    console.log('Object data:');
    console.log(window.filterState);
  }
  
  // Attempt an immediate initialization of the filter builder
  setTimeout(() => FilterHandler.initFilterBuilder(), 10);
  
  // Schedule verification that filter builder is properly initialized
  setTimeout(() => {
    if (!window.filterState?.activeBuilder) {
      FilterHandler.log('Filter builder not found, retrying initialization');
      FilterHandler.createFilterBuilderIfMissing();
    }
  }, 300);
}

// On document load
document.addEventListener('DOMContentLoaded', function() {
  // Wait a moment before initializing to ensure other scripts have loaded
  setTimeout(checkForFilterElements, 50);
});

// Export FilterHandler to global scope and initialize immediately if possible
window.FilterHandler = FilterHandler;

// If loading after DOM is ready, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  FilterHandler.log('Filter handler script loaded. Adding event listeners...');
  // Run the check on next tick to ensure scripts are fully loaded
  setTimeout(checkForFilterElements, 5);
}
