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

// Providers table
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
  uptimeSla: text("uptime_sla"),
  updateFrequency: text("update_frequency"),
  knownLimitations: text("known_limitations").array(),
  dataAccuracyMetrics: text("data_accuracy_metrics"),
  dataValidationProcedures: text("data_validation_procedures"),
  responseTimeLatency: text("response_time_latency"),
  reliabilityHistory: text("reliability_history"),
  dataFreshness: text("data_freshness"),
  
  // Legal & Licensing
  licenseType: text("license_type"),
  termsOfUseUrl: text("terms_of_use_url"),
  dataUsageRestrictions: text("data_usage_restrictions").array(),
  attributionRequirements: text("attribution_requirements"),
  
  // Operational & Support
  supportContact: text("support_contact"),
  sdksAvailable: text("sdks_available").array(),
  deprecationPolicyUrl: text("deprecation_policy_url"),
  serviceStatusPageUrl: text("service_status_page_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// APIs table
export const apis = pgTable("apis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  baseUrl: text("base_url").notNull(),
  version: text("version"),
  authType: text("auth_type"), // API Key, OAuth2, Basic, None
  
  // Pricing information
  pricingInfo: jsonb("pricing_info"), // Array of pricing plans
  
  // Rate limits
  rateLimit: text("rate_limit"),
  
  // API Structure
  supportedFormats: text("supported_formats").array(),
  apiDesignStyle: text("api_design_style"), // RESTful, GraphQL, SOAP, RPC
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Endpoints table
export const endpoints = pgTable("endpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiId: varchar("api_id").notNull().references(() => apis.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  path: text("path").notNull(),
  httpMethods: text("http_methods").array(),
  description: text("description"),
  authRequired: boolean("auth_required").default(true),
  
  // Input/Output specifications
  inputParameters: jsonb("input_parameters"), // Array of parameter objects
  outputSchema: jsonb("output_schema"), // Response schema definition
  responseExamples: jsonb("response_examples"), // Array of example responses
  errorCodes: jsonb("error_codes"), // Array of error code objects
  
  // Endpoint-specific settings
  endpointRateLimit: text("endpoint_rate_limit"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table for provider-category relationships
export const providerCategories = pgTable("provider_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

// Junction table for API-category relationships
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
  apis: many(apis),
  providerCategories: many(providerCategories),
}));

export const apisRelations = relations(apis, ({ one, many }) => ({
  provider: one(providers, {
    fields: [apis.providerId],
    references: [providers.id],
  }),
  endpoints: many(endpoints),
  apiCategories: many(apiCategories),
}));

export const endpointsRelations = relations(endpoints, ({ one }) => ({
  api: one(apis, {
    fields: [endpoints.apiId],
    references: [apis.id],
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
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiSchema = createInsertSchema(apis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEndpointSchema = createInsertSchema(endpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderCategorySchema = createInsertSchema(providerCategories).omit({
  id: true,
});

export const insertApiCategorySchema = createInsertSchema(apiCategories).omit({
  id: true,
});

// Types
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type InsertApi = z.infer<typeof insertApiSchema>;
export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;
export type InsertProviderCategory = z.infer<typeof insertProviderCategorySchema>;
export type InsertApiCategory = z.infer<typeof insertApiCategorySchema>;

export type Category = typeof categories.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type Api = typeof apis.$inferSelect;
export type Endpoint = typeof endpoints.$inferSelect;
export type ProviderCategory = typeof providerCategories.$inferSelect;
export type ApiCategory = typeof apiCategories.$inferSelect;

// Extended types with relations
export type ProviderWithRelations = Provider & {
  apis: (Api & { endpoints: Endpoint[]; categories: Category[] })[];
  categories: Category[];
};

export type ApiWithRelations = Api & {
  provider: Provider;
  endpoints: Endpoint[];
  categories: Category[];
};

export type EndpointWithRelations = Endpoint & {
  api: Api & { provider: Provider };
};

// Search results interface
export interface SearchResults {
  providers: ProviderWithRelations[];
  apis: ApiWithRelations[];
  endpoints: EndpointWithRelations[];
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
