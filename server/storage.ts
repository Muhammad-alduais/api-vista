import { 
  categories, providers, apis, endpoints, providerCategories, apiCategories,
  type Category, type Provider, type Api, type Endpoint, type ProviderCategory, type ApiCategory,
  type InsertCategory, type InsertProvider, type InsertApi, type InsertEndpoint, 
  type InsertProviderCategory, type InsertApiCategory,
  type ProviderWithRelations, type ApiWithRelations, type EndpointWithRelations,
  type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, or, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Provider methods
  getProviders(search?: string): Promise<ProviderWithRelations[]>;
  getProviderById(id: string): Promise<ProviderWithRelations | undefined>;
  createProvider(provider: InsertProvider, categoryIds: string[]): Promise<ProviderWithRelations>;
  updateProvider(id: string, provider: Partial<InsertProvider>, categoryIds?: string[]): Promise<ProviderWithRelations | undefined>;
  deleteProvider(id: string): Promise<boolean>;

  // API methods
  getApisByProviderId(providerId: string): Promise<ApiWithRelations[]>;
  getApiById(id: string): Promise<ApiWithRelations | undefined>;
  createApi(api: InsertApi, categoryIds: string[]): Promise<ApiWithRelations>;
  updateApi(id: string, api: Partial<InsertApi>, categoryIds?: string[]): Promise<ApiWithRelations | undefined>;
  deleteApi(id: string): Promise<boolean>;

  // Endpoint methods
  getEndpointsByApiId(apiId: string): Promise<Endpoint[]>;
  getEndpointById(id: string): Promise<EndpointWithRelations | undefined>;
  createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint>;
  updateEndpoint(id: string, endpoint: Partial<InsertEndpoint>): Promise<Endpoint | undefined>;
  deleteEndpoint(id: string): Promise<boolean>;

  // Search methods
  searchAll(query: string): Promise<{
    providers: ProviderWithRelations[];
    apis: ApiWithRelations[];
    endpoints: EndpointWithRelations[];
  }>;

  // Export methods
  exportData(): Promise<{
    categories: Category[];
    providers: ProviderWithRelations[];
    apis: ApiWithRelations[];
    endpoints: EndpointWithRelations[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(providers).where(eq(providers.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(providers).where(eq(providers.name, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(providers).values(insertUser as any).returning();
    return user as any;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Provider methods
  async getProviders(search?: string): Promise<ProviderWithRelations[]> {
    const providersData = await db.query.providers.findMany({
      where: search 
        ? or(
            ilike(providers.name, `%${search}%`),
            ilike(providers.shortCode, `%${search}%`),
            ilike(providers.description, `%${search}%`)
          )
        : undefined,
      with: {
        apis: {
          with: {
            endpoints: true,
            apiCategories: {
              with: {
                category: true
              }
            }
          }
        },
        providerCategories: {
          with: {
            category: true
          }
        }
      },
      orderBy: [desc(providers.createdAt)]
    });

    return providersData.map(provider => ({
      ...provider,
      categories: provider.providerCategories.map(pc => pc.category),
      apis: provider.apis.map(api => ({
        ...api,
        categories: api.apiCategories.map(ac => ac.category)
      }))
    }));
  }

  async getProviderById(id: string): Promise<ProviderWithRelations | undefined> {
    const providerData = await db.query.providers.findFirst({
      where: eq(providers.id, id),
      with: {
        apis: {
          with: {
            endpoints: true,
            apiCategories: {
              with: {
                category: true
              }
            }
          }
        },
        providerCategories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!providerData) return undefined;

    return {
      ...providerData,
      categories: providerData.providerCategories.map(pc => pc.category),
      apis: providerData.apis.map(api => ({
        ...api,
        categories: api.apiCategories.map(ac => ac.category)
      }))
    };
  }

  async createProvider(provider: InsertProvider, categoryIds: string[]): Promise<ProviderWithRelations> {
    const [newProvider] = await db.insert(providers).values(provider).returning();
    
    // Add category associations
    if (categoryIds.length > 0) {
      await db.insert(providerCategories).values(
        categoryIds.map(categoryId => ({
          providerId: newProvider.id,
          categoryId
        }))
      );
    }

    const result = await this.getProviderById(newProvider.id);
    if (!result) throw new Error("Failed to create provider");
    return result;
  }

  async updateProvider(id: string, provider: Partial<InsertProvider>, categoryIds?: string[]): Promise<ProviderWithRelations | undefined> {
    const [updated] = await db
      .update(providers)
      .set({ ...provider, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();

    if (!updated) return undefined;

    // Update category associations if provided
    if (categoryIds !== undefined) {
      await db.delete(providerCategories).where(eq(providerCategories.providerId, id));
      if (categoryIds.length > 0) {
        await db.insert(providerCategories).values(
          categoryIds.map(categoryId => ({
            providerId: id,
            categoryId
          }))
        );
      }
    }

    return await this.getProviderById(id);
  }

  async deleteProvider(id: string): Promise<boolean> {
    const result = await db.delete(providers).where(eq(providers.id, id));
    return result.rowCount > 0;
  }

  // API methods
  async getApisByProviderId(providerId: string): Promise<ApiWithRelations[]> {
    const apisData = await db.query.apis.findMany({
      where: eq(apis.providerId, providerId),
      with: {
        provider: true,
        endpoints: true,
        apiCategories: {
          with: {
            category: true
          }
        }
      },
      orderBy: [desc(apis.createdAt)]
    });

    return apisData.map(api => ({
      ...api,
      categories: api.apiCategories.map(ac => ac.category)
    }));
  }

  async getApiById(id: string): Promise<ApiWithRelations | undefined> {
    const apiData = await db.query.apis.findFirst({
      where: eq(apis.id, id),
      with: {
        provider: true,
        endpoints: true,
        apiCategories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!apiData) return undefined;

    return {
      ...apiData,
      categories: apiData.apiCategories.map(ac => ac.category)
    };
  }

  async createApi(api: InsertApi, categoryIds: string[]): Promise<ApiWithRelations> {
    const [newApi] = await db.insert(apis).values(api).returning();
    
    // Add category associations
    if (categoryIds.length > 0) {
      await db.insert(apiCategories).values(
        categoryIds.map(categoryId => ({
          apiId: newApi.id,
          categoryId
        }))
      );
    }

    const result = await this.getApiById(newApi.id);
    if (!result) throw new Error("Failed to create API");
    return result;
  }

  async updateApi(id: string, api: Partial<InsertApi>, categoryIds?: string[]): Promise<ApiWithRelations | undefined> {
    const [updated] = await db
      .update(apis)
      .set({ ...api, updatedAt: new Date() })
      .where(eq(apis.id, id))
      .returning();

    if (!updated) return undefined;

    // Update category associations if provided
    if (categoryIds !== undefined) {
      await db.delete(apiCategories).where(eq(apiCategories.apiId, id));
      if (categoryIds.length > 0) {
        await db.insert(apiCategories).values(
          categoryIds.map(categoryId => ({
            apiId: id,
            categoryId
          }))
        );
      }
    }

    return await this.getApiById(id);
  }

  async deleteApi(id: string): Promise<boolean> {
    const result = await db.delete(apis).where(eq(apis.id, id));
    return result.rowCount > 0;
  }

  // Endpoint methods
  async getEndpointsByApiId(apiId: string): Promise<Endpoint[]> {
    return await db.select().from(endpoints).where(eq(endpoints.apiId, apiId)).orderBy(endpoints.name);
  }

  async getEndpointById(id: string): Promise<EndpointWithRelations | undefined> {
    const endpointData = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, id),
      with: {
        api: {
          with: {
            provider: true
          }
        }
      }
    });

    return endpointData || undefined;
  }

  async createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint> {
    const [newEndpoint] = await db.insert(endpoints).values(endpoint).returning();
    return newEndpoint;
  }

  async updateEndpoint(id: string, endpoint: Partial<InsertEndpoint>): Promise<Endpoint | undefined> {
    const [updated] = await db
      .update(endpoints)
      .set({ ...endpoint, updatedAt: new Date() })
      .where(eq(endpoints.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    const result = await db.delete(endpoints).where(eq(endpoints.id, id));
    return result.rowCount > 0;
  }

  // Search methods
  async searchAll(query: string): Promise<{
    providers: ProviderWithRelations[];
    apis: ApiWithRelations[];
    endpoints: EndpointWithRelations[];
  }> {
    const searchProviders = await this.getProviders(query);
    
    const searchApis = await db.query.apis.findMany({
      where: or(
        ilike(apis.name, `%${query}%`),
        ilike(apis.description, `%${query}%`)
      ),
      with: {
        provider: true,
        endpoints: true,
        apiCategories: {
          with: {
            category: true
          }
        }
      }
    });

    const searchEndpoints = await db.query.endpoints.findMany({
      where: or(
        ilike(endpoints.name, `%${query}%`),
        ilike(endpoints.description, `%${query}%`),
        ilike(endpoints.path, `%${query}%`)
      ),
      with: {
        api: {
          with: {
            provider: true
          }
        }
      }
    });

    return {
      providers: searchProviders,
      apis: searchApis.map(api => ({
        ...api,
        categories: api.apiCategories.map(ac => ac.category)
      })),
      endpoints: searchEndpoints
    };
  }

  // Export methods
  async exportData(): Promise<{
    categories: Category[];
    providers: ProviderWithRelations[];
    apis: ApiWithRelations[];
    endpoints: EndpointWithRelations[];
  }> {
    const allCategories = await this.getCategories();
    const allProviders = await this.getProviders();
    
    const allApis = await db.query.apis.findMany({
      with: {
        provider: true,
        endpoints: true,
        apiCategories: {
          with: {
            category: true
          }
        }
      }
    });

    const allEndpoints = await db.query.endpoints.findMany({
      with: {
        api: {
          with: {
            provider: true
          }
        }
      }
    });

    return {
      categories: allCategories,
      providers: allProviders,
      apis: allApis.map(api => ({
        ...api,
        categories: api.apiCategories.map(ac => ac.category)
      })),
      endpoints: allEndpoints
    };
  }
}

export const storage = new DatabaseStorage();
