import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Route,
  Plus,
  Edit,
  Trash2,
  Building,
  Cloud,
  Layers,
  Play,
  Hash
} from "lucide-react";

export default function EndpointsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  const createEndpointMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/endpoints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Endpoint created",
        description: "The endpoint has been successfully created.",
      });
    }
  });

  const updateEndpointMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/endpoints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsEditDialogOpen(false);
      setSelectedEndpoint(null);
      toast({
        title: "Endpoint updated",
        description: "The endpoint has been successfully updated.",
      });
    }
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/endpoints/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: "Endpoint deleted",
        description: "The endpoint has been successfully deleted.",
      });
    }
  });

  // Flatten endpoints from all providers, services, and APIs
  const allEndpoints = providers.flatMap((provider: any) =>
    (provider.services || []).flatMap((service: any) =>
      (service.apis || []).flatMap((api: any) =>
        (api.endpoints || []).map((endpoint: any) => ({
          ...endpoint,
          provider: provider,
          service: service,
          api: api
        }))
      )
    )
  );

  const filteredEndpoints = allEndpoints.filter((endpoint: any) =>
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.service.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.api.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get APIs for dropdown selection
  const allApis = providers.flatMap((provider: any) =>
    (provider.services || []).flatMap((service: any) =>
      (service.apis || []).map((api: any) => ({
        ...api,
        provider: provider,
        service: service,
        label: `${provider.name} > ${service.displayName} > ${api.displayName}`
      }))
    )
  );

  const EndpointForm = ({ endpoint, onSubmit, isLoading: submitting }: any) => {
    const [formData, setFormData] = useState({
      apiId: endpoint?.apiId || "",
      name: endpoint?.name || "",
      path: endpoint?.path || "",
      description: endpoint?.description || "",
      isActive: endpoint?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="apiId">API *</Label>
          <Select 
            value={formData.apiId} 
            onValueChange={(value) => setFormData({ ...formData, apiId: value })}
          >
            <SelectTrigger data-testid="select-endpoint-api">
              <SelectValue placeholder="Select an API" />
            </SelectTrigger>
            <SelectContent>
              {allApis.map((api: any) => (
                <SelectItem key={api.id} value={api.id}>
                  {api.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Endpoint Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., flights, flight-by-id"
              required
              data-testid="input-endpoint-name"
            />
          </div>
          <div>
            <Label htmlFor="path">Path *</Label>
            <Input
              id="path"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="e.g., /flights, /flights/{id}"
              required
              data-testid="input-endpoint-path"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the endpoint..."
            data-testid="textarea-endpoint-description"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedEndpoint(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !formData.apiId}
            data-testid="button-submit-endpoint"
          >
            {submitting ? "Saving..." : endpoint ? "Update Endpoint" : "Create Endpoint"}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Route className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading endpoints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            API Endpoints
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage API endpoints and their operations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-endpoint">
              <Plus className="mr-2 h-4 w-4" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Endpoint</DialogTitle>
            </DialogHeader>
            <EndpointForm
              onSubmit={(data: any) => createEndpointMutation.mutate(data)}
              isLoading={createEndpointMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search endpoints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-endpoints"
        />
      </div>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEndpoints.map((endpoint: any) => (
          <Card key={endpoint.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <Route className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {endpoint.path}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog open={isEditDialogOpen && selectedEndpoint?.id === endpoint.id} 
                         onOpenChange={(open) => {
                           setIsEditDialogOpen(open);
                           if (!open) setSelectedEndpoint(null);
                         }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEndpoint(endpoint)}
                        data-testid={`button-edit-endpoint-${endpoint.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Endpoint: {endpoint.name}</DialogTitle>
                      </DialogHeader>
                      <EndpointForm
                        endpoint={selectedEndpoint}
                        onSubmit={(data: any) => updateEndpointMutation.mutate({ 
                          id: selectedEndpoint.id, 
                          data 
                        })}
                        isLoading={updateEndpointMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEndpointMutation.mutate(endpoint.id)}
                    data-testid={`button-delete-endpoint-${endpoint.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={endpoint.isActive ? "default" : "secondary"}>
                  {endpoint.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {endpoint.path}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {endpoint.description || "No description available"}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Building className="h-4 w-4 mr-2" />
                  {endpoint.provider.name}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Cloud className="h-4 w-4 mr-2" />
                  {endpoint.service.displayName}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Layers className="h-4 w-4 mr-2" />
                  {endpoint.api.displayName}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Play className="h-4 w-4 inline mr-1" />
                  {endpoint.operations?.length || 0} operations
                </div>
                <Link href={`/endpoints/${endpoint.id}`}>
                  <Button variant="outline" size="sm" data-testid={`button-view-endpoint-${endpoint.name}`}>
                    View Operations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEndpoints.length === 0 && (
        <div className="text-center py-12">
          <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No endpoints found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Endpoints are created under APIs. Add an API first."}
          </p>
          {!searchTerm && (
            <div className="space-x-2">
              <Link href="/apis">
                <Button variant="outline">
                  <Layers className="mr-2 h-4 w-4" />
                  View APIs
                </Button>
              </Link>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                disabled={allApis.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}