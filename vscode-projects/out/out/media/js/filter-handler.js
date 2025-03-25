/**
 * Filter handler script for VSCode Projects extension
 * Handles the communication between filter UI components and the extension
 */

// Debug logging function
function debugLog(message, obj) {
    console.log(`[FilterHandler] ${message}`, obj);
    
    // Try to log to an element in the DOM if it exists
    try {
        var logPanel = document.getElementById('logPanel');
        if (logPanel) {
            var logEntry = document.createElement('div');
            logEntry.className = 'log-entry info';
            logEntry.textContent = `[FilterHandler] ${message}`;
            logPanel.appendChild(logEntry);
            logPanel.scrollTop = logPanel.scrollHeight;
        }
    } catch (e) {
        // Silently fail if DOM manipulation fails
    }
}

// Ensure the filter state object is created
window.filterState = window.filterState || {
    builders: {}, // Filter builder instances
    activeBuilder: null, // Currently active builder
    conditions: [], // Current filter conditions
    conjunction: 'and', // AND/OR conjunction
    version: '1.0.0', // Version to track script loaded
    loadTime: new Date().toISOString() // When script was loaded
};

// This script expects the VS Code API to be provided globally as 'vscode'
(function() {
    // Use the globally provided VS Code API instead of acquiring it again
    const vscode = window.vscode || acquireVsCodeApi();
    
    // Make the VS Code API available globally
    window.vscode = vscode;
    
    // Store current filter state
    let currentFilters = {
        conjunction: 'and',
        conditions: []
    };
    
    debugLog('Filter handler script loaded. Adding event listeners...');
    
    // Initialize filter handlers when document is loaded or immediately if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFilterHandlers);
    } else {
        // DOM is already loaded, call the function directly
        initializeFilterHandlers();
    }
    
    // Also set up a delayed initialization as a backup
    setTimeout(function() {
        debugLog('Running delayed initialization check');
        if (!window.filterState.activeBuilder) {
            debugLog('Filter builder not found in delayed check, trying to initialize again');
            initializeFilterHandlers();
        }
    }, 1000); // 1 second delay as backup
    
    // Also add a mutation observer to handle dynamically added elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if our buttons have been added
                const applyBtn = document.getElementById('applyFiltersBtn');
                const calendarApplyBtn = document.getElementById('calendarApplyFiltersBtn');
                
                if ((applyBtn && !applyBtn.hasAttribute('data-handler-attached')) || 
                    (calendarApplyBtn && !calendarApplyBtn.hasAttribute('data-handler-attached'))) {
                    debugLog('New filter elements detected, attaching handlers');
                    initializeFilterHandlers();
                }
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    /**
     * Initialize filter-related event handlers
     */
    function initializeFilterHandlers() {
        debugLog('Initializing filter handlers');
        
        // Apply Filter button handler
        const applyFilterBtn = document.getElementById('applyFiltersBtn');
        if (applyFilterBtn && !applyFilterBtn.hasAttribute('data-handler-attached')) {
            debugLog('Attaching click handler to Apply Filter button');
            
            // Remove existing handlers by cloning the button
            const newApplyBtn = applyFilterBtn.cloneNode(true);
            applyFilterBtn.parentNode.replaceChild(newApplyBtn, applyFilterBtn);
            
            // Add new handler and mark as attached
            newApplyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                debugLog('Apply Filter button clicked');
                handleApplyFilter();
            });
            newApplyBtn.setAttribute('data-handler-attached', 'true');
        }
        
        // Calendar filter application
        const calendarApplyFiltersBtn = document.getElementById('calendarApplyFiltersBtn');
        if (calendarApplyFiltersBtn && !calendarApplyFiltersBtn.hasAttribute('data-handler-attached')) {
            debugLog('Attaching click handler to Calendar Apply Filter button');
            
            // Remove existing handlers by cloning the button
            const newCalendarBtn = calendarApplyFiltersBtn.cloneNode(true);
            calendarApplyFiltersBtn.parentNode.replaceChild(newCalendarBtn, calendarApplyFiltersBtn);
            
            // Add new handler and mark as attached
            newCalendarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                debugLog('Calendar Apply Filter button clicked');
                handleCalendarApplyFilter();
            });
            newCalendarBtn.setAttribute('data-handler-attached', 'true');
        }
        
        // Save Filter button
        const saveFilterBtn = document.getElementById('saveFilterBtn');
        if (saveFilterBtn && !saveFilterBtn.hasAttribute('data-handler-attached')) {
            debugLog('Attaching click handler to Save Filter button');
            
            // Remove existing handlers by cloning the button
            const newSaveBtn = saveFilterBtn.cloneNode(true);
            saveFilterBtn.parentNode.replaceChild(newSaveBtn, saveFilterBtn);
            
            // Add new handler and mark as attached
            newSaveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                debugLog('Save Filter button clicked');
                
                // Get filter conditions from the UI
                const conditions = window.filterState.activeBuilder ? 
                    window.filterState.activeBuilder.getConditions() : [];
                const conjunction = window.filterState.activeBuilder ? 
                    window.filterState.activeBuilder.getConjunction() : 'and';
                
                // Update current filters
                currentFilters = {
                    conjunction: conjunction,
                    conditions: conditions
                };
                
                // Store filter state
                vscode.setState({ filters: currentFilters });
                
                // Send save command to extension
                vscode.postMessage({
                    command: 'saveFilter',
                    filterConditions: conditions,
                    conjunction: conjunction
                });
                
                debugLog('Filter saved', conditions);
            });
            newSaveBtn.setAttribute('data-handler-attached', 'true');
        }
        
        // Clear Filters button
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn && !clearFilterBtn.hasAttribute('data-handler-attached')) {
            debugLog('Attaching click handler to Clear Filter button');
            
            // Remove existing handlers by cloning the button
            const newClearBtn = clearFilterBtn.cloneNode(true);
            clearFilterBtn.parentNode.replaceChild(newClearBtn, clearFilterBtn);
            
            // Add new handler and mark as attached
            newClearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                debugLog('Clear Filter button clicked');
                clearFilters();
            });
            newClearBtn.setAttribute('data-handler-attached', 'true');
        }
        
        // Show filter panel toggle
        const showFiltersBtn = document.getElementById('showFiltersBtn');
        if (showFiltersBtn && !showFiltersBtn.hasAttribute('data-handler-attached')) {
            const filterPanel = document.getElementById('filterPanel');
            
            if (showFiltersBtn && filterPanel) {
                debugLog('Attaching click handler to Show Filters button');
                
                // Remove existing handlers by cloning the button
                const newShowBtn = showFiltersBtn.cloneNode(true);
                showFiltersBtn.parentNode.replaceChild(newShowBtn, showFiltersBtn);
                
                // Add new handler and mark as attached
                newShowBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isVisible = filterPanel.style.display !== 'none';
                    filterPanel.style.display = isVisible ? 'none' : 'block';
                    debugLog(`Filter panel ${isVisible ? 'hidden' : 'shown'}`);
                });
                newShowBtn.setAttribute('data-handler-attached', 'true');
            }
        }
        
        // Apply existing filter state if available
        applyStoredFilterState();
    }
    
    /**
     * Apply any stored filter state from VSCode storage
     */
    function applyStoredFilterState() {
        // Get the stored filter state if any
        const storedState = vscode.getState();
        if (storedState && storedState.filters) {
            currentFilters = storedState.filters;
            
            // If we have a FilterBuilder instance, load the conditions
            if (typeof filterBuilderComponent !== 'undefined' && filterBuilderComponent) {
                filterBuilderComponent.loadConditions(currentFilters.conditions);
            }
        }
    }
    
    /**
     * Handle Apply Filter button click
     */
    function handleApplyFilter() {
        debugLog('handleApplyFilter() called');

        // Check if we can access filterState
        if (window.filterState) {
            debugLog('filterState found:', window.filterState);
        } else {
            debugLog('WARNING: filterState not found in window object!');
            // Initialize filter state if it doesn't exist
            window.filterState = {
                builders: {},
                activeBuilder: null,
                conditions: [],
                conjunction: 'and',
                version: '1.0.0',
                loadTime: new Date().toISOString()
            };
        }

        // Try to initialize the filter builder if it's missing
        if (!window.filterState.activeBuilder && typeof createFilterBuilder === 'function') {
            debugLog('Attempting to create missing filter builder');
            try {
                const filterBuilder = document.getElementById('filterBuilder');
                if (filterBuilder) {
                    // Get fields from any visible fields on the page
                    const fields = [];
                    
                    // Try to find fields in various ways
                    try {
                        // First try to get fields from a data attribute
                        const fieldsData = document.querySelector('[data-fields]');
                        if (fieldsData && fieldsData.dataset.fields) {
                            fields.push(...JSON.parse(fieldsData.dataset.fields));
                        }
                        // Then check if fields are defined in a script variable
                        else if (window.dataframeFields) {
                            fields.push(...window.dataframeFields);
                        }
                        // If no fields found, add comprehensive defaults
                        else {
                            fields.push(
                                { name: 'name', type: 'string' },
                                { name: 'status', type: 'string' },
                                { name: 'priority', type: 'number' },
                                { name: 'creation_date', type: 'date' },
                                { name: 'modification_date', type: 'date' },
                                { name: 'Due', type: 'date' },
                                { name: 'tags', type: 'array' },
                                { name: 'Completed', type: 'boolean' }
                            );
                        }
                    } catch (e) {
                        debugLog('Error getting fields:', e);
                        // Add comprehensive default fields
                        fields.push(
                            { name: 'name', type: 'string' },
                            { name: 'status', type: 'string' },
                            { name: 'priority', type: 'number' },
                            { name: 'creation_date', type: 'date' },
                            { name: 'modification_date', type: 'date' },
                            { name: 'Due', type: 'date' },
                            { name: 'tags', type: 'array' },
                            { name: 'Completed', type: 'boolean' }
                        );
                    }
                    
                    // Create a new filter builder
                    const addFilterBtn = document.getElementById('addFilterBtn');
                    window.filterState.activeBuilder = createFilterBuilder({
                        container: filterBuilder,
                        fields: fields,
                        addButton: addFilterBtn,
                        conditions: [],
                        conjunction: 'and'
                    });
                    
                    debugLog('Successfully created missing filter builder', window.filterState.activeBuilder);
                }
            } catch (e) {
                debugLog('Error creating filter builder:', e);
            }
        }

        // Check if we can access the active builder
        const activeBuilder = window.filterState && window.filterState.activeBuilder;
        if (activeBuilder) {
            debugLog('Active filter builder found:', activeBuilder);
        } else {
            debugLog('WARNING: Active filter builder not found!');
            // Fallback to classic component if available
            if (typeof filterBuilderComponent !== 'undefined' && filterBuilderComponent) {
                debugLog('Using legacy filterBuilderComponent instead');
            } else {
                debugLog('ERROR: No filter builder available! Cannot apply filters.');
                // Create a visual error notification
                try {
                    const filterPanel = document.getElementById('filterPanel');
                    if (filterPanel) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'filter-error';
                        errorMsg.textContent = 'Error: Filter builder not initialized properly.';
                        errorMsg.style.color = 'red';
                        errorMsg.style.padding = '8px';
                        errorMsg.style.margin = '8px 0';
                        errorMsg.style.border = '1px solid red';
                        filterPanel.prepend(errorMsg);
                        
                        // Auto-remove after 5 seconds
                        setTimeout(() => {
                            if (errorMsg.parentNode) {
                                errorMsg.parentNode.removeChild(errorMsg);
                            }
                        }, 5000);
                    }
                } catch (e) {
                    // Ignore DOM errors
                }
                return;
            }
        }
        
        // Get filter conditions from the UI
        const builder = activeBuilder || filterBuilderComponent;
        if (builder) {
            debugLog('Getting conditions from builder:', builder);
            
            const conditions = builder.getConditions();
            const conjunction = builder.getConjunction();
            
            debugLog('Retrieved conditions:', conditions);
            debugLog('Retrieved conjunction:', conjunction);
            
            // Update current filters
            currentFilters = {
                conjunction: conjunction,
                conditions: conditions
            };
            
            // Store filter state
            vscode.setState({ filters: currentFilters });
            
            // Send filter command to extension
            const message = {
                command: 'refreshData',
                filterConditions: conditions,
                conjunction: conjunction
            };
            
            debugLog('Sending message to extension:', message);
            vscode.postMessage(message);
            
            // Visual confirmation
            try {
                const applyBtn = document.getElementById('applyFiltersBtn');
                if (applyBtn) {
                    const originalText = applyBtn.textContent;
                    applyBtn.textContent = '✓ Applied';
                    applyBtn.style.backgroundColor = '#4CAF50';
                    
                    setTimeout(() => {
                        applyBtn.textContent = originalText;
                        applyBtn.style.backgroundColor = '';
                    }, 2000);
                }
            } catch (e) {
                // Ignore DOM errors
            }
        }
    }
    
    /**
     * Handle Calendar Apply Filter button click
     */
    function handleCalendarApplyFilter() {
        // Get filter conditions from the calendar filter UI
        const calendarFilterBuilder = document.getElementById('calendarFilterBuilder');
        
        if (calendarFilterBuilder) {
            const conditions = [];
            
            // Collect filter conditions from UI
            calendarFilterBuilder.querySelectorAll('.filter-condition').forEach((conditionEl, index) => {
                const propertySelect = conditionEl.querySelector('.filter-property');
                const operatorSelect = conditionEl.querySelector('.filter-operator');
                const valueInput = conditionEl.querySelector('.filter-value');
                const joinSelect = conditionEl.querySelector('.filter-join');
                
                if (propertySelect && propertySelect.value) {
                    const property = propertySelect.value;
                    const operator = operatorSelect ? operatorSelect.value : 'contains';
                    const value = valueInput ? valueInput.value : '';
                    
                    // Get the logical join (AND/OR) if not the first condition
                    const join = index > 0 && joinSelect ? joinSelect.value : null;
                    
                    // Always include isEmpty/isNotEmpty operators even without value
                    if (value || operator === 'isEmpty' || operator === 'isNotEmpty') {
                        conditions.push({
                            field: property,
                            operator: operator,
                            value: value,
                            join: join
                        });
                    }
                }
            });
            
            // Determine the conjunction type
            const joinSelects = Array.from(calendarFilterBuilder.querySelectorAll('.filter-join'));
            const conjunction = joinSelects.length > 0 && joinSelects.every(join => join.value === 'or') ? 'or' : 'and';
            
            // Update current filters
            currentFilters = {
                conjunction: conjunction,
                conditions: conditions
            };
            
            // Store filter state
            vscode.setState({ filters: currentFilters });
            
            // Send filter command to extension
            vscode.postMessage({
                command: 'refreshData',
                filterConditions: conditions,
                conjunction: conjunction
            });
        }
    }
    
    /**
     * Clear all filter conditions
     */
    function clearFilters() {
        // Clear UI filter builder if it exists
        if (window.filterState && window.filterState.activeBuilder) {
            window.filterState.activeBuilder.clear();
        }
        else if (typeof filterBuilderComponent !== 'undefined' && filterBuilderComponent) {
            filterBuilderComponent.clear();
        }
        
        // Reset current filters
        currentFilters = {
            conjunction: 'and',
            conditions: []
        };
        
        // Store filter state
        vscode.setState({ filters: currentFilters });
        
        // Send filter command to extension with empty conditions
        vscode.postMessage({
            command: 'refreshData',
            filterConditions: [],
            conjunction: 'and'
        });
    }
    
    // Make functions available to the global scope
    window.projectsFilter = {
        applyFilter: handleApplyFilter,
        applyCalendarFilter: handleCalendarApplyFilter,
        clearFilters: clearFilters
    };
})();
