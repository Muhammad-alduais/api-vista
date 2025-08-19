import { 
  type Category, type Provider, type Environment, type Service, type Api, 
  type Endpoint, type Operation, type Parameter, type ResponseSchema,
  insertCategorySchema, insertProviderSchema, insertEnvironmentSchema, insertServiceSchema,
  insertApiSchema, insertEndpointSchema, insertOperationSchema, insertParameterSchema,
  insertResponseSchemaSchema
} from "@shared/schema";
import type { z } from "zod";
import { nanoid } from "nanoid";

// Type definitions for relations
type ProviderWithRelations = Provider & {
  environments?: Environment[];
  services?: ServiceWithRelations[];
  categories?: Category[];
};

type ServiceWithRelations = Service & {
  provider?: Provider;
  apis?: ApiWithRelations[];
};

type ApiWithRelations = Api & {
  service?: Service;
  provider?: Provider;
  endpoints?: Endpoint[];
  categories?: Category[];
};

type OperationWithRelations = Operation & {
  endpoint?: Endpoint;
  parameters?: Parameter[];
  responseSchemas?: ResponseSchema[];
};

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

export class MemoryStorage implements IStorage {
  private categories: Category[] = [];
  private providers: Provider[] = [];
  private environments: Environment[] = [];
  private services: Service[] = [];
  private apis: Api[] = [];
  private endpoints: Endpoint[] = [];
  private operations: Operation[] = [];
  private parameters: Parameter[] = [];
  private responseSchemas: ResponseSchema[] = [];
  private providerCategories: Array<{ providerId: string; categoryId: string }> = [];
  private apiCategories: Array<{ apiId: string; categoryId: string }> = [];

