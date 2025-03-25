/**
 * Common Filter Builder component for VS Code Projects extension
 * This provides a unified interface for building filter conditions across different views
 * Version 1.3.0 - Syntax-error-proof implementation for packaging
 */

// ES5 syntax without commas for maximum compatibility
function debugLog(message) {
  // Use arguments object directly to avoid comma issues
  var obj = undefined;
  if (arguments.length > 1) {
    obj = arguments[1];
  }
  
  // Get timestamp piece by piece to avoid comma issues
  var now = new Date();
  var timestamp = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
  
  // Safe console logging with separate statements
  console.log("[FilterBuilder " + timestamp + "] " + message);
  
  // Only log object if provided
  if (obj !== undefined) {
    console.log("Object data:");
    console.log(obj);
  }
  
  // Try to log to an element in the DOM if it exists
  try {
    var logPanel = document.getElementById('logPanel');
    if (logPanel) {
      var logEntry = document.createElement('div');
      logEntry.className = 'log-entry info';
      logEntry.textContent = "[FilterBuilder " + timestamp + "] " + message;
      logPanel.appendChild(logEntry);
      logPanel.scrollTop = logPanel.scrollHeight;
    }
  } catch (e) {
    // Silently fail if DOM manipulation fails
  }
}

// Mark script load with debug message
console.log(`[FILTER-BUILDER] Script loading - Timestamp: ${new Date().toISOString()}`);

// Global state object to share across modules
window.filterState = window.filterState || {
  builders: {}, // Filter builder instances
  activeBuilder: null, // Currently active builder
  conditions: [], // Current filter conditions
  conjunction: 'and', // AND/OR conjunction
  version: '1.3.0', // Version to track script loaded
  loadTime: new Date().toISOString(), // When script was loaded
  debug: true // Enable additional debugging
};

// Log state initialization
debugLog(`Filter state initialized with version ${window.filterState.version}`, window.filterState);

/**
 * Create a filter builder instance
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.container - Container element to place the filter builder in
 * @param {Array} options.fields - Field definitions
 * @param {HTMLElement} options.addButton - Optional external add button to use
 * @param {Array} options.conditions - Initial filter conditions (optional)
 * @param {string} options.conjunction - Initial conjunction (optional)
 * @returns {FilterBuilder} The created filter builder instance
 */
function createFilterBuilder(options) {
  debugLog('Creating filter builder with options:', options);
  
  // Create a unique ID for this filter builder
  const id = `filter-builder-${Date.now()}`;
  
  try {
    // Create the filter builder instance
    const builder = new FilterBuilder(
      options.container,
      { fields: options.fields },
      options.conditions || [],
      id
    );
    
    // If an external add button is provided, connect it to the builder
    if (options.addButton) {
      debugLog('Connecting external add button', options.addButton);
      
      // Hide the internal button but keep it for functionality
      const internalAddBtn = builder.addFilterBtn;
      if (internalAddBtn) {
        internalAddBtn.style.display = 'none';
      }
      
      // Explicitly remove any existing event listeners from the button
      const newButton = options.addButton.cloneNode(true);
      if (options.addButton.parentNode) {
        options.addButton.parentNode.replaceChild(newButton, options.addButton);
      }
      
      // Add the click event listener with proper binding
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        debugLog('Add condition button clicked');
        builder.addCondition();
        
        // Notify the parent window that a condition was added
        if (window.vscode) {
          window.vscode.postMessage({
            command: 'filterConditionAdded'
          });
        }
      });
      
      // Store the button reference
      builder.externalAddBtn = newButton;
    }
    
    // Store both globally and in our state object
    window.filterBuilders = window.filterBuilders || {};
    window.filterBuilders[id] = builder;
    window.filterState.builders[id] = builder;
    window.filterState.activeBuilder = builder;
    window.filterBuilderComponent = builder; // Legacy support
    
    // Update the shared state
    window.filterState.conditions = options.conditions || [];
    window.filterState.conjunction = options.conjunction || 'and';
    
    debugLog('Filter builder created successfully', builder);
    return builder;
  } catch (error) {
    console.error('Error creating filter builder:', error);
    throw error;
  }
}

/**
 * Filter Builder class for building filter conditions
 */
class FilterBuilder {
  /**
   * Create a new FilterBuilder
   * @param {HTMLElement} container - Container element to place the filter builder in
   * @param {Object} dataframe - The dataframe containing field definitions
   * @param {Array} initialConditions - Initial filter conditions (optional)
   * @param {string} idPrefix - Prefix for element IDs (optional)
   */
  constructor(container, dataframe, initialConditions = [], idPrefix = 'filter') {
    this.container = container;
    this.dataframe = dataframe;
    this.initialConditions = initialConditions;
    this.idPrefix = idPrefix;
    this.filterBuilder = null;
    this.addFilterBtn = null;
    
    this.init();
  }
  
