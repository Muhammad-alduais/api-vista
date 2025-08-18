import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ApiWithRelations, InsertApi } from "@shared/schema";

export function useApisByProvider(providerId: string) {
  return useQuery<ApiWithRelations[]>({
    queryKey: ["/api/providers", providerId, "apis"],
    enabled: !!providerId,
  });
}

export function useApi(id: string) {
  return useQuery<ApiWithRelations>({
    queryKey: ["/api/apis", id],
    enabled: !!id,
  });
}

export function useCreateApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertApi & { categoryIds: string[] }) => {
      const response = await apiRequest("POST", "/api/apis", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers", variables.providerId, "apis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

export function useUpdateApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertApi> & { id: string; categoryIds?: string[] }) => {
      const response = await apiRequest("PUT", `/api/apis/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers", data.providerId, "apis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apis", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

export function useDeleteApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/apis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}
