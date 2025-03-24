/**
 * Type definitions for DataFrame functionality in VS Code extension
 * Based on the original Obsidian plugin's DataFrame implementation
 */

/**
 * DataFrame is the core data structure that contains structured data for a
 * collection of notes.
 */
export type DataFrame = {
  /**
   * fields defines the schema for the data frame. Each field describes the
   * values in each DataRecord.
   */
  readonly fields: DataField[];

  /**
   * records holds the data from each note.
   */
  readonly records: DataRecord[];

  readonly errors?: RecordError[];
};

/**
 * DataField holds metadata for a value in DataRecord, for example a front
 * matter property.
 */
export type DataField = {
  /**
   * name references the a property (key) in the DataRecord values object.
   */
  readonly name: string;

  /**
   * type defines the data type for the field.
   */
  readonly type: string;

  /**
   * repeated defines whether the field can have multiple values.
   */
  readonly repeated: boolean;

  /**
   * identifier defines whether this field identifies a DataRecord.
   */
  readonly identifier: boolean;

  /**
   * derived defines whether this field has been derived from another field.
   *
   * Since derived fields are computed from other fields, they can't be
   * modified.
   */
  readonly derived: boolean;
};

export type DataRecord = {
  readonly id: string;
  readonly values: Record<string, any>;
};

/**
 * Error class for record processing issues
 */
export class RecordError extends Error {
  constructor(
    public readonly id: string,
    public readonly error: Error
  ) {
    super(`Error processing record ${id}: ${error.message}`);
    this.name = 'RecordError';
  }
}
