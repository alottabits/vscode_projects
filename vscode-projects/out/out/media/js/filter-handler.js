/**
 * Filter handler script for VSCode Projects extension
 * Handles the communication between filter UI components and the extension
 */

(function() {
    // Get vscode API
    const vscode = acquireVsCodeApi();
    
    // Store current filter state
    let currentFilters = {
        conjunction: 'and',
        conditions: []
    };
    
    // Initialize filter handlers when document is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeFilterHandlers();
    });
    
    /**
     * Initialize filter-related event handlers
     */
    function initializeFilterHandlers() {
        // Apply Filter button handler
        const applyFilterBtn = document.getElementById('applyFiltersBtn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', handleApplyFilter);
        }
        
        // Calendar filter application
        const calendarApplyFiltersBtn = document.getElementById('calendarApplyFiltersBtn');
        if (calendarApplyFiltersBtn) {
            calendarApplyFiltersBtn.addEventListener('click', handleCalendarApplyFilter);
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
        // Get filter conditions from the UI
        if (typeof filterBuilderComponent !== 'undefined' && filterBuilderComponent) {
            const conditions = filterBuilderComponent.getConditions();
            const conjunction = filterBuilderComponent.getConjunction();
            
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
        if (typeof filterBuilderComponent !== 'undefined' && filterBuilderComponent) {
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