  constructor() {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Initialize categories
    const aviationCategory = await this.createCategory({
      name: "Aviation",
      nameAr: "طيران",
      description: "Flight tracking and aviation data services",
      descriptionAr: "خدمات تتبع الطيران وبيانات الطيران"
    });

    const trackingCategory = await this.createCategory({
      name: "Real-time Tracking",
      nameAr: "التتبع الفوري",
      description: "Live tracking and monitoring services",
      descriptionAr: "خدمات التتبع والمراقبة المباشرة"
    });

    const dataCategory = await this.createCategory({
      name: "Data Analytics",
      nameAr: "تحليل البيانات",
      description: "Data analysis and reporting services",
      descriptionAr: "خدمات تحليل البيانات والتقارير"
    });

    // Initialize FlightRadar24 Provider
    const flightradar24 = await this.createProvider({
      name: "Flightradar24",
      shortCode: "FR24",
      websiteUrl: "https://www.flightradar24.com",
      logoUrl: "https://www.flightradar24.com/static/images/fr24-logo.svg",
      documentationUrl: "https://www.flightradar24.com/commercial/api",
      geographicCoverage: "Global",
      dataSources: ["ADS-B", "Radar", "Satellite", "MLAT"],
      historicalDataAvailable: true,
      historicalDataDepth: "7 years",
      realtimeLatency: "< 5 seconds",
      dataGranularity: "Per second",
      dataCompleteness: "95%+",
      dataRefreshRate: "1-5 seconds",
      uptimeGuarantee: "99.9%",
      serviceLevelAgreement: "24/7 support for enterprise",
      supportChannels: ["Email", "Phone", "Live Chat"],
      maintenanceWindows: "Sundays 02:00-04:00 UTC",
      incidentResponseTime: "< 15 minutes",
      pricingModel: "Subscription + Usage",
      freeTierAvailable: true,
      complianceStandards: ["GDPR", "CCPA", "SOC 2"],
      dataRetentionPolicy: "7 years for historical data",
      privacyPolicy: "https://www.flightradar24.com/privacy-policy",
      termsOfService: "https://www.flightradar24.com/terms-and-conditions",
      contactInfo: {
        headquarters: "Stockholm, Sweden",
        phone: "+46 8 120 277 30",
        email: "support@flightradar24.com"
      },
      supportEmail: "api-support@flightradar24.com",
      salesContact: "sales@flightradar24.com",
      technicalContact: "tech-support@flightradar24.com",
      categoryIds: [aviationCategory.id, trackingCategory.id]
    });

    // Initialize FlightAware Provider
    const flightaware = await this.createProvider({
      name: "FlightAware",
      shortCode: "FA",
      websiteUrl: "https://flightaware.com",
      logoUrl: "https://flightaware.com/images/fa_logo.svg",
      documentationUrl: "https://flightaware.com/commercial/aeroapi/",
      geographicCoverage: "Global, strong US coverage",
      dataSources: ["FAA SWIM", "ADS-B", "Radar", "Airline feeds"],
      historicalDataAvailable: true,
      historicalDataDepth: "15+ years",
      realtimeLatency: "< 10 seconds",
      dataGranularity: "Per minute",
      dataCompleteness: "98%+",
      dataRefreshRate: "30-60 seconds",
      uptimeGuarantee: "99.95%",
      serviceLevelAgreement: "Enterprise support available",
      supportChannels: ["Email", "Phone", "Documentation"],
      maintenanceWindows: "Scheduled with 48h notice",
      incidentResponseTime: "< 30 minutes",
      pricingModel: "API calls + Subscription",
      freeTierAvailable: true,
      complianceStandards: ["GDPR", "CCPA", "HIPAA"],
      dataRetentionPolicy: "15 years historical",
      privacyPolicy: "https://flightaware.com/about/privacy",
      termsOfService: "https://flightaware.com/about/termsofuse",
      contactInfo: {
        headquarters: "Houston, Texas, USA",
        phone: "+1 713-588-6100",
        email: "support@flightaware.com"
      },
      supportEmail: "aeroapi-support@flightaware.com",
      salesContact: "sales@flightaware.com",
      technicalContact: "api-support@flightaware.com",
      categoryIds: [aviationCategory.id, dataCategory.id]
    });

    // Initialize Planespotters Provider
    const planespotters = await this.createProvider({
      name: "Planespotters",
      shortCode: "PS",
      websiteUrl: "https://www.planespotters.net",
      logoUrl: "https://www.planespotters.net/images/logo.png",
      documentationUrl: "https://api.planespotters.net/",
      geographicCoverage: "Global",
      dataSources: ["Community photos", "Aircraft databases", "Registration data"],
      historicalDataAvailable: true,
      historicalDataDepth: "20+ years",
      realtimeLatency: "Near real-time",
      dataGranularity: "Per aircraft",
      dataCompleteness: "90%+",
      dataRefreshRate: "Daily updates",
      uptimeGuarantee: "99.5%",
      serviceLevelAgreement: "Community support",
      supportChannels: ["Email", "Forum"],
      maintenanceWindows: "As needed",
      incidentResponseTime: "< 2 hours",
      pricingModel: "Free + Premium features",
      freeTierAvailable: true,
      complianceStandards: ["GDPR"],
      dataRetentionPolicy: "Permanent for public data",
      privacyPolicy: "https://www.planespotters.net/privacy",
      termsOfService: "https://www.planespotters.net/terms",
      contactInfo: {
        headquarters: "Amsterdam, Netherlands",
        email: "info@planespotters.net"
      },
      supportEmail: "api@planespotters.net",
      salesContact: "premium@planespotters.net",
      technicalContact: "support@planespotters.net",
      categoryIds: [aviationCategory.id]
    });

    // Create environments for FlightRadar24
    const fr24ProdEnv = await this.createEnvironment({
      providerId: flightradar24.id,
      name: "production",
      displayName: "Production",
      baseUrl: "https://api.flightradar24.com/v1",
      description: "Production environment for live data",
      isActive: true
    });

    const fr24SandboxEnv = await this.createEnvironment({
      providerId: flightradar24.id,
      name: "sandbox",
      displayName: "Sandbox",
      baseUrl: "https://sandbox-api.flightradar24.com/v1",
      description: "Testing environment with sample data",
      isActive: true
    });

    // Create services for FlightRadar24
    const fr24FlightService = await this.createService({
      providerId: flightradar24.id,
      name: "flight-tracking",
      displayName: "Flight Tracking",
      description: "Real-time flight tracking and monitoring",
      icon: "plane",
      version: "1.0",
      isActive: true
    });

    const fr24AircraftService = await this.createService({
      providerId: flightradar24.id,
      name: "aircraft-data",
      displayName: "Aircraft Data",
      description: "Aircraft information and specifications",
      icon: "database",
      version: "1.0",
      isActive: true
    });

    // Create APIs for FlightRadar24 Flight Tracking Service
    const fr24LiveFlightsApi = await this.createApi({
      serviceId: fr24FlightService.id,
      providerId: flightradar24.id,
      name: "live-flights",
      displayName: "Live Flights API",
      description: "Get real-time flight positions and status",
      version: "1.0",
      basePath: "/flights",
      authType: "API Key",
      rateLimit: "1000 requests/hour",
      supportedFormats: ["JSON", "XML"],
      apiDesignStyle: "REST",
      documentationUrl: "https://www.flightradar24.com/commercial/api/live-flights",
      swaggerUrl: "https://api.flightradar24.com/v1/swagger.json",
      categoryIds: [trackingCategory.id]
    });

    // Create endpoints for Live Flights API
    const flightsEndpoint = await this.createEndpoint({
      apiId: fr24LiveFlightsApi.id,
      name: "flights",
      path: "/flights",
      description: "Get all live flights",
      isActive: true
    });

    const flightByIdEndpoint = await this.createEndpoint({
      apiId: fr24LiveFlightsApi.id,
      name: "flight-by-id",
      path: "/flights/{flight_id}",
      description: "Get specific flight details",
      isActive: true
    });

    // Create operations for flights endpoint
    const getFlightsOperation = await this.createOperation({
      endpointId: flightsEndpoint.id,
      method: "GET",
      operationId: "getFlights",
      summary: "Get live flights",
      description: "Retrieve real-time information about all active flights",
      authRequired: true,
      scopes: ["flights:read"],
      rateLimit: "100 requests/minute",
      defaultResponseFormat: "json",
      cacheable: true,
      cacheTime: 30,
      isActive: true
    });

    // Create parameters for getFlights operation
    await this.createParameter({
      operationId: getFlightsOperation.id,
      name: "bounds",
      type: "string",
      location: "query",
      description: "Geographic bounds in format: lat1,lon1,lat2,lon2",
      required: false,
      example: "40.0,-74.0,41.0,-73.0",
      pattern: "^-?\\d+\\.\\d+,-?\\d+\\.\\d+,-?\\d+\\.\\d+,-?\\d+\\.\\d+$"
    });

    await this.createParameter({
      operationId: getFlightsOperation.id,
      name: "aircraft_type",
      type: "string",
      location: "query",
      description: "Filter by aircraft type (ICAO code)",
      required: false,
      example: "B738",
      maxLength: 4
    });

    await this.createParameter({
      operationId: getFlightsOperation.id,
      name: "airline",
      type: "string",
      location: "query",
      description: "Filter by airline ICAO code",
      required: false,
      example: "UAL",
      maxLength: 3
    });

    await this.createParameter({
      operationId: getFlightsOperation.id,
      name: "limit",
      type: "integer",
      location: "query",
      description: "Maximum number of flights to return",
      required: false,
      defaultValue: "100",
      minimum: 1,
      maximum: 1000
    });

    // Create response schema for getFlights operation
    await this.createResponseSchema({
      operationId: getFlightsOperation.id,
      statusCode: 200,
      mediaType: "application/json",
      schema: {
        type: "object",
        properties: {
          flights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                flight_id: { type: "string", example: "2b4f6d0e" },
                callsign: { type: "string", example: "UAL1234" },
                aircraft_type: { type: "string", example: "B738" },
                airline_icao: { type: "string", example: "UAL" },
                origin_airport: { type: "string", example: "KJFK" },
                destination_airport: { type: "string", example: "KLAX" },
                latitude: { type: "number", example: 40.7128 },
                longitude: { type: "number", example: -74.0060 },
                altitude: { type: "integer", example: 35000 },
                speed: { type: "integer", example: 450 },
                heading: { type: "integer", example: 270 },
                status: { type: "string", example: "en-route" },
                last_updated: { type: "string", format: "date-time" }
              }
            }
          },
          total_count: { type: "integer", example: 150 },
          timestamp: { type: "string", format: "date-time" }
        }
      },
      description: "List of live flights",
      example: {
        flights: [
          {
            flight_id: "2b4f6d0e",
            callsign: "UAL1234",
            aircraft_type: "B738",
            airline_icao: "UAL",
            origin_airport: "KJFK",
            destination_airport: "KLAX",
            latitude: 40.7128,
            longitude: -74.0060,
            altitude: 35000,
            speed: 450,
            heading: 270,
            status: "en-route",
            last_updated: "2024-01-15T14:30:00Z"
          }
        ],
        total_count: 150,
        timestamp: "2024-01-15T14:30:00Z"
      }
    });

    // Add similar data for FlightAware
    const faFlightService = await this.createService({
      providerId: flightaware.id,
      name: "aeroapi",
      displayName: "AeroAPI",
      description: "Comprehensive flight data and analytics",
      icon: "analytics",
      version: "4.0",
      isActive: true
    });

    const faFlightDataApi = await this.createApi({
      serviceId: faFlightService.id,
      providerId: flightaware.id,
      name: "flight-data",
      displayName: "Flight Data API",
      description: "Historical and real-time flight information",
      version: "4.0",
      basePath: "/aeroapi",
      authType: "API Key",
      rateLimit: "500 requests/month",
      supportedFormats: ["JSON"],
      apiDesignStyle: "REST",
      documentationUrl: "https://flightaware.com/commercial/aeroapi/",
      categoryIds: [aviationCategory.id, dataCategory.id]
    });

    // Add Planespotters data
    const psPhotosService = await this.createService({
      providerId: planespotters.id,
      name: "photos",
      displayName: "Aircraft Photos",
      description: "Aircraft photography and spotting data",
      icon: "camera",
      version: "2.0",
      isActive: true
    });

    const psPhotosApi = await this.createApi({
      serviceId: psPhotosService.id,
      providerId: planespotters.id,
      name: "aircraft-photos",
      displayName: "Aircraft Photos API",
      description: "High-quality aircraft photographs and data",
      version: "2.0",
      basePath: "/photos",
      authType: "API Key",
      rateLimit: "1000 requests/day",
      supportedFormats: ["JSON"],
      apiDesignStyle: "REST",
      documentationUrl: "https://api.planespotters.net/docs",
      categoryIds: [aviationCategory.id]
    });
  }

  // Helper method to generate timestamps
  private now() {
    return new Date();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCategory(category: z.infer<typeof insertCategorySchema>): Promise<Category> {
    const now = this.now();
    const newCategory: Category = {
      id: nanoid(),
      ...category,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<z.infer<typeof insertCategorySchema>>): Promise<Category> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    
    this.categories[index] = {
      ...this.categories[index],
      ...category,
      updatedAt: this.now(),
    };
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    this.categories.splice(index, 1);
    
    // Remove category associations
    this.providerCategories = this.providerCategories.filter(pc => pc.categoryId !== id);
    this.apiCategories = this.apiCategories.filter(ac => ac.categoryId !== id);
  }

  // Providers
  async getProviders(): Promise<ProviderWithRelations[]> {
    return this.providers.map(provider => ({
      ...provider,
      environments: this.environments.filter(e => e.providerId === provider.id),
      services: this.services.filter(s => s.providerId === provider.id).map(service => ({
        ...service,
        provider,
        apis: this.apis.filter(a => a.serviceId === service.id).map(api => ({
          ...api,
          service,
          provider,
          endpoints: this.endpoints.filter(e => e.apiId === api.id),
          categories: this.apiCategories
            .filter(ac => ac.apiId === api.id)
            .map(ac => this.categories.find(c => c.id === ac.categoryId)!)
            .filter(Boolean),
        })),
      })),
      categories: this.providerCategories
        .filter(pc => pc.providerId === provider.id)
        .map(pc => this.categories.find(c => c.id === pc.categoryId)!)
        .filter(Boolean),
    }));
  }

  async getProvider(id: string): Promise<ProviderWithRelations | undefined> {
    const provider = this.providers.find(p => p.id === id);
    if (!provider) return undefined;

    return {
      ...provider,
      environments: this.environments.filter(e => e.providerId === id),
      services: this.services.filter(s => s.providerId === id).map(service => ({
        ...service,
        provider,
        apis: this.apis.filter(a => a.serviceId === service.id).map(api => ({
          ...api,
          service,
          provider,
          endpoints: this.endpoints.filter(e => e.apiId === api.id),
          categories: this.apiCategories
            .filter(ac => ac.apiId === api.id)
            .map(ac => this.categories.find(c => c.id === ac.categoryId)!)
            .filter(Boolean),
        })),
      })),
      categories: this.providerCategories
        .filter(pc => pc.providerId === id)
        .map(pc => this.categories.find(c => c.id === pc.categoryId)!)
        .filter(Boolean),
    };
  }

  async createProvider(provider: z.infer<typeof insertProviderSchema> & { categoryIds?: string[] }): Promise<Provider> {
    const { categoryIds, ...providerData } = provider;
    const now = this.now();
    const newProvider: Provider = {
      id: nanoid(),
      ...providerData,
      createdAt: now,
      updatedAt: now,
    };
    this.providers.push(newProvider);

    if (categoryIds && categoryIds.length > 0) {
      this.providerCategories.push(
        ...categoryIds.map(categoryId => ({
          providerId: newProvider.id,
          categoryId,
        }))
      );
    }

    return newProvider;
  }

  async updateProvider(id: string, provider: Partial<z.infer<typeof insertProviderSchema>> & { categoryIds?: string[] }): Promise<Provider> {
    const { categoryIds, ...providerData } = provider;
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Provider not found");

    this.providers[index] = {
      ...this.providers[index],
      ...providerData,
      updatedAt: this.now(),
    };

    if (categoryIds !== undefined) {
      // Remove existing associations
      this.providerCategories = this.providerCategories.filter(pc => pc.providerId !== id);
      // Add new associations
      if (categoryIds.length > 0) {
        this.providerCategories.push(
          ...categoryIds.map(categoryId => ({
            providerId: id,
            categoryId,
          }))
        );
      }
    }

    return this.providers[index];
  }

  async deleteProvider(id: string): Promise<void> {
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Provider not found");
    this.providers.splice(index, 1);
    
    // Remove related data
    this.environments = this.environments.filter(e => e.providerId !== id);
    this.services = this.services.filter(s => s.providerId !== id);
    this.apis = this.apis.filter(a => a.providerId !== id);
    this.providerCategories = this.providerCategories.filter(pc => pc.providerId !== id);
  }

  // Environments
  async getEnvironments(providerId: string): Promise<Environment[]> {
    return this.environments.filter(e => e.providerId === providerId);
  }

  async createEnvironment(environment: z.infer<typeof insertEnvironmentSchema>): Promise<Environment> {
    const now = this.now();
    const newEnvironment: Environment = {
      id: nanoid(),
      ...environment,
      createdAt: now,
      updatedAt: now,
    };
    this.environments.push(newEnvironment);
    return newEnvironment;
  }

  async updateEnvironment(id: string, environment: Partial<z.infer<typeof insertEnvironmentSchema>>): Promise<Environment> {
    const index = this.environments.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Environment not found");
    
    this.environments[index] = {
      ...this.environments[index],
      ...environment,
      updatedAt: this.now(),
    };
    return this.environments[index];
  }

  async deleteEnvironment(id: string): Promise<void> {
    const index = this.environments.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Environment not found");
    this.environments.splice(index, 1);
  }

  // Services
  async getServices(providerId: string): Promise<ServiceWithRelations[]> {
    const provider = this.providers.find(p => p.id === providerId);
    return this.services.filter(s => s.providerId === providerId).map(service => ({
      ...service,
      provider,
      apis: this.apis.filter(a => a.serviceId === service.id).map(api => ({
        ...api,
        service,
        provider,
        endpoints: this.endpoints.filter(e => e.apiId === api.id),
        categories: this.apiCategories
          .filter(ac => ac.apiId === api.id)
          .map(ac => this.categories.find(c => c.id === ac.categoryId)!)
          .filter(Boolean),
      })),
    }));
  }

  async getService(id: string): Promise<ServiceWithRelations | undefined> {
    const service = this.services.find(s => s.id === id);
    if (!service) return undefined;

    const provider = this.providers.find(p => p.id === service.providerId);
    return {
      ...service,
      provider,
      apis: this.apis.filter(a => a.serviceId === id).map(api => ({
        ...api,
        service,
        provider,
        endpoints: this.endpoints.filter(e => e.apiId === api.id),
        categories: this.apiCategories
          .filter(ac => ac.apiId === api.id)
          .map(ac => this.categories.find(c => c.id === ac.categoryId)!)
          .filter(Boolean),
      })),
    };
  }

  async createService(service: z.infer<typeof insertServiceSchema>): Promise<Service> {
    const now = this.now();
    const newService: Service = {
      id: nanoid(),
      ...service,
      createdAt: now,
      updatedAt: now,
    };
    this.services.push(newService);
    return newService;
  }

  async updateService(id: string, service: Partial<z.infer<typeof insertServiceSchema>>): Promise<Service> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Service not found");
    
    this.services[index] = {
      ...this.services[index],
      ...service,
      updatedAt: this.now(),
    };
    return this.services[index];
  }

  async deleteService(id: string): Promise<void> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Service not found");
    this.services.splice(index, 1);
    
    // Remove related APIs
    this.apis = this.apis.filter(a => a.serviceId !== id);
  }

  // APIs
  async getApis(serviceId?: string, providerId?: string): Promise<ApiWithRelations[]> {
    let filteredApis = this.apis;
    
    if (serviceId) {
      filteredApis = filteredApis.filter(a => a.serviceId === serviceId);
    }
    if (providerId) {
      filteredApis = filteredApis.filter(a => a.providerId === providerId);
    }

    return filteredApis.map(api => {
      const service = this.services.find(s => s.id === api.serviceId);
      const provider = this.providers.find(p => p.id === api.providerId);
      return {
        ...api,
        service,
        provider,
        endpoints: this.endpoints.filter(e => e.apiId === api.id),
        categories: this.apiCategories
          .filter(ac => ac.apiId === api.id)
          .map(ac => this.categories.find(c => c.id === ac.categoryId)!)
          .filter(Boolean),
      };
    });
  }

  async getApi(id: string): Promise<ApiWithRelations | undefined> {
    const api = this.apis.find(a => a.id === id);
    if (!api) return undefined;

    const service = this.services.find(s => s.id === api.serviceId);
    const provider = this.providers.find(p => p.id === api.providerId);
    return {
      ...api,
      service,
      provider,
      endpoints: this.endpoints.filter(e => e.apiId === id),
      categories: this.apiCategories
        .filter(ac => ac.apiId === id)
        .map(ac => this.categories.find(c => c.id === ac.categoryId)!)
        .filter(Boolean),
    };
  }

  async createApi(api: z.infer<typeof insertApiSchema> & { categoryIds?: string[] }): Promise<Api> {
    const { categoryIds, ...apiData } = api;
    const now = this.now();
    const newApi: Api = {
      id: nanoid(),
      ...apiData,
      createdAt: now,
      updatedAt: now,
    };
    this.apis.push(newApi);

    if (categoryIds && categoryIds.length > 0) {
      this.apiCategories.push(
        ...categoryIds.map(categoryId => ({
          apiId: newApi.id,
          categoryId,
        }))
      );
    }

    return newApi;
  }

  async updateApi(id: string, api: Partial<z.infer<typeof insertApiSchema>> & { categoryIds?: string[] }): Promise<Api> {
    const { categoryIds, ...apiData } = api;
    const index = this.apis.findIndex(a => a.id === id);
    if (index === -1) throw new Error("API not found");

    this.apis[index] = {
      ...this.apis[index],
      ...apiData,
      updatedAt: this.now(),
    };

    if (categoryIds !== undefined) {
      // Remove existing associations
      this.apiCategories = this.apiCategories.filter(ac => ac.apiId !== id);
      // Add new associations
      if (categoryIds.length > 0) {
        this.apiCategories.push(
          ...categoryIds.map(categoryId => ({
            apiId: id,
            categoryId,
          }))
        );
      }
    }

    return this.apis[index];
  }

  async deleteApi(id: string): Promise<void> {
    const index = this.apis.findIndex(a => a.id === id);
    if (index === -1) throw new Error("API not found");
    this.apis.splice(index, 1);
    
    // Remove related data
    this.endpoints = this.endpoints.filter(e => e.apiId !== id);
    this.apiCategories = this.apiCategories.filter(ac => ac.apiId !== id);
  }

  // Endpoints
  async getEndpoints(apiId: string): Promise<Endpoint[]> {
    return this.endpoints.filter(e => e.apiId === apiId);
  }

  async createEndpoint(endpoint: z.infer<typeof insertEndpointSchema>): Promise<Endpoint> {
    const now = this.now();
    const newEndpoint: Endpoint = {
      id: nanoid(),
      ...endpoint,
      createdAt: now,
      updatedAt: now,
    };
    this.endpoints.push(newEndpoint);
    return newEndpoint;
  }

  async updateEndpoint(id: string, endpoint: Partial<z.infer<typeof insertEndpointSchema>>): Promise<Endpoint> {
    const index = this.endpoints.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Endpoint not found");
    
    this.endpoints[index] = {
      ...this.endpoints[index],
      ...endpoint,
      updatedAt: this.now(),
    };
    return this.endpoints[index];
  }

  async deleteEndpoint(id: string): Promise<void> {
    const index = this.endpoints.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Endpoint not found");
    this.endpoints.splice(index, 1);
    
    // Remove related operations
    this.operations = this.operations.filter(o => o.endpointId !== id);
  }

  // Operations
  async getOperations(endpointId: string): Promise<OperationWithRelations[]> {
    const endpoint = this.endpoints.find(e => e.id === endpointId);
    return this.operations.filter(o => o.endpointId === endpointId).map(operation => ({
      ...operation,
      endpoint,
      parameters: this.parameters.filter(p => p.operationId === operation.id),
      responseSchemas: this.responseSchemas.filter(rs => rs.operationId === operation.id),
    }));
  }

  async getOperation(id: string): Promise<OperationWithRelations | undefined> {
    const operation = this.operations.find(o => o.id === id);
    if (!operation) return undefined;

    const endpoint = this.endpoints.find(e => e.id === operation.endpointId);
    return {
      ...operation,
      endpoint,
      parameters: this.parameters.filter(p => p.operationId === id),
      responseSchemas: this.responseSchemas.filter(rs => rs.operationId === id),
    };
  }

  async createOperation(operation: z.infer<typeof insertOperationSchema>): Promise<Operation> {
    const now = this.now();
    const newOperation: Operation = {
      id: nanoid(),
      ...operation,
      createdAt: now,
      updatedAt: now,
    };
    this.operations.push(newOperation);
    return newOperation;
  }

  async updateOperation(id: string, operation: Partial<z.infer<typeof insertOperationSchema>>): Promise<Operation> {
    const index = this.operations.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Operation not found");
    
    this.operations[index] = {
      ...this.operations[index],
      ...operation,
      updatedAt: this.now(),
    };
    return this.operations[index];
  }

  async deleteOperation(id: string): Promise<void> {
    const index = this.operations.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Operation not found");
    this.operations.splice(index, 1);
    
    // Remove related data
    this.parameters = this.parameters.filter(p => p.operationId !== id);
    this.responseSchemas = this.responseSchemas.filter(rs => rs.operationId !== id);
  }

  // Parameters
  async getParameters(operationId: string): Promise<Parameter[]> {
    return this.parameters.filter(p => p.operationId === operationId);
  }

  async createParameter(parameter: z.infer<typeof insertParameterSchema>): Promise<Parameter> {
    const now = this.now();
    const newParameter: Parameter = {
      id: nanoid(),
      ...parameter,
      createdAt: now,
      updatedAt: now,
    };
    this.parameters.push(newParameter);
    return newParameter;
  }

  async updateParameter(id: string, parameter: Partial<z.infer<typeof insertParameterSchema>>): Promise<Parameter> {
    const index = this.parameters.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Parameter not found");
    
    this.parameters[index] = {
      ...this.parameters[index],
      ...parameter,
      updatedAt: this.now(),
    };
    return this.parameters[index];
  }

  async deleteParameter(id: string): Promise<void> {
    const index = this.parameters.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Parameter not found");
    this.parameters.splice(index, 1);
  }

  // Response Schemas
  async getResponseSchemas(operationId: string): Promise<ResponseSchema[]> {
    return this.responseSchemas.filter(rs => rs.operationId === operationId);
  }

  async createResponseSchema(schema: z.infer<typeof insertResponseSchemaSchema>): Promise<ResponseSchema> {
    const now = this.now();
    const newSchema: ResponseSchema = {
      id: nanoid(),
      ...schema,
      createdAt: now,
      updatedAt: now,
    };
    this.responseSchemas.push(newSchema);
    return newSchema;
  }

  async updateResponseSchema(id: string, schema: Partial<z.infer<typeof insertResponseSchemaSchema>>): Promise<ResponseSchema> {
    const index = this.responseSchemas.findIndex(rs => rs.id === id);
    if (index === -1) throw new Error("Response schema not found");
    
    this.responseSchemas[index] = {
      ...this.responseSchemas[index],
      ...schema,
      updatedAt: this.now(),
    };
    return this.responseSchemas[index];
  }

  async deleteResponseSchema(id: string): Promise<void> {
    const index = this.responseSchemas.findIndex(rs => rs.id === id);
    if (index === -1) throw new Error("Response schema not found");
    this.responseSchemas.splice(index, 1);
  }

  // Search
  async search(query: string): Promise<{
    providers: ProviderWithRelations[];
    services: ServiceWithRelations[];
    apis: ApiWithRelations[];
    operations: OperationWithRelations[];
  }> {
    const lowerQuery = query.toLowerCase();
    
    const providers = await this.getProviders();
    const filteredProviders = providers.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.shortCode.toLowerCase().includes(lowerQuery) ||
      p.websiteUrl.toLowerCase().includes(lowerQuery)
    );

    const services = await Promise.all(
      this.providers.map(p => this.getServices(p.id))
    ).then(results => results.flat());
    const filteredServices = services.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.displayName.toLowerCase().includes(lowerQuery) ||
      (s.description && s.description.toLowerCase().includes(lowerQuery))
    );

    const apis = await this.getApis();
    const filteredApis = apis.filter(a =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.displayName.toLowerCase().includes(lowerQuery) ||
      (a.description && a.description.toLowerCase().includes(lowerQuery))
    );

    const allOperations = await Promise.all(
      this.endpoints.map(e => this.getOperations(e.id))
    ).then(results => results.flat());
    const filteredOperations = allOperations.filter(o =>
      o.method.toLowerCase().includes(lowerQuery) ||
      (o.summary && o.summary.toLowerCase().includes(lowerQuery)) ||
      (o.description && o.description.toLowerCase().includes(lowerQuery))
    );

    return {
      providers: filteredProviders,
      services: filteredServices,
      apis: filteredApis,
      operations: filteredOperations,
    };
  }
}

export const storage = new MemoryStorage();