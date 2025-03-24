/**
 * Type definitions for Settings functionality in VS Code extension
 * Based on the original Obsidian plugin's Settings implementation
 */

/**
 * ViewDefinition represents a single view within a project
 */
export type ViewDefinition = {
  /**
   * Unique identifier for the view
   */
  id: string;
  
  /**
   * User-friendly name for the view
   */
  name: string;
  
  /**
   * Type of view (table, board, calendar, gallery, etc.)
   */
  type: string;
  
  /**
   * Optional configuration for the view
   */
  config?: Record<string, any>;
  
  /**
   * Filter configuration for the view
   */
  filter?: {
    conjunction: 'and' | 'or';
    conditions: any[];
  };
  
  /**
   * Color configuration for the view
   */
  colors?: {
    conditions: any[];
  };
  
  /**
   * Sort configuration for the view
   */
  sort?: {
    criteria: any[];
  };
};

/**
 * DataSource configuration
 */
export type DataSource = {
  /**
   * Type of data source (folder, tag, query, etc.)
   */
  kind: string;
  
  /**
   * Configuration for the data source
   */
  config: Record<string, any>;
};

/**
 * ProjectDefinition represents a single project
 */
export type ProjectDefinition = {
  /**
   * Unique identifier for the project
   */
  id: string;
  
  /**
   * User-friendly name for the project
   */
  name: string;
  
  /**
   * Collection of views in the project
   */
  views: ViewDefinition[];
  
  /**
   * Data source configuration
   */
  dataSource: DataSource;
  
  /**
   * Files to exclude from the project
   */
  excludedFiles: string[];
  
  /**
   * Optional folder for new files/notes
   */
  newFilesFolder?: string;
};

/**
 * Extension preferences
 */
export type ProjectsExtensionPreferences = {
  /**
   * User interface preferences
   */
  ui?: Record<string, any>;
  
  /**
   * Default project settings
   */
  defaultProject?: string;
};

/**
 * Main settings for the VS Code Projects extension
 */
export type ProjectsExtensionSettings = {
  /**
   * List of user projects
   */
  projects: ProjectDefinition[];
  
  /**
   * List of archived projects
   */
  archives: ProjectDefinition[];
  
  /**
   * User preferences
   */
  preferences: ProjectsExtensionPreferences;
};

/**
 * Default values for settings and new projects
 */
export const DEFAULT_VIEW: ViewDefinition = {
  id: '',
  name: 'Table',
  type: 'table',
  filter: { conjunction: 'and', conditions: [] },
  colors: { conditions: [] },
  sort: { criteria: [] }
};

export const DEFAULT_PROJECT: ProjectDefinition = {
  id: '',
  name: '',
  views: [],
  dataSource: {
    kind: 'folder',
    config: {
      path: '',
      recursive: false
    }
  },
  excludedFiles: []
};

export const DEFAULT_SETTINGS: ProjectsExtensionSettings = {
  projects: [],
  archives: [],
  preferences: {}
};
