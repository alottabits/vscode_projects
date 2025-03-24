/**
 * Helper functions for applying filters in table views
 */

/**
 * Apply server-side filters to data before sending to clients
 * 
 * @param {Object} dataframe - The dataframe containing records and fields
 * @param {Object} filter - Filter configuration with conjunction and conditions
 * @returns {Object} - Filtered dataframe
 */
function applyFilters(dataframe, filter) {
    if (!filter || !filter.conditions || filter.conditions.length === 0) {
        return dataframe; // No filters to apply
    }
    
    // Apply the filter conditions to the dataframe
    const filteredRecords = dataframe.records.filter(record => {
        return evaluateRecord(record, filter.conjunction, filter.conditions);
    });
    
    // Return a new dataframe with the filtered records
    return {
        ...dataframe,
        records: filteredRecords
    };
}

/**
 * Evaluate a record against a set of filter conditions
 * 
 * @param {Object} record - The record to evaluate
 * @param {string} conjunction - How to join conditions ('and' or 'or')
 * @param {Array} conditions - Array of filter conditions 
 * @returns {boolean} - Whether the record matches the filter
 */
function evaluateRecord(record, conjunction, conditions) {
    if (conditions.length === 0) {
        return true;
    }
    
    // Apply the first condition
    let result = evaluateCondition(record, conditions[0]);
    
    // Apply additional conditions with the specified conjunction
    for (let i = 1; i < conditions.length; i++) {
        const conditionResult = evaluateCondition(record, conditions[i]);
        
        if (conjunction === 'and') {
            result = result && conditionResult;
        } else { // 'or'
            result = result || conditionResult;
        }
    }
    
    return result;
}

/**
 * Evaluate a single condition against a record
 * 
 * @param {Object} record - The record to evaluate
 * @param {Object} condition - Filter condition (field, operator, value)
 * @returns {boolean} - Whether the record matches the condition
 */
function evaluateCondition(record, condition) {
    const { field, operator, value } = condition;
    const fieldValue = record.values[field];
    
    // Handle null/undefined field values
    if (fieldValue === null || fieldValue === undefined) {
        if (operator === 'isEmpty') {
            return true;
        } else if (operator === 'isNotEmpty') {
            return false;
        } else {
            // For other operators, null/undefined is treated as empty string
            return evaluateStringCondition('', operator, value);
        }
    }
    
    // Handle different data types
    if (Array.isArray(fieldValue)) {
        return evaluateArrayCondition(fieldValue, operator, value);
    } else if (typeof fieldValue === 'boolean') {
        return evaluateBooleanCondition(fieldValue, operator, value);
    } else if (fieldValue instanceof Date) {
        return evaluateDateCondition(fieldValue, operator, value);
    } else if (typeof fieldValue === 'number') {
        return evaluateNumberCondition(fieldValue, operator, value);
    } else {
        // Default to string comparison
        return evaluateStringCondition(String(fieldValue), operator, value);
    }
}

/**
 * Evaluate a string-based condition
 */
function evaluateStringCondition(fieldValue, operator, conditionValue) {
    switch (operator) {
        case 'isNotEmpty':
            return fieldValue !== '';
        case 'isEmpty':
            return fieldValue === '';
        case 'is':
            return fieldValue.toLowerCase() === conditionValue.toLowerCase();
        case 'isNot':
            return fieldValue.toLowerCase() !== conditionValue.toLowerCase();
        case 'contains':
            return fieldValue.toLowerCase().includes(conditionValue.toLowerCase());
        case 'doesNotContain':
            return !fieldValue.toLowerCase().includes(conditionValue.toLowerCase());
        case 'startsWith':
            return fieldValue.toLowerCase().startsWith(conditionValue.toLowerCase());
        case 'endsWith':
            return fieldValue.toLowerCase().endsWith(conditionValue.toLowerCase());
        default:
            return true; // Unknown operator
    }
}

/**
 * Evaluate a numeric condition
 */
function evaluateNumberCondition(fieldValue, operator, conditionValue) {
    // Parse the condition value as a number
    const numValue = parseFloat(conditionValue);
    
    if (isNaN(numValue) && operator !== 'isNotEmpty' && operator !== 'isEmpty') {
        return false; // Invalid number comparison
    }
    
    switch (operator) {
        case 'isNotEmpty':
            return true; // Numbers are never empty
        case 'isEmpty':
            return false; // Numbers are never empty
        case 'is':
            return fieldValue === numValue;
        case 'isNot':
            return fieldValue !== numValue;
        case 'greaterThan':
            return fieldValue > numValue;
        case 'lessThan':
            return fieldValue < numValue;
        case 'greaterThanOrEqual':
            return fieldValue >= numValue;
        case 'lessThanOrEqual':
            return fieldValue <= numValue;
        default:
            // Fall back to string comparison for other operators
            return evaluateStringCondition(String(fieldValue), operator, conditionValue);
    }
}

/**
 * Evaluate a date-based condition
 */
function evaluateDateCondition(fieldValue, operator, conditionValue) {
    // Parse the condition value as a date
    const dateValue = new Date(conditionValue);
    
    if (isNaN(dateValue.getTime()) && operator !== 'isNotEmpty' && operator !== 'isEmpty') {
        return false; // Invalid date comparison
    }
    
    switch (operator) {
        case 'isNotEmpty':
            return true; // Dates are never empty
        case 'isEmpty':
            return false; // Dates are never empty
        case 'is':
            return fieldValue.getTime() === dateValue.getTime();
        case 'isNot':
            return fieldValue.getTime() !== dateValue.getTime();
        case 'after':
        case 'greaterThan':
            return fieldValue.getTime() > dateValue.getTime();
        case 'before':
        case 'lessThan':
            return fieldValue.getTime() < dateValue.getTime();
        case 'onOrAfter':
        case 'greaterThanOrEqual':
            return fieldValue.getTime() >= dateValue.getTime();
        case 'onOrBefore':
        case 'lessThanOrEqual':
            return fieldValue.getTime() <= dateValue.getTime();
        default:
            // Fall back to string comparison for other operators
            return evaluateStringCondition(fieldValue.toISOString(), operator, conditionValue);
    }
}

/**
 * Evaluate a boolean condition
 */
function evaluateBooleanCondition(fieldValue, operator, conditionValue) {
    const boolValue = /^true$/i.test(conditionValue);
    
    switch (operator) {
        case 'isNotEmpty':
            return true; // Booleans are never empty
        case 'isEmpty':
            return false; // Booleans are never empty
        case 'is':
            return fieldValue === boolValue;
        case 'isNot':
            return fieldValue !== boolValue;
        default:
            // Fall back to string comparison for other operators
            return evaluateStringCondition(String(fieldValue), operator, conditionValue);
    }
}

/**
 * Evaluate an array-based condition
 */
function evaluateArrayCondition(fieldValue, operator, conditionValue) {
    switch (operator) {
        case 'isNotEmpty':
            return fieldValue.length > 0;
        case 'isEmpty':
            return fieldValue.length === 0;
        case 'contains':
            return fieldValue.some(item => 
                String(item).toLowerCase().includes(conditionValue.toLowerCase())
            );
        case 'doesNotContain':
            return !fieldValue.some(item => 
                String(item).toLowerCase().includes(conditionValue.toLowerCase())
            );
        case 'is':
            return fieldValue.some(item => 
                String(item).toLowerCase() === conditionValue.toLowerCase()
            );
        case 'isNot':
            return !fieldValue.some(item => 
                String(item).toLowerCase() === conditionValue.toLowerCase()
            );
        default:
            // Default to checking if any array element matches
            return fieldValue.some(item => {
                if (typeof item === 'string') {
                    return evaluateStringCondition(item, operator, conditionValue);
                } else if (typeof item === 'number') {
                    return evaluateNumberCondition(item, operator, conditionValue);
                } else if (item instanceof Date) {
                    return evaluateDateCondition(item, operator, conditionValue);
                } else if (typeof item === 'boolean') {
                    return evaluateBooleanCondition(item, operator, conditionValue);
                } else {
                    return evaluateStringCondition(String(item), operator, conditionValue);
                }
            });
    }
}

// Export the filter functions
module.exports = {
    applyFilters,
    evaluateRecord,
    evaluateCondition
};
