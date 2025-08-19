import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories table - shared across all providers
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Providers table - top level
export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  shortCode: text("short_code").notNull().unique(),
  websiteUrl: text("website_url").notNull(),
  logoUrl: text("logo_url"),
  documentationUrl: text("documentation_url"),
  
  // Coverage & Technical
  geographicCoverage: text("geographic_coverage"),
  dataSources: text("data_sources").array(),
  historicalDataAvailable: boolean("historical_data_available").default(false),
  historicalDataDepth: text("historical_data_depth"),
  realtimeLatency: text("realtime_latency"),
  dataGranularity: text("data_granularity"),
  dataCompleteness: text("data_completeness"),
  dataRefreshRate: text("data_refresh_rate"),
  
  // Quality & Reliability
  uptimeGuarantee: text("uptime_guarantee"),
  serviceLevelAgreement: text("service_level_agreement"),
  supportChannels: text("support_channels").array(),
  maintenanceWindows: text("maintenance_windows"),
  incidentResponseTime: text("incident_response_time"),
  
  // Business & Compliance
  pricingModel: text("pricing_model"),
  freeTierAvailable: boolean("free_tier_available").default(false),
  complianceStandards: text("compliance_standards").array(),
  dataRetentionPolicy: text("data_retention_policy"),
  privacyPolicy: text("privacy_policy"),
  termsOfService: text("terms_of_service"),
  
  // Contact & Support
  contactInfo: jsonb("contact_info"),
  supportEmail: text("support_email"),
  salesContact: text("sales_contact"),
  technicalContact: text("technical_contact"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Environments table - development, staging, production
export const environments = pgTable("environments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // dev, staging, prod
  displayName: text("display_name").notNull(),
  baseUrl: text("base_url").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services/Domains table - logical grouping of APIs
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  version: text("version"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// APIs table - specific API services
export const apis = pgTable("apis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  version: text("version"),
  basePath: text("base_path"),
  
  // Technical details
  authType: text("auth_type"), // API Key, OAuth2, Bearer Token, etc.
  rateLimit: text("rate_limit"),
  supportedFormats: text("supported_formats").array(), // JSON, XML, CSV
  apiDesignStyle: text("api_design_style"), // REST, GraphQL, SOAP
  
  // Documentation
  documentationUrl: text("documentation_url"),
  swaggerUrl: text("swagger_url"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Endpoints table - API endpoints
export const endpoints = pgTable("endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiId: varchar("api_id").notNull().references(() => apis.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  path: text("path").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Operations table - specific HTTP operations on endpoints
export const operations = pgTable("operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpointId: varchar("endpoint_id").notNull().references(() => endpoints.id, { onDelete: "cascade" }),
  method: text("method").notNull(), // GET, POST, PUT, DELETE, etc.
  operationId: text("operation_id"),
  summary: text("summary"),
  description: text("description"),
  
  // Security & Rate limiting
  authRequired: boolean("auth_required").default(true),
  scopes: text("scopes").array(),
  rateLimit: text("rate_limit"),
  
  // Response details
  defaultResponseFormat: text("default_response_format").default("json"),
  cacheable: boolean("cacheable").default(false),
  cacheTime: integer("cache_time"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parameters table - input parameters for operations
export const parameters = pgTable("parameters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationId: varchar("operation_id").notNull().references(() => operations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // string, number, boolean, array, object
  location: text("location").notNull(), // query, path, header, body
  description: text("description"),
  
  // Validation
  required: boolean("required").default(false),
  defaultValue: text("default_value"),
  example: text("example"),
  format: text("format"), // email, uuid, date-time, etc.
  pattern: text("pattern"), // regex pattern
  minLength: integer("min_length"),
  maxLength: integer("max_length"),
  minimum: integer("minimum"),
  maximum: integer("maximum"),
  enum: text("enum").array(), // allowed values
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Response Schemas table - structure of API responses
export const responseSchemas = pgTable("response_schemas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationId: varchar("operation_id").notNull().references(() => operations.id, { onDelete: "cascade" }),
  statusCode: integer("status_code").notNull(),
  mediaType: text("media_type").default("application/json"),
  schema: jsonb("schema"), // JSON schema definition
  description: text("description"),
  example: jsonb("example"), // example response
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auth configurations table
export const authConfigs = pgTable("auth_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // api_key, oauth2, bearer_token, basic_auth
  description: text("description"),
  
  // Configuration details
  config: jsonb("config"), // auth-specific configuration
  scopes: text("scopes").array(),
  tokenEndpoint: text("token_endpoint"),
  authEndpoint: text("auth_endpoint"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate limit configurations
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id, { onDelete: "cascade" }),
  apiId: varchar("api_id").references(() => apis.id, { onDelete: "cascade" }),
  operationId: varchar("operation_id").references(() => operations.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  description: text("description"),
  requests: integer("requests").notNull(),
  period: text("period").notNull(), // second, minute, hour, day, month
  scope: text("scope").notNull(), // global, per_user, per_api_key
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Error codes table
export const errorCodes = pgTable("error_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationId: varchar("operation_id").references(() => operations.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").references(() => providers.id, { onDelete: "cascade" }),
  
  code: text("code").notNull(),
  httpStatus: integer("http_status").notNull(),
  message: text("message").notNull(),
  description: text("description"),
  example: jsonb("example"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Examples table - request/response examples
export const examples = pgTable("examples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationId: varchar("operation_id").notNull().references(() => operations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  
  // Request example
  requestExample: jsonb("request_example"),
  requestHeaders: jsonb("request_headers"),
  
  // Response example
  responseExample: jsonb("response_example"),
  responseHeaders: jsonb("response_headers"),
  statusCode: integer("status_code").default(200),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Metadata table - additional information
export const metadata = pgTable("metadata", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // provider, api, endpoint, operation
  entityId: varchar("entity_id").notNull(),
  key: text("key").notNull(),
  value: text("value"),
  jsonValue: jsonb("json_value"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction tables for many-to-many relationships
export const providerCategories = pgTable("provider_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

export const apiCategories = pgTable("api_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiId: varchar("api_id").notNull().references(() => apis.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  providerCategories: many(providerCategories),
  apiCategories: many(apiCategories),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  environments: many(environments),
  services: many(services),
  apis: many(apis),
  authConfigs: many(authConfigs),
  rateLimits: many(rateLimits),
  errorCodes: many(errorCodes),
  providerCategories: many(providerCategories),
}));

export const environmentsRelations = relations(environments, ({ one }) => ({
  provider: one(providers, {
    fields: [environments.providerId],
    references: [providers.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(providers, {
    fields: [services.providerId],
    references: [providers.id],
  }),
  apis: many(apis),
}));

export const apisRelations = relations(apis, ({ one, many }) => ({
  service: one(services, {
    fields: [apis.serviceId],
    references: [services.id],
  }),
  provider: one(providers, {
    fields: [apis.providerId],
    references: [providers.id],
  }),
  endpoints: many(endpoints),
  rateLimits: many(rateLimits),
  apiCategories: many(apiCategories),
}));

export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  api: one(apis, {
    fields: [endpoints.apiId],
    references: [apis.id],
  }),
  operations: many(operations),
}));

export const operationsRelations = relations(operations, ({ one, many }) => ({
  endpoint: one(endpoints, {
    fields: [operations.endpointId],
    references: [endpoints.id],
  }),
  parameters: many(parameters),
  responseSchemas: many(responseSchemas),
  examples: many(examples),
  rateLimits: many(rateLimits),
}));

export const parametersRelations = relations(parameters, ({ one }) => ({
  operation: one(operations, {
    fields: [parameters.operationId],
    references: [operations.id],
  }),
}));

export const responseSchemasRelations = relations(responseSchemas, ({ one }) => ({
  operation: one(operations, {
    fields: [responseSchemas.operationId],
    references: [operations.id],
  }),
}));

export const authConfigsRelations = relations(authConfigs, ({ one }) => ({
  provider: one(providers, {
    fields: [authConfigs.providerId],
    references: [providers.id],
  }),
}));

export const rateLimitsRelations = relations(rateLimits, ({ one }) => ({
  provider: one(providers, {
    fields: [rateLimits.providerId],
    references: [providers.id],
  }),
  api: one(apis, {
    fields: [rateLimits.apiId],
    references: [apis.id],
  }),
  operation: one(operations, {
    fields: [rateLimits.operationId],
    references: [operations.id],
  }),
}));

export const errorCodesRelations = relations(errorCodes, ({ one }) => ({
  operation: one(operations, {
    fields: [errorCodes.operationId],
    references: [operations.id],
  }),
  provider: one(providers, {
    fields: [errorCodes.providerId],
    references: [providers.id],
  }),
}));

export const examplesRelations = relations(examples, ({ one }) => ({
  operation: one(operations, {
    fields: [examples.operationId],
    references: [operations.id],
  }),
}));

export const providerCategoriesRelations = relations(providerCategories, ({ one }) => ({
  provider: one(providers, {
    fields: [providerCategories.providerId],
    references: [providers.id],
  }),
  category: one(categories, {
    fields: [providerCategories.categoryId],
    references: [categories.id],
  }),
}));

export const apiCategoriesRelations = relations(apiCategories, ({ one }) => ({
  api: one(apis, {
    fields: [apiCategories.apiId],
    references: [apis.id],
  }),
  category: one(categories, {
    fields: [apiCategories.categoryId],
    references: [categories.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  nameAr: true,
  description: true,
  descriptionAr: true,
});

export const insertProviderSchema = createInsertSchema(providers).pick({
  name: true,
  shortCode: true,
  websiteUrl: true,
  logoUrl: true,
  documentationUrl: true,
  geographicCoverage: true,
  dataSources: true,
  historicalDataAvailable: true,
  historicalDataDepth: true,
  realtimeLatency: true,
  dataGranularity: true,
  dataCompleteness: true,
  dataRefreshRate: true,
  uptimeGuarantee: true,
  serviceLevelAgreement: true,
  supportChannels: true,
  maintenanceWindows: true,
  incidentResponseTime: true,
  pricingModel: true,
  freeTierAvailable: true,
  complianceStandards: true,
  dataRetentionPolicy: true,
  privacyPolicy: true,
  termsOfService: true,
  contactInfo: true,
  supportEmail: true,
  salesContact: true,
  technicalContact: true,
  isActive: true,
});

export const insertEnvironmentSchema = createInsertSchema(environments).pick({
  providerId: true,
  name: true,
  displayName: true,
  baseUrl: true,
  description: true,
  isActive: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  providerId: true,
  name: true,
  displayName: true,
  description: true,
  icon: true,
  version: true,
  isActive: true,
});

export const insertApiSchema = createInsertSchema(apis).pick({
  serviceId: true,
  providerId: true,
  name: true,
  displayName: true,
  description: true,
  version: true,
  basePath: true,
  authType: true,
  rateLimit: true,
  supportedFormats: true,
  apiDesignStyle: true,
  documentationUrl: true,
  swaggerUrl: true,
  isActive: true,
});

export const insertEndpointSchema = createInsertSchema(endpoints).pick({
  apiId: true,
  name: true,
  path: true,
  description: true,
  isActive: true,
});

export const insertOperationSchema = createInsertSchema(operations).pick({
  endpointId: true,
  method: true,
  operationId: true,
  summary: true,
  description: true,
  authRequired: true,
  scopes: true,
  rateLimit: true,
  defaultResponseFormat: true,
  cacheable: true,
  cacheTime: true,
  isActive: true,
});

export const insertParameterSchema = createInsertSchema(parameters).pick({
  operationId: true,
  name: true,
  type: true,
  location: true,
  description: true,
  required: true,
  defaultValue: true,
  example: true,
  format: true,
  pattern: true,
  minLength: true,
  maxLength: true,
  minimum: true,
  maximum: true,
  enum: true,
});

export const insertResponseSchemaSchema = createInsertSchema(responseSchemas).pick({
  operationId: true,
  statusCode: true,
  mediaType: true,
  schema: true,
  description: true,
  example: true,
});

// Export types for convenience
export type Category = typeof categories.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type Environment = typeof environments.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Api = typeof apis.$inferSelect;
export type Endpoint = typeof endpoints.$inferSelect;
export type Operation = typeof operations.$inferSelect;
export type Parameter = typeof parameters.$inferSelect;
export type ResponseSchema = typeof responseSchemas.$inferSelect;
export type AuthConfig = typeof authConfigs.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
export type ErrorCode = typeof errorCodes.$inferSelect;
export type Example = typeof examples.$inferSelect;
export type Metadata = typeof metadata.$inferSelect;

// Extended types with relations
export type ProviderWithRelations = Provider & {
  environments: Environment[];
  services: (Service & { 
    apis: (Api & { 
      endpoints: (Endpoint & {
        operations: (Operation & {
          parameters: Parameter[];
          responseSchemas: ResponseSchema[];
          examples: Example[];
        })[];
      })[];
    })[];
  })[];
  categories: Category[];
  authConfigs: AuthConfig[];
};

export type ServiceWithRelations = Service & {
  provider: Provider;
  apis: (Api & {
    endpoints: (Endpoint & {
      operations: (Operation & {
        parameters: Parameter[];
        responseSchemas: ResponseSchema[];
      })[];
    })[];
    categories: Category[];
  })[];
};

export type ApiWithRelations = Api & {
  service: Service & { provider: Provider };
  provider: Provider;
  endpoints: (Endpoint & {
    operations: (Operation & {
      parameters: Parameter[];
      responseSchemas: ResponseSchema[];
      examples: Example[];
    })[];
  })[];
  categories: Category[];
};

export type OperationWithRelations = Operation & {
  endpoint: Endpoint & {
    api: Api & {
      service: Service & { provider: Provider };
    };
  };
  parameters: Parameter[];
  responseSchemas: ResponseSchema[];
  examples: Example[];
};

// Search results interface
export interface SearchResults {
  providers: ProviderWithRelations[];
  services: ServiceWithRelations[];
  apis: ApiWithRelations[];
  operations: OperationWithRelations[];
}

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;