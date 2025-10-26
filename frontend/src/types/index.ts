/**
 * TypeScript type definitions for Statistics Orphan Finder
 */

import type { TemplateResult } from 'lit';

// ============================================================================
// Home Assistant Types
// ============================================================================

export interface HomeAssistant {
  callApi<T>(method: string, path: string, data?: unknown): Promise<T>;
  callWS<T>(msg: unknown): Promise<T>;
  connection: unknown;
  language: string;
  themes: unknown;
  selectedTheme: unknown;
  config: {
    latitude: number;
    longitude: number;
    elevation: number;
    unit_system: unknown;
    location_name: string;
    time_zone: string;
    components: string[];
    config_dir: string;
    whitelist_external_dirs: string[];
    allowlist_external_dirs: string[];
    version: string;
    config_source: string;
    safe_mode: boolean;
    state: string;
    external_url: string | null;
    internal_url: string | null;
  };
}

// ============================================================================
// SQL Generation Types
// ============================================================================

export type OrphanStatus = 'deleted' | 'unavailable';
export type OrphanOrigin = 'States' | 'Long-term' | 'Short-term' | 'Both' | 'States+Statistics';

export interface DatabaseSize {
  states: number;
  statistics: number;
  statistics_short_term: number;
  other: number;
  states_size: number;
  statistics_size: number;
  statistics_short_term_size: number;
  other_size: number;
}

export interface GenerateSqlResponse {
  sql: string;
  storage_saved: number;
}

// Discriminated union for bulk SQL generation results
export type BulkSqlGenerationResult =
  | {
      status: 'success';
      entities: Array<{
        entity_id: string;
        sql: string;
        storage_saved: number;
        count: number;
      }>;
      total_storage_saved: number;
      total_count: number;
      success_count: number;
      error_count: 0;
    }
  | {
      status: 'partial';
      entities: Array<{
        entity_id: string;
        sql: string;
        storage_saved: number;
        count: number;
        error?: string;
      }>;
      total_storage_saved: number;
      total_count: number;
      success_count: number;
      error_count: number;
    }
  | {
      status: 'error';
      error: string;
    };

// ============================================================================
// Storage Overview Types
// ============================================================================

export type RegistryStatus = 'Enabled' | 'Disabled' | 'Not in Registry';
export type StateStatus = 'Available' | 'Unavailable' | 'Not Present';

export interface StorageEntity {
  entity_id: string;
  in_entity_registry: boolean;
  registry_status: RegistryStatus;
  in_state_machine: boolean;
  state_status: StateStatus;
  in_states_meta: boolean;
  in_states: boolean;
  in_statistics_meta: boolean;
  in_statistics_short_term: boolean;
  in_statistics_long_term: boolean;
  states_count: number;
  stats_short_count: number;
  stats_long_count: number;
  last_state_update: string | null;
  last_stats_update: string | null;
  // Additional metadata
  platform: string | null;
  disabled_by: string | null;
  device_name: string | null;
  device_disabled: boolean;
  config_entry_state: string | null;
  config_entry_title: string | null;
  availability_reason: string;
  unavailable_duration_seconds: number | null;
  update_interval: string | null;
  update_interval_seconds: number | null;
  update_count_24h: number | null;
  statistics_eligibility_reason: string | null;
  // For Generate SQL functionality (only present for entities with statistics)
  metadata_id: number | null;
  origin: OrphanOrigin | null;
}

export interface StorageSummary {
  total_entities: number;
  in_entity_registry: number;
  registry_enabled: number;
  registry_disabled: number;
  in_state_machine: number;
  state_available: number;
  state_unavailable: number;
  in_states_meta: number;
  in_states: number;
  in_statistics_meta: number;
  in_statistics_short_term: number;
  in_statistics_long_term: number;
  only_in_states: number;
  only_in_statistics: number;
  in_both_states_and_stats: number;
  orphaned_states_meta: number;
  orphaned_statistics_meta: number;
  deleted_from_registry: number;
  deleted_storage_bytes: number;
  disabled_storage_bytes: number;
}

export interface EntityStorageOverviewResponse {
  entities: StorageEntity[];
  summary: StorageSummary;
}

// Step response for progressive loading
export type StepResponse =
  | { status: 'initialized'; total_steps: number }
  | { status: 'complete'; entities_found: number }
  | { status: 'complete'; total_entities: number }
  | { status: 'complete'; deleted_storage_bytes: number }
  | EntityStorageOverviewResponse;

// API Result types with discriminated unions
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// Table Component Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface ColumnConfig<T = unknown> {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (entity: T) => string | HTMLElement | TemplateResult;
  getValue?: (entity: T) => unknown;
  className?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export type BasicFilterValue = 'all' | 'in_registry' | 'in_state' | 'deleted';
export type RegistryFilterValue = 'Enabled' | 'Disabled';
export type StateFilterValue = 'Available' | 'Unavailable';
export type AdvancedFilterValue = 'all' | 'only_states' | 'only_stats';

export interface FilterState {
  basicFilter: BasicFilterValue;
  registryFilter: RegistryFilterValue | null;
  stateFilter: StateFilterValue | null;
  advancedFilter: AdvancedFilterValue;
  searchQuery: string;
}

// ============================================================================
// Component Event Types
// ============================================================================

export interface SortChangedEvent extends CustomEvent {
  detail: {
    column: string;
    direction: SortDirection;
  };
}

export interface FilterChangedEvent extends CustomEvent {
  detail: Partial<FilterState>;
}

export interface EntityClickedEvent extends CustomEvent {
  detail: {
    entityId: string;
  };
}

export interface EntityDetailsEvent extends CustomEvent {
  detail: {
    entity: StorageEntity;
  };
}

export interface SelectionChangedEvent extends CustomEvent {
  detail: {
    entityId: string;
    selected: boolean;
  };
}

// ============================================================================
// Modal Types
// ============================================================================

export interface DeleteModalData {
  entityId: string;
  metadataId: number;
  origin: OrphanOrigin;
  status: OrphanStatus;
  count: number;
}

export interface EntityDetailsModalData {
  entity: StorageEntity;
}

// ============================================================================
// API Action Types
// ============================================================================

export type ApiAction = 'database_size' | 'generate_delete_sql';

export interface ApiParams {
  action: ApiAction;
  metadata_id?: number;
  origin?: OrphanOrigin;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error: string | null;
}

// Note: Custom element types are declared in their respective component files
