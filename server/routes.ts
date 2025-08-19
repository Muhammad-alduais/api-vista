import { Request, Response } from 'express';
import { storage } from './storage';
import { 
  insertCategorySchema, insertProviderSchema, insertEnvironmentSchema,
  insertServiceSchema, insertApiSchema, insertEndpointSchema,
  insertOperationSchema, insertParameterSchema, insertResponseSchemaSchema
} from '@shared/schema';
import { z } from 'zod';

// Categories routes
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const validatedData = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(validatedData);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertCategorySchema.partial().parse(req.body);
    const category = await storage.updateCategory(id, validatedData);
    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

// Providers routes
export async function getProviders(req: Request, res: Response) {
  try {
    const providers = await storage.getProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
}

export async function getProvider(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const provider = await storage.getProvider(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
}

export async function createProvider(req: Request, res: Response) {
  try {
    const { categoryIds, ...providerData } = req.body;
    const validatedData = insertProviderSchema.parse(providerData);
    const provider = await storage.createProvider({ ...validatedData, categoryIds });
    res.status(201).json(provider);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating provider:', error);
      res.status(500).json({ error: 'Failed to create provider' });
    }
  }
}

export async function updateProvider(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { categoryIds, ...providerData } = req.body;
    const validatedData = insertProviderSchema.partial().parse(providerData);
    const provider = await storage.updateProvider(id, { ...validatedData, categoryIds });
    res.json(provider);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating provider:', error);
      res.status(500).json({ error: 'Failed to update provider' });
    }
  }
}

export async function deleteProvider(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteProvider(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ error: 'Failed to delete provider' });
  }
}

// Environments routes
export async function getEnvironments(req: Request, res: Response) {
  try {
    const { providerId } = req.params;
    const environments = await storage.getEnvironments(providerId);
    res.json(environments);
  } catch (error) {
    console.error('Error fetching environments:', error);
    res.status(500).json({ error: 'Failed to fetch environments' });
  }
}

export async function createEnvironment(req: Request, res: Response) {
  try {
    const validatedData = insertEnvironmentSchema.parse(req.body);
    const environment = await storage.createEnvironment(validatedData);
    res.status(201).json(environment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating environment:', error);
      res.status(500).json({ error: 'Failed to create environment' });
    }
  }
}

export async function updateEnvironment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertEnvironmentSchema.partial().parse(req.body);
    const environment = await storage.updateEnvironment(id, validatedData);
    res.json(environment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating environment:', error);
      res.status(500).json({ error: 'Failed to update environment' });
    }
  }
}

export async function deleteEnvironment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteEnvironment(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting environment:', error);
    res.status(500).json({ error: 'Failed to delete environment' });
  }
}

// Services routes
export async function getServices(req: Request, res: Response) {
  try {
    const { providerId } = req.params;
    const services = await storage.getServices(providerId);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
}

export async function getService(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const service = await storage.getService(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
}

export async function createService(req: Request, res: Response) {
  try {
    const validatedData = insertServiceSchema.parse(req.body);
    const service = await storage.createService(validatedData);
    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertServiceSchema.partial().parse(req.body);
    const service = await storage.updateService(id, validatedData);
    res.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteService(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
}

// APIs routes
export async function getApis(req: Request, res: Response) {
  try {
    const { serviceId, providerId } = req.query;
    const apis = await storage.getApis(serviceId as string, providerId as string);
    res.json(apis);
  } catch (error) {
    console.error('Error fetching APIs:', error);
    res.status(500).json({ error: 'Failed to fetch APIs' });
  }
}

export async function getApi(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const api = await storage.getApi(id);
    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }
    res.json(api);
  } catch (error) {
    console.error('Error fetching API:', error);
    res.status(500).json({ error: 'Failed to fetch API' });
  }
}

export async function createApi(req: Request, res: Response) {
  try {
    const { categoryIds, ...apiData } = req.body;
    const validatedData = insertApiSchema.parse(apiData);
    const api = await storage.createApi({ ...validatedData, categoryIds });
    res.status(201).json(api);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating API:', error);
      res.status(500).json({ error: 'Failed to create API' });
    }
  }
}

export async function updateApi(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { categoryIds, ...apiData } = req.body;
    const validatedData = insertApiSchema.partial().parse(apiData);
    const api = await storage.updateApi(id, { ...validatedData, categoryIds });
    res.json(api);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating API:', error);
      res.status(500).json({ error: 'Failed to update API' });
    }
  }
}

