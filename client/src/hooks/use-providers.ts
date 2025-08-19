import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ProviderWithRelations, InsertProvider } from "@shared/schema";

export function useProviders(search?: string) {
  return useQuery<ProviderWithRelations[]>({
    queryKey: ["/api/providers", search],
    queryFn: async () => {
      const url = search ? `/api/providers?search=${encodeURIComponent(search)}` : "/api/providers";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch providers");
      return response.json();
    },
  });
}

export function useProvider(id: string) {
  return useQuery<ProviderWithRelations>({
    queryKey: ["/api/providers", id],
    enabled: !!id,
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertProvider & { categoryIds: string[] }) => {
      const response = await apiRequest("POST", "/api/providers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertProvider> & { id: string; categoryIds?: string[] }) => {
      const response = await apiRequest("PUT", `/api/providers/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers", variables.id] });
    },
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}