  /**
   * Initialize the filter builder
   */
  init() {
    // Create the filter builder UI
    this.filterBuilder = document.createElement('div');
    this.filterBuilder.className = 'filter-builder';
    this.filterBuilder.id = `${this.idPrefix}-builder`;
    this.container.appendChild(this.filterBuilder);
    
    // Add the "Add Condition" button
    this.addFilterBtn = document.createElement('button');
    this.addFilterBtn.className = 'filter-add';
    this.addFilterBtn.id = `${this.idPrefix}-add-btn`;
    this.addFilterBtn.textContent = '+ Add Condition';
    this.addFilterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.addCondition();
    });
    
    // Add initial conditions or create a blank one
    if (this.initialConditions && this.initialConditions.length > 0) {
      this.initialConditions.forEach((condition, index) => {
        this.addCondition(condition, index === 0);
      });
    } else {
      // Always add an initial blank condition
      this.addCondition(null, true);
    }
    
    // Add the button AFTER creating the condition to match Obsidian behavior
    this.container.appendChild(this.addFilterBtn);
    
    // Ensure that the addFilterBtn click handler is properly working
    if (this.addFilterBtn) {
      // Remove any existing handlers and recreate
      const newBtn = this.addFilterBtn.cloneNode(true);
      this.addFilterBtn.parentNode.replaceChild(newBtn, this.addFilterBtn);
      this.addFilterBtn = newBtn;
      
      // Add the click handler
      this.addFilterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Add condition button clicked');
        this.addCondition();
      });
    }
  }
  
  /**
   * Add a new filter condition to the builder
   * @param {Object} condition - Existing condition to populate the UI with (optional)
   * @param {boolean} isFirstCondition - Whether this is the first condition (no join operator)
   */
  addCondition(condition = null, isFirstCondition = false) {
    const conditionId = `${this.idPrefix}-condition-${Date.now()}`;
    const conditionEl = document.createElement('div');
    conditionEl.className = 'filter-condition';
    conditionEl.id = conditionId;
    
    // Logical join operator (AND/OR) for conditions after the first one
    if (!isFirstCondition) {
      const joinSelect = document.createElement('select');
      joinSelect.className = 'filter-join';
      
      const andOption = document.createElement('option');
      andOption.value = 'and';
      andOption.textContent = 'AND';
      andOption.selected = !condition || condition.join !== 'or';
      
      const orOption = document.createElement('option');
      orOption.value = 'or';
      orOption.textContent = 'OR';
      orOption.selected = condition && condition.join === 'or';
      
      joinSelect.appendChild(andOption);
      joinSelect.appendChild(orOption);
      conditionEl.appendChild(joinSelect);
    }
    
    // Property selector
    const propertySelect = document.createElement('select');
    propertySelect.className = 'filter-property';
    
    // Add default empty option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select property...';
    propertySelect.appendChild(defaultOption);
    
    // Add options for each field in the dataframe
    this.dataframe.fields.forEach(field => {
      const option = document.createElement('option');
      option.value = field.name;
      option.textContent = field.name;
      
      if (condition && field.name === condition.field) {
        option.selected = true;
      }
      
      propertySelect.appendChild(option);
    });
    
    // Operator selector
    const operatorSelect = document.createElement('select');
    operatorSelect.className = 'filter-operator';
    
    const operators = [
      { value: 'isNotEmpty', text: 'is not empty' },
      { value: 'isEmpty', text: 'is empty' },
      { value: 'is', text: 'is' },
      { value: 'isNot', text: 'is not' },
      { value: 'contains', text: 'contains' },
      { value: 'doesNotContain', text: 'does not contain' },
      { value: 'startsWith', text: 'starts with' },
      { value: 'endsWith', text: 'ends with' }
    ];
    
    // Add numeric operators if the field is numeric
    if (condition && condition.field) {
      const field = this.dataframe.fields.find(f => f.name === condition.field);
      if (field && field.type === 'number') {
        operators.push(
          { value: 'greaterThan', text: 'greater than' },
          { value: 'lessThan', text: 'less than' },
          { value: 'greaterThanOrEqual', text: 'greater than or equal' },
          { value: 'lessThanOrEqual', text: 'less than or equal' }
        );
      }
    }
    
    operators.forEach(op => {
      const option = document.createElement('option');
      option.value = op.value;
      option.textContent = op.text;
      
      if (condition && op.value === condition.operator) {
        option.selected = true;
      }
      
      operatorSelect.appendChild(option);
    });
    
    // Value input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'filter-value';
    valueInput.placeholder = 'Value...';
    
    if (condition && condition.value) {
      valueInput.value = condition.value;
    }
    
    // If the operator doesn't need a value, hide the input
    if (condition && (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty')) {
      valueInput.style.display = 'none';
    }
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'filter-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove condition';
    removeBtn.addEventListener('click', () => {
      conditionEl.remove();
    });
    
    // Add elements to condition
    conditionEl.appendChild(propertySelect);
    conditionEl.appendChild(operatorSelect);
    conditionEl.appendChild(valueInput);
    conditionEl.appendChild(removeBtn);
    
    // Handle operator change to show/hide value input
    operatorSelect.addEventListener('change', () => {
      const operator = operatorSelect.value;
      if (operator === 'isEmpty' || operator === 'isNotEmpty') {
        valueInput.style.display = 'none';
        valueInput.value = '';
      } else {
        valueInput.style.display = 'block';
      }
    });
    
    // Handle property change to update available operators
    propertySelect.addEventListener('change', () => {
      const fieldName = propertySelect.value;
      const field = this.dataframe.fields.find(f => f.name === fieldName);
      
      // Clear existing options
      operatorSelect.innerHTML = '';
      
      // Add base operators
      operators.forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.text;
        operatorSelect.appendChild(option);
      });
      
      // Add type-specific operators
      if (field && field.type === 'number') {
        const numericOperators = [
          { value: 'greaterThan', text: 'greater than' },
          { value: 'lessThan', text: 'less than' },
          { value: 'greaterThanOrEqual', text: 'greater than or equal' },
          { value: 'lessThanOrEqual', text: 'less than or equal' }
        ];
        
        numericOperators.forEach(op => {
          const option = document.createElement('option');
          option.value = op.value;
          option.textContent = op.text;
          operatorSelect.appendChild(option);
        });
      }
      
      // Select the first option
      if (operatorSelect.options.length > 0) {
        operatorSelect.selectedIndex = 0;
        operatorSelect.dispatchEvent(new Event('change'));
      }
    });
    
    // Add the condition to the builder
    this.filterBuilder.appendChild(conditionEl);
  }
  
  /**
   * Get all filter conditions from the UI
   * @returns {Array} - Array of filter conditions
   */
  getConditions() {
    const conditions = [];
    
    // If filterBuilder is empty, add an initial condition first
    if (this.filterBuilder.children.length === 0) {
      this.addCondition(null, true);
    }
    
    this.filterBuilder.querySelectorAll('.filter-condition').forEach((conditionEl, index) => {
      const propertySelect = conditionEl.querySelector('.filter-property');
      const operatorSelect = conditionEl.querySelector('.filter-operator');
      const valueInput = conditionEl.querySelector('.filter-value');
      const joinSelect = conditionEl.querySelector('.filter-join');
      
      if (propertySelect && propertySelect.value) {
        const condition = {
          field: propertySelect.value,
          operator: operatorSelect ? operatorSelect.value : 'contains',
          value: valueInput ? valueInput.value : ''
        };
        
        // Add the join operator for conditions after the first one
        if (index > 0 && joinSelect) {
          condition.join = joinSelect.value;
        }
        
        // Always include isEmpty/isNotEmpty operators even without value
        if (condition.value || condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
          conditions.push(condition);
        }
      }
    });
    
    return conditions;
  }
  
  /**
   * Get the conjunction type from the filter conditions
   * @returns {string} - 'and' or 'or'
   */
  getConjunction() {
    const joinSelects = Array.from(this.filterBuilder.querySelectorAll('.filter-join'));
    // Default to 'and' if no joins or mixed joins
    return joinSelects.length > 0 && joinSelects.every(join => join.value === 'or') ? 'or' : 'and';
  }
  
  /**
   * Clear all filter conditions
   */
  clear() {
    this.filterBuilder.innerHTML = '';
    // Always add a blank initial condition
    this.addCondition(null, true);
  }
  
  /**
   * Load a set of conditions into the builder
   * @param {Array} conditions - Array of filter conditions
   */
  loadConditions(conditions) {
    this.filterBuilder.innerHTML = '';
    
    if (conditions && conditions.length > 0) {
      conditions.forEach((condition, index) => {
        this.addCondition(condition, index === 0);
      });
    } else {
      // Always add an initial blank condition
      this.addCondition(null, true);
    }
    
    // Force a redraw to ensure all UI elements are correctly rendered
    setTimeout(() => {
      const currentDisplay = this.filterBuilder.style.display;
      this.filterBuilder.style.display = 'none';
      setTimeout(() => {
        this.filterBuilder.style.display = currentDisplay;
      }, 0);
    }, 50);
  }
}