export async function deleteApi(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteApi(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting API:', error);
    res.status(500).json({ error: 'Failed to delete API' });
  }
}

// Endpoints routes
export async function getEndpoints(req: Request, res: Response) {
  try {
    const { apiId } = req.params;
    const endpoints = await storage.getEndpoints(apiId);
    res.json(endpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ error: 'Failed to fetch endpoints' });
  }
}

export async function createEndpoint(req: Request, res: Response) {
  try {
    const validatedData = insertEndpointSchema.parse(req.body);
    const endpoint = await storage.createEndpoint(validatedData);
    res.status(201).json(endpoint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating endpoint:', error);
      res.status(500).json({ error: 'Failed to create endpoint' });
    }
  }
}

export async function updateEndpoint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertEndpointSchema.partial().parse(req.body);
    const endpoint = await storage.updateEndpoint(id, validatedData);
    res.json(endpoint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating endpoint:', error);
      res.status(500).json({ error: 'Failed to update endpoint' });
    }
  }
}

export async function deleteEndpoint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteEndpoint(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    res.status(500).json({ error: 'Failed to delete endpoint' });
  }
}

// Operations routes
export async function getOperations(req: Request, res: Response) {
  try {
    const { endpointId } = req.params;
    const operations = await storage.getOperations(endpointId);
    res.json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ error: 'Failed to fetch operations' });
  }
}

export async function getOperation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const operation = await storage.getOperation(id);
    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    res.json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    res.status(500).json({ error: 'Failed to fetch operation' });
  }
}

export async function createOperation(req: Request, res: Response) {
  try {
    const validatedData = insertOperationSchema.parse(req.body);
    const operation = await storage.createOperation(validatedData);
    res.status(201).json(operation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating operation:', error);
      res.status(500).json({ error: 'Failed to create operation' });
    }
  }
}

export async function updateOperation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertOperationSchema.partial().parse(req.body);
    const operation = await storage.updateOperation(id, validatedData);
    res.json(operation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating operation:', error);
      res.status(500).json({ error: 'Failed to update operation' });
    }
  }
}

export async function deleteOperation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteOperation(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting operation:', error);
    res.status(500).json({ error: 'Failed to delete operation' });
  }
}

// Parameters routes
export async function getParameters(req: Request, res: Response) {
  try {
    const { operationId } = req.params;
    const parameters = await storage.getParameters(operationId);
    res.json(parameters);
  } catch (error) {
    console.error('Error fetching parameters:', error);
    res.status(500).json({ error: 'Failed to fetch parameters' });
  }
}

export async function createParameter(req: Request, res: Response) {
  try {
    const validatedData = insertParameterSchema.parse(req.body);
    const parameter = await storage.createParameter(validatedData);
    res.status(201).json(parameter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating parameter:', error);
      res.status(500).json({ error: 'Failed to create parameter' });
    }
  }
}

export async function updateParameter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertParameterSchema.partial().parse(req.body);
    const parameter = await storage.updateParameter(id, validatedData);
    res.json(parameter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating parameter:', error);
      res.status(500).json({ error: 'Failed to update parameter' });
    }
  }
}

export async function deleteParameter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteParameter(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting parameter:', error);
    res.status(500).json({ error: 'Failed to delete parameter' });
  }
}

// Response Schemas routes
export async function getResponseSchemas(req: Request, res: Response) {
  try {
    const { operationId } = req.params;
    const schemas = await storage.getResponseSchemas(operationId);
    res.json(schemas);
  } catch (error) {
    console.error('Error fetching response schemas:', error);
    res.status(500).json({ error: 'Failed to fetch response schemas' });
  }
}

export async function createResponseSchema(req: Request, res: Response) {
  try {
    const validatedData = insertResponseSchemaSchema.parse(req.body);
    const schema = await storage.createResponseSchema(validatedData);
    res.status(201).json(schema);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error creating response schema:', error);
      res.status(500).json({ error: 'Failed to create response schema' });
    }
  }
}

export async function updateResponseSchema(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertResponseSchemaSchema.partial().parse(req.body);
    const schema = await storage.updateResponseSchema(id, validatedData);
    res.json(schema);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else {
      console.error('Error updating response schema:', error);
      res.status(500).json({ error: 'Failed to update response schema' });
    }
  }
}

export async function deleteResponseSchema(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await storage.deleteResponseSchema(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting response schema:', error);
    res.status(500).json({ error: 'Failed to delete response schema' });
  }
}

// Search route
export async function search(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await storage.search(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
}