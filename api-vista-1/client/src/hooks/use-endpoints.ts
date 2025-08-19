import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Endpoint, EndpointWithRelations, InsertEndpoint } from "@shared/schema";

export function useEndpointsByApi(apiId: string) {
  return useQuery<Endpoint[]>({
    queryKey: ["/api/apis", apiId, "endpoints"],
    enabled: !!apiId,
  });
}

export function useEndpoint(id: string) {
  return useQuery<EndpointWithRelations>({
    queryKey: ["/api/endpoints", id],
    enabled: !!id,
  });
}

export function useCreateEndpoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertEndpoint) => {
      const response = await apiRequest("POST", "/api/endpoints", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/apis", variables.apiId, "endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

export function useUpdateEndpoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertEndpoint> & { id: string }) => {
      const response = await apiRequest("PUT", `/api/endpoints/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/apis", data.apiId, "endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/endpoints", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

export function useDeleteEndpoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/endpoints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["/api/search", query],
    queryFn: async () => {
      if (!query.trim()) return { providers: [], apis: [], endpoints: [] };
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: !!query.trim(),
  });
}
