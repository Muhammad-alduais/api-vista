import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema, insertProviderSchema, insertApiSchema, insertEndpointSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Providers routes
  app.get("/api/providers", async (req, res) => {
    try {
      const { search } = req.query;
      const providers = await storage.getProviders(search as string);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const provider = await storage.getProviderById(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  app.post("/api/providers", async (req, res) => {
    try {
      const { categoryIds, ...providerData } = req.body;
      const validatedData = insertProviderSchema.parse(providerData);
      const provider = await storage.createProvider(validatedData, categoryIds || []);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid provider data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create provider" });
      }
    }
  });

  app.put("/api/providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryIds, ...providerData } = req.body;
      const validatedData = insertProviderSchema.partial().parse(providerData);
      const provider = await storage.updateProvider(id, validatedData, categoryIds);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid provider data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update provider" });
      }
    }
  });

  app.delete("/api/providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProvider(id);
      
      if (!success) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete provider" });
    }
  });

  // APIs routes
  app.get("/api/providers/:providerId/apis", async (req, res) => {
    try {
      const { providerId } = req.params;
      const apis = await storage.getApisByProviderId(providerId);
      res.json(apis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch APIs" });
    }
  });

  app.get("/api/apis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const api = await storage.getApiById(id);
      
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.json(api);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API" });
    }
  });

  app.post("/api/apis", async (req, res) => {
    try {
      const { categoryIds, ...apiData } = req.body;
      const validatedData = insertApiSchema.parse(apiData);
      const api = await storage.createApi(validatedData, categoryIds || []);
      res.status(201).json(api);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid API data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create API" });
      }
    }
  });

  app.put("/api/apis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryIds, ...apiData } = req.body;
      const validatedData = insertApiSchema.partial().parse(apiData);
      const api = await storage.updateApi(id, validatedData, categoryIds);
      
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.json(api);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid API data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update API" });
      }
    }
  });

  app.delete("/api/apis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteApi(id);
      
      if (!success) {
        return res.status(404).json({ message: "API not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete API" });
    }
  });

  // Endpoints routes
  app.get("/api/apis/:apiId/endpoints", async (req, res) => {
    try {
      const { apiId } = req.params;
      const endpoints = await storage.getEndpointsByApiId(apiId);
      res.json(endpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch endpoints" });
    }
  });

  app.get("/api/endpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const endpoint = await storage.getEndpointById(id);
      
      if (!endpoint) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      
      res.json(endpoint);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch endpoint" });
    }
  });

  app.post("/api/endpoints", async (req, res) => {
    try {
      const endpointData = insertEndpointSchema.parse(req.body);
      const endpoint = await storage.createEndpoint(endpointData);
      res.status(201).json(endpoint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid endpoint data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create endpoint" });
      }
    }
  });

  app.put("/api/endpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const endpointData = insertEndpointSchema.partial().parse(req.body);
      const endpoint = await storage.updateEndpoint(id, endpointData);
      
      if (!endpoint) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      
      res.json(endpoint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid endpoint data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update endpoint" });
      }
    }
  });

  app.delete("/api/endpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEndpoint(id);
      
      if (!success) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete endpoint" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchAll(q);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Export route
  app.get("/api/export", async (req, res) => {
    try {
      const { format } = req.query;
      const data = await storage.exportData();
      
      if (format === "csv") {
        // Convert to CSV format (simplified)
        const csvContent = [
          "Provider Name,Short Code,Website,APIs Count,Categories",
          ...data.providers.map(p => 
            `"${p.name}","${p.shortCode}","${p.websiteUrl}",${p.apis.length},"${p.categories.map(c => c.name).join(', ')}"`
          )
        ].join("\n");
        
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=api-catalog.csv");
        res.send(csvContent);
      } else {
        // Default to JSON
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=api-catalog.json");
        res.json(data);
      }
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
