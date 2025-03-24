import { DataFrame } from './dataframe';

/**
 * Filter condition definition
 */
export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  conjunction: 'and' | 'or';
  conditions: FilterCondition[];
}

/**
 * Data Filter Engine for applying filters to DataFrame objects
 */
export class DataFilterEngine {
  /**
   * Apply filters to a DataFrame
   */
  public applyFilters(dataframe: DataFrame, filter: FilterConfig): DataFrame {
    if (!filter || !filter.conditions || filter.conditions.length === 0) {
      return dataframe; // No filters to apply
    }
    
    // Apply the filter conditions to the dataframe
    const filteredRecords = dataframe.records.filter(record => {
      return this.evaluateRecord(record, filter.conjunction, filter.conditions);
    });
    
    // Return a new dataframe with the filtered records
    return {
      ...dataframe,
      records: filteredRecords
    };
  }
  
  /**
   * Evaluate a record against a set of filter conditions
   */
  private evaluateRecord(record: any, conjunction: string, conditions: FilterCondition[]): boolean {
    if (conditions.length === 0) {
      return true;
    }
    
    // Apply the first condition
    let result = this.evaluateCondition(record, conditions[0]);
    
    // Apply additional conditions with the specified conjunction
    for (let i = 1; i < conditions.length; i++) {
      const conditionResult = this.evaluateCondition(record, conditions[i]);
      
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
   */
  private evaluateCondition(record: any, condition: FilterCondition): boolean {
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
        return this.evaluateStringCondition('', operator, value);
      }
    }
    
    // Handle different data types
    if (Array.isArray(fieldValue)) {
      return this.evaluateArrayCondition(fieldValue, operator, value);
    } else if (typeof fieldValue === 'boolean') {
      return this.evaluateBooleanCondition(fieldValue, operator, value);
    } else if (fieldValue instanceof Date) {
      return this.evaluateDateCondition(fieldValue, operator, value);
    } else if (typeof fieldValue === 'number') {
      return this.evaluateNumberCondition(fieldValue, operator, value);
    } else {
      // Default to string comparison
      return this.evaluateStringCondition(String(fieldValue), operator, value);
    }
  }
  
  /**
   * Evaluate a string-based condition
   */
  private evaluateStringCondition(fieldValue: string, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'isNotEmpty':
        return fieldValue !== '';
      case 'isEmpty':
        return fieldValue === '';
      case 'is':
        return fieldValue.toLowerCase() === String(conditionValue).toLowerCase();
      case 'isNot':
        return fieldValue.toLowerCase() !== String(conditionValue).toLowerCase();
      case 'contains':
        return fieldValue.toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'doesNotContain':
        return !fieldValue.toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'startsWith':
        return fieldValue.toLowerCase().startsWith(String(conditionValue).toLowerCase());
      case 'endsWith':
        return fieldValue.toLowerCase().endsWith(String(conditionValue).toLowerCase());
      default:
        return true; // Unknown operator
    }
  }
  
  /**
   * Evaluate a numeric condition
   */
  private evaluateNumberCondition(fieldValue: number, operator: string, conditionValue: any): boolean {
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
        return this.evaluateStringCondition(String(fieldValue), operator, conditionValue);
    }
  }
  
  /**
   * Evaluate a date-based condition
   */
  private evaluateDateCondition(fieldValue: Date, operator: string, conditionValue: any): boolean {
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
        return this.evaluateStringCondition(fieldValue.toISOString(), operator, conditionValue);
    }
  }
  
  /**
   * Evaluate a boolean condition
   */
  private evaluateBooleanCondition(fieldValue: boolean, operator: string, conditionValue: any): boolean {
    // Convert the condition value to a boolean
    const boolValue = typeof conditionValue === 'string' 
      ? conditionValue.toLowerCase() === 'true'
      : Boolean(conditionValue);
    
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
        return this.evaluateStringCondition(String(fieldValue), operator, conditionValue);
    }
  }
  
  /**
   * Evaluate an array-based condition
   */
  private evaluateArrayCondition(fieldValue: any[], operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'isNotEmpty':
        return fieldValue.length > 0;
      case 'isEmpty':
        return fieldValue.length === 0;
      case 'contains':
        return fieldValue.some(item => 
          String(item).toLowerCase().includes(String(conditionValue).toLowerCase())
        );
      case 'doesNotContain':
        return !fieldValue.some(item => 
          String(item).toLowerCase().includes(String(conditionValue).toLowerCase())
        );
      case 'is':
        return fieldValue.some(item => 
          String(item).toLowerCase() === String(conditionValue).toLowerCase()
        );
      case 'isNot':
        return !fieldValue.some(item => 
          String(item).toLowerCase() === String(conditionValue).toLowerCase()
        );
      default:
        // Default to checking if any array element matches
        return fieldValue.some(item => {
          if (typeof item === 'string') {
            return this.evaluateStringCondition(item, operator, conditionValue);
          } else if (typeof item === 'number') {
            return this.evaluateNumberCondition(item, operator, conditionValue);
          } else if (item instanceof Date) {
            return this.evaluateDateCondition(item, operator, conditionValue);
          } else if (typeof item === 'boolean') {
            return this.evaluateBooleanCondition(item, operator, conditionValue);
          } else {
            return this.evaluateStringCondition(String(item), operator, conditionValue);
          }
        });
    }
  }
}
