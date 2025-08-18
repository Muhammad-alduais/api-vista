import { 
  categories, providers, environments, services, apis, endpoints, operations, 
  parameters, responseSchemas, authConfigs, rateLimits, errorCodes, examples,
  providerCategories, apiCategories,
  type Category, type Provider, type Environment, type Service, type Api, 
  type Endpoint, type Operation, type Parameter, type ResponseSchema,
  type AuthConfig, type RateLimit, type ErrorCode, type Example,
  type ProviderWithRelations, type ServiceWithRelations, type ApiWithRelations, type OperationWithRelations,
  insertCategorySchema, insertProviderSchema, insertEnvironmentSchema, insertServiceSchema,
  insertApiSchema, insertEndpointSchema, insertOperationSchema, insertParameterSchema,
  insertResponseSchemaSchema
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, inArray, and, desc } from "drizzle-orm";
import type { z } from "zod";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: z.infer<typeof insertCategorySchema>): Promise<Category>;
  updateCategory(id: string, category: Partial<z.infer<typeof insertCategorySchema>>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Providers
  getProviders(): Promise<ProviderWithRelations[]>;
  getProvider(id: string): Promise<ProviderWithRelations | undefined>;
  createProvider(provider: z.infer<typeof insertProviderSchema> & { categoryIds?: string[] }): Promise<Provider>;
  updateProvider(id: string, provider: Partial<z.infer<typeof insertProviderSchema>> & { categoryIds?: string[] }): Promise<Provider>;
  deleteProvider(id: string): Promise<void>;

  // Environments
  getEnvironments(providerId: string): Promise<Environment[]>;
  createEnvironment(environment: z.infer<typeof insertEnvironmentSchema>): Promise<Environment>;
  updateEnvironment(id: string, environment: Partial<z.infer<typeof insertEnvironmentSchema>>): Promise<Environment>;
  deleteEnvironment(id: string): Promise<void>;

  // Services
  getServices(providerId: string): Promise<ServiceWithRelations[]>;
  getService(id: string): Promise<ServiceWithRelations | undefined>;
  createService(service: z.infer<typeof insertServiceSchema>): Promise<Service>;
  updateService(id: string, service: Partial<z.infer<typeof insertServiceSchema>>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // APIs
  getApis(serviceId?: string, providerId?: string): Promise<ApiWithRelations[]>;
  getApi(id: string): Promise<ApiWithRelations | undefined>;
  createApi(api: z.infer<typeof insertApiSchema> & { categoryIds?: string[] }): Promise<Api>;
  updateApi(id: string, api: Partial<z.infer<typeof insertApiSchema>> & { categoryIds?: string[] }): Promise<Api>;
  deleteApi(id: string): Promise<void>;

  // Endpoints
  getEndpoints(apiId: string): Promise<Endpoint[]>;
  createEndpoint(endpoint: z.infer<typeof insertEndpointSchema>): Promise<Endpoint>;
  updateEndpoint(id: string, endpoint: Partial<z.infer<typeof insertEndpointSchema>>): Promise<Endpoint>;
  deleteEndpoint(id: string): Promise<void>;

  // Operations
  getOperations(endpointId: string): Promise<OperationWithRelations[]>;
  getOperation(id: string): Promise<OperationWithRelations | undefined>;
  createOperation(operation: z.infer<typeof insertOperationSchema>): Promise<Operation>;
  updateOperation(id: string, operation: Partial<z.infer<typeof insertOperationSchema>>): Promise<Operation>;
  deleteOperation(id: string): Promise<void>;

  // Parameters
  getParameters(operationId: string): Promise<Parameter[]>;
  createParameter(parameter: z.infer<typeof insertParameterSchema>): Promise<Parameter>;
  updateParameter(id: string, parameter: Partial<z.infer<typeof insertParameterSchema>>): Promise<Parameter>;
  deleteParameter(id: string): Promise<void>;

  // Response Schemas
  getResponseSchemas(operationId: string): Promise<ResponseSchema[]>;
  createResponseSchema(schema: z.infer<typeof insertResponseSchemaSchema>): Promise<ResponseSchema>;
  updateResponseSchema(id: string, schema: Partial<z.infer<typeof insertResponseSchemaSchema>>): Promise<ResponseSchema>;
  deleteResponseSchema(id: string): Promise<void>;

  // Search
  search(query: string): Promise<{
    providers: ProviderWithRelations[];
    services: ServiceWithRelations[];
    apis: ApiWithRelations[];
    operations: OperationWithRelations[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: z.infer<typeof insertCategorySchema>): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<z.infer<typeof insertCategorySchema>>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Providers
  async getProviders(): Promise<ProviderWithRelations[]> {
    return db.query.providers.findMany({
      with: {
        environments: true,
        services: {
          with: {
            apis: {
              with: {
                endpoints: {
                  with: {
                    operations: {
                      with: {
                        parameters: true,
                        responseSchemas: true,
                        examples: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        providerCategories: {
          with: {
            category: true,
          },
        },
        authConfigs: true,
      },
    }).then(providers => 
      providers.map(provider => ({
        ...provider,
        categories: provider.providerCategories.map(pc => pc.category),
      }))
    );
  }

  async getProvider(id: string): Promise<ProviderWithRelations | undefined> {
    const provider = await db.query.providers.findFirst({
      where: eq(providers.id, id),
      with: {
        environments: true,
        services: {
          with: {
            apis: {
              with: {
                endpoints: {
                  with: {
                    operations: {
                      with: {
                        parameters: true,
                        responseSchemas: true,
                        examples: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        providerCategories: {
          with: {
            category: true,
          },
        },
        authConfigs: true,
      },
    });

    if (!provider) return undefined;

    return {
      ...provider,
      categories: provider.providerCategories.map(pc => pc.category),
    };
  }

  async createProvider(provider: z.infer<typeof insertProviderSchema> & { categoryIds?: string[] }): Promise<Provider> {
    const { categoryIds, ...providerData } = provider;
    const [newProvider] = await db.insert(providers).values(providerData).returning();

    if (categoryIds && categoryIds.length > 0) {
      await db.insert(providerCategories).values(
        categoryIds.map(categoryId => ({
          providerId: newProvider.id,
          categoryId,
        }))
      );
    }

    return newProvider;
  }

  async updateProvider(id: string, provider: Partial<z.infer<typeof insertProviderSchema>> & { categoryIds?: string[] }): Promise<Provider> {
    const { categoryIds, ...providerData } = provider;
    
    const [updated] = await db
      .update(providers)
      .set({ ...providerData, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();

    if (categoryIds !== undefined) {
      await db.delete(providerCategories).where(eq(providerCategories.providerId, id));
      if (categoryIds.length > 0) {
        await db.insert(providerCategories).values(
          categoryIds.map(categoryId => ({
            providerId: id,
            categoryId,
          }))
        );
      }
    }

    return updated;
  }

  async deleteProvider(id: string): Promise<void> {
    await db.delete(providers).where(eq(providers.id, id));
  }

  // Environments
  async getEnvironments(providerId: string): Promise<Environment[]> {
    return db.select().from(environments).where(eq(environments.providerId, providerId));
  }

  async createEnvironment(environment: z.infer<typeof insertEnvironmentSchema>): Promise<Environment> {
    const [newEnvironment] = await db.insert(environments).values(environment).returning();
    return newEnvironment;
  }

  async updateEnvironment(id: string, environment: Partial<z.infer<typeof insertEnvironmentSchema>>): Promise<Environment> {
    const [updated] = await db
      .update(environments)
      .set({ ...environment, updatedAt: new Date() })
      .where(eq(environments.id, id))
      .returning();
    return updated;
  }

  async deleteEnvironment(id: string): Promise<void> {
    await db.delete(environments).where(eq(environments.id, id));
  }

  // Services
  async getServices(providerId: string): Promise<ServiceWithRelations[]> {
    return db.query.services.findMany({
      where: eq(services.providerId, providerId),
      with: {
        provider: true,
        apis: {
          with: {
            endpoints: {
              with: {
                operations: {
                  with: {
                    parameters: true,
                    responseSchemas: true,
                  },
                },
              },
            },
            apiCategories: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    }).then(services => 
      services.map(service => ({
        ...service,
        apis: service.apis.map(api => ({
          ...api,
          categories: api.apiCategories.map(ac => ac.category),
        })),
      }))
    );
  }

  async getService(id: string): Promise<ServiceWithRelations | undefined> {
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
      with: {
        provider: true,
        apis: {
          with: {
            endpoints: {
              with: {
                operations: {
                  with: {
                    parameters: true,
                    responseSchemas: true,
                  },
                },
              },
            },
            apiCategories: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!service) return undefined;

    return {
      ...service,
      apis: service.apis.map(api => ({
        ...api,
        categories: api.apiCategories.map(ac => ac.category),
      })),
    };
  }

  async createService(service: z.infer<typeof insertServiceSchema>): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<z.infer<typeof insertServiceSchema>>): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // APIs
  async getApis(serviceId?: string, providerId?: string): Promise<ApiWithRelations[]> {
    const whereClause = serviceId ? eq(apis.serviceId, serviceId) : 
                       providerId ? eq(apis.providerId, providerId) : undefined;

    const query = whereClause ? 
      db.query.apis.findMany({
        where: whereClause,
        with: {
          service: { with: { provider: true } },
          provider: true,
          endpoints: {
            with: {
              operations: {
                with: {
                  parameters: true,
                  responseSchemas: true,
                  examples: true,
                },
              },
            },
          },
          apiCategories: {
            with: {
              category: true,
            },
          },
        },
      }) :
      db.query.apis.findMany({
        with: {
          service: { with: { provider: true } },
          provider: true,
          endpoints: {
            with: {
              operations: {
                with: {
                  parameters: true,
                  responseSchemas: true,
                  examples: true,
                },
              },
            },
          },
          apiCategories: {
            with: {
              category: true,
            },
          },
        },
      });

    return query.then(apis => 
      apis.map(api => ({
        ...api,
        categories: api.apiCategories.map(ac => ac.category),
      }))
    );
  }

  async getApi(id: string): Promise<ApiWithRelations | undefined> {
    const api = await db.query.apis.findFirst({
      where: eq(apis.id, id),
      with: {
        service: { with: { provider: true } },
        provider: true,
        endpoints: {
          with: {
            operations: {
              with: {
                parameters: true,
                responseSchemas: true,
                examples: true,
              },
            },
          },
        },
        apiCategories: {
          with: {
            category: true,
          },
        },
      },
    });

    if (!api) return undefined;

    return {
      ...api,
      categories: api.apiCategories.map(ac => ac.category),
    };
  }

  async createApi(api: z.infer<typeof insertApiSchema> & { categoryIds?: string[] }): Promise<Api> {
    const { categoryIds, ...apiData } = api;
    const [newApi] = await db.insert(apis).values(apiData).returning();

    if (categoryIds && categoryIds.length > 0) {
      await db.insert(apiCategories).values(
        categoryIds.map(categoryId => ({
          apiId: newApi.id,
          categoryId,
        }))
      );
    }

    return newApi;
  }

  async updateApi(id: string, api: Partial<z.infer<typeof insertApiSchema>> & { categoryIds?: string[] }): Promise<Api> {
    const { categoryIds, ...apiData } = api;
    
    const [updated] = await db
      .update(apis)
      .set({ ...apiData, updatedAt: new Date() })
      .where(eq(apis.id, id))
      .returning();

    if (categoryIds !== undefined) {
      await db.delete(apiCategories).where(eq(apiCategories.apiId, id));
      if (categoryIds.length > 0) {
        await db.insert(apiCategories).values(
          categoryIds.map(categoryId => ({
            apiId: id,
            categoryId,
          }))
        );
      }
    }

    return updated;
  }

  async deleteApi(id: string): Promise<void> {
    await db.delete(apis).where(eq(apis.id, id));
  }

  // Endpoints
  async getEndpoints(apiId: string): Promise<Endpoint[]> {
    return db.select().from(endpoints).where(eq(endpoints.apiId, apiId));
  }

  async createEndpoint(endpoint: z.infer<typeof insertEndpointSchema>): Promise<Endpoint> {
    const [newEndpoint] = await db.insert(endpoints).values(endpoint).returning();
    return newEndpoint;
  }

  async updateEndpoint(id: string, endpoint: Partial<z.infer<typeof insertEndpointSchema>>): Promise<Endpoint> {
    const [updated] = await db
      .update(endpoints)
      .set({ ...endpoint, updatedAt: new Date() })
      .where(eq(endpoints.id, id))
      .returning();
    return updated;
  }

  async deleteEndpoint(id: string): Promise<void> {
    await db.delete(endpoints).where(eq(endpoints.id, id));
  }

  // Operations
  async getOperations(endpointId: string): Promise<OperationWithRelations[]> {
    return db.query.operations.findMany({
      where: eq(operations.endpointId, endpointId),
      with: {
        endpoint: {
          with: {
            api: {
              with: {
                service: { with: { provider: true } },
              },
            },
          },
        },
        parameters: true,
        responseSchemas: true,
        examples: true,
      },
    });
  }

  async getOperation(id: string): Promise<OperationWithRelations | undefined> {
    return db.query.operations.findFirst({
      where: eq(operations.id, id),
      with: {
        endpoint: {
          with: {
            api: {
              with: {
                service: { with: { provider: true } },
              },
            },
          },
        },
        parameters: true,
        responseSchemas: true,
        examples: true,
      },
    });
  }

  async createOperation(operation: z.infer<typeof insertOperationSchema>): Promise<Operation> {
    const [newOperation] = await db.insert(operations).values(operation).returning();
    return newOperation;
  }

  async updateOperation(id: string, operation: Partial<z.infer<typeof insertOperationSchema>>): Promise<Operation> {
    const [updated] = await db
      .update(operations)
      .set({ ...operation, updatedAt: new Date() })
      .where(eq(operations.id, id))
      .returning();
    return updated;
  }

  async deleteOperation(id: string): Promise<void> {
    await db.delete(operations).where(eq(operations.id, id));
  }

  // Parameters
  async getParameters(operationId: string): Promise<Parameter[]> {
    return db.select().from(parameters).where(eq(parameters.operationId, operationId));
  }

  async createParameter(parameter: z.infer<typeof insertParameterSchema>): Promise<Parameter> {
    const [newParameter] = await db.insert(parameters).values(parameter).returning();
    return newParameter;
  }

  async updateParameter(id: string, parameter: Partial<z.infer<typeof insertParameterSchema>>): Promise<Parameter> {
    const [updated] = await db
      .update(parameters)
      .set({ ...parameter, updatedAt: new Date() })
      .where(eq(parameters.id, id))
      .returning();
    return updated;
  }

  async deleteParameter(id: string): Promise<void> {
    await db.delete(parameters).where(eq(parameters.id, id));
  }

  // Response Schemas
  async getResponseSchemas(operationId: string): Promise<ResponseSchema[]> {
    return db.select().from(responseSchemas).where(eq(responseSchemas.operationId, operationId));
  }

  async createResponseSchema(schema: z.infer<typeof insertResponseSchemaSchema>): Promise<ResponseSchema> {
    const [newSchema] = await db.insert(responseSchemas).values(schema).returning();
    return newSchema;
  }

  async updateResponseSchema(id: string, schema: Partial<z.infer<typeof insertResponseSchemaSchema>>): Promise<ResponseSchema> {
    const [updated] = await db
      .update(responseSchemas)
      .set({ ...schema, updatedAt: new Date() })
      .where(eq(responseSchemas.id, id))
      .returning();
    return updated;
  }

  async deleteResponseSchema(id: string): Promise<void> {
    await db.delete(responseSchemas).where(eq(responseSchemas.id, id));
  }

  // Search
  async search(query: string): Promise<{
    providers: ProviderWithRelations[];
    services: ServiceWithRelations[];
    apis: ApiWithRelations[];
    operations: OperationWithRelations[];
  }> {
    const searchPattern = `%${query.toLowerCase()}%`;

    const [searchProviders, searchServices, searchApis, searchOperations] = await Promise.all([
      // Search providers
      db.query.providers.findMany({
        where: or(
          like(providers.name, searchPattern),
          like(providers.shortCode, searchPattern),
          like(providers.geographicCoverage, searchPattern)
        ),
        with: {
          environments: true,
          services: {
            with: {
              apis: {
                with: {
                  endpoints: {
                    with: {
                      operations: {
                        with: {
                          parameters: true,
                          responseSchemas: true,
                          examples: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          providerCategories: {
            with: {
              category: true,
            },
          },
          authConfigs: true,
        },
      }).then(providers => 
        providers.map(provider => ({
          ...provider,
          categories: provider.providerCategories.map(pc => pc.category),
        }))
      ),

      // Search services
      db.query.services.findMany({
        where: or(
          like(services.name, searchPattern),
          like(services.displayName, searchPattern),
          like(services.description, searchPattern)
        ),
        with: {
          provider: true,
          apis: {
            with: {
              endpoints: {
                with: {
                  operations: {
                    with: {
                      parameters: true,
                      responseSchemas: true,
                    },
                  },
                },
              },
              apiCategories: {
                with: {
                  category: true,
                },
              },
            },
          },
        },
      }).then(services => 
        services.map(service => ({
          ...service,
          apis: service.apis.map(api => ({
            ...api,
            categories: api.apiCategories.map(ac => ac.category),
          })),
        }))
      ),

      // Search APIs
      db.query.apis.findMany({
        where: or(
          like(apis.name, searchPattern),
          like(apis.displayName, searchPattern),
          like(apis.description, searchPattern),
          like(apis.authType, searchPattern)
        ),
        with: {
          service: { with: { provider: true } },
          provider: true,
          endpoints: {
            with: {
              operations: {
                with: {
                  parameters: true,
                  responseSchemas: true,
                  examples: true,
                },
              },
            },
          },
          apiCategories: {
            with: {
              category: true,
            },
          },
        },
      }).then(apis => 
        apis.map(api => ({
          ...api,
          categories: api.apiCategories.map(ac => ac.category),
        }))
      ),

      // Search operations
      db.query.operations.findMany({
        where: or(
          like(operations.method, searchPattern),
          like(operations.summary, searchPattern),
          like(operations.description, searchPattern)
        ),
        with: {
          endpoint: {
            with: {
              api: {
                with: {
                  service: { with: { provider: true } },
                },
              },
            },
          },
          parameters: true,
          responseSchemas: true,
          examples: true,
        },
      }),
    ]);

    return {
      providers: searchProviders,
      services: searchServices,
      apis: searchApis,
      operations: searchOperations,
    };
  }
}

export const storage = new DatabaseStorage();