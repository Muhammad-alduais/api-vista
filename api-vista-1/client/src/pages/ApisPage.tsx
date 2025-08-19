import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Building,
  Cloud,
  Route,
  ExternalLink,
  Key,
  Zap,
  FileText,
  Tag
} from "lucide-react";

export default function ApisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApi, setSelectedApi] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createApiMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/apis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "API created",
        description: "The API has been successfully created.",
      });
    }
  });

  const updateApiMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/apis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsEditDialogOpen(false);
      setSelectedApi(null);
      toast({
        title: "API updated",
        description: "The API has been successfully updated.",
      });
    }
  });

  const deleteApiMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/apis/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: "API deleted",
        description: "The API has been successfully deleted.",
      });
    }
  });

  // Flatten APIs from all providers and services
  const allApis = providers.flatMap((provider: any) =>
    (provider.services || []).flatMap((service: any) =>
      (service.apis || []).map((api: any) => ({
        ...api,
        provider: provider,
        service: service
      }))
    )
  );

  const filteredApis = allApis.filter((api: any) =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.service.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get services for a specific provider
  const getServicesForProvider = (providerId: string) => {
    const provider = providers.find((p: any) => p.id === providerId);
    return provider?.services || [];
  };

  const ApiForm = ({ api, onSubmit, isLoading: submitting }: any) => {
    const [formData, setFormData] = useState({
      serviceId: api?.serviceId || "",
      providerId: api?.providerId || "",
      name: api?.name || "",
      displayName: api?.displayName || "",
      description: api?.description || "",
      version: api?.version || "1.0",
      basePath: api?.basePath || "",
      authType: api?.authType || "API Key",
      rateLimit: api?.rateLimit || "",
      supportedFormats: api?.supportedFormats || ["JSON"],
      apiDesignStyle: api?.apiDesignStyle || "REST",
      documentationUrl: api?.documentationUrl || "",
      swaggerUrl: api?.swaggerUrl || "",
      isActive: api?.isActive ?? true,
      categoryIds: api?.categories?.map((c: any) => c.id) || []
    });

    const [availableServices, setAvailableServices] = useState<any[]>(
      api ? getServicesForProvider(api.providerId) : []
    );

    const handleProviderChange = (providerId: string) => {
      const services = getServicesForProvider(providerId);
      setAvailableServices(services);
      setFormData({ 
        ...formData, 
        providerId, 
        serviceId: services.length > 0 ? services[0].id : "" 
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const authTypes = ["API Key", "OAuth2", "Bearer Token", "Basic Auth", "JWT", "HMAC"];
    const designStyles = ["REST", "GraphQL", "SOAP", "RPC"];
    const formats = ["JSON", "XML", "CSV", "YAML"];

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="providerId">Provider *</Label>
            <Select 
              value={formData.providerId} 
              onValueChange={handleProviderChange}
            >
              <SelectTrigger data-testid="select-api-provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider: any) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} ({provider.shortCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="serviceId">Service *</Label>
            <Select 
              value={formData.serviceId} 
              onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              disabled={!formData.providerId}
            >
              <SelectTrigger data-testid="select-api-service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map((service: any) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">API Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., live-flights"
              required
              data-testid="input-api-name"
            />
          </div>
          <div>
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Live Flights API"
              required
              data-testid="input-api-display-name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the API..."
            data-testid="textarea-api-description"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 1.0, 2.1"
              data-testid="input-api-version"
            />
          </div>
          <div>
            <Label htmlFor="basePath">Base Path</Label>
            <Input
              id="basePath"
              value={formData.basePath}
              onChange={(e) => setFormData({ ...formData, basePath: e.target.value })}
              placeholder="e.g., /api/v1"
              data-testid="input-api-base-path"
            />
          </div>
          <div>
            <Label htmlFor="authType">Authentication</Label>
            <Select 
              value={formData.authType} 
              onValueChange={(value) => setFormData({ ...formData, authType: value })}
            >
              <SelectTrigger data-testid="select-api-auth-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {authTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rateLimit">Rate Limit</Label>
            <Input
              id="rateLimit"
              value={formData.rateLimit}
              onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
              placeholder="e.g., 1000 requests/hour"
              data-testid="input-api-rate-limit"
            />
          </div>
          <div>
            <Label htmlFor="apiDesignStyle">Design Style</Label>
            <Select 
              value={formData.apiDesignStyle} 
              onValueChange={(value) => setFormData({ ...formData, apiDesignStyle: value })}
            >
              <SelectTrigger data-testid="select-api-design-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {designStyles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Supported Formats</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {formats.map((format) => (
              <div key={format} className="flex items-center space-x-2">
                <Checkbox
                  id={`format-${format}`}
                  checked={formData.supportedFormats.includes(format)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        supportedFormats: [...formData.supportedFormats, format]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        supportedFormats: formData.supportedFormats.filter((f: string) => f !== format)
                      });
                    }
                  }}
                  data-testid={`checkbox-format-${format.toLowerCase()}`}
                />
                <Label htmlFor={`format-${format}`}>{format}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="documentationUrl">Documentation URL</Label>
            <Input
              id="documentationUrl"
              type="url"
              value={formData.documentationUrl}
              onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
              placeholder="https://example.com/docs"
              data-testid="input-api-docs-url"
            />
          </div>
          <div>
            <Label htmlFor="swaggerUrl">Swagger/OpenAPI URL</Label>
            <Input
              id="swaggerUrl"
              type="url"
              value={formData.swaggerUrl}
              onChange={(e) => setFormData({ ...formData, swaggerUrl: e.target.value })}
              placeholder="https://example.com/swagger.json"
              data-testid="input-api-swagger-url"
            />
          </div>
        </div>

        <div>
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map((category: any) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={formData.categoryIds.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        categoryIds: [...formData.categoryIds, category.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        categoryIds: formData.categoryIds.filter((id: string) => id !== category.id)
                      });
                    }
                  }}
                  data-testid={`checkbox-api-category-${category.name.toLowerCase()}`}
                />
                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedApi(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !formData.serviceId}
            data-testid="button-submit-api"
          >
            {submitting ? "Saving..." : api ? "Update API" : "Create API"}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Layers className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading APIs...</p>
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
            APIs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage API endpoints and their configurations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-api">
              <Plus className="mr-2 h-4 w-4" />
              Add API
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New API</DialogTitle>
            </DialogHeader>
            <ApiForm
              onSubmit={(data: any) => createApiMutation.mutate(data)}
              isLoading={createApiMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search APIs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-apis"
        />
      </div>

      {/* APIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApis.map((api: any) => (
          <Card key={api.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Layers className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{api.displayName}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      v{api.version}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog open={isEditDialogOpen && selectedApi?.id === api.id} 
                         onOpenChange={(open) => {
                           setIsEditDialogOpen(open);
                           if (!open) setSelectedApi(null);
                         }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApi(api)}
                        data-testid={`button-edit-api-${api.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit API: {api.displayName}</DialogTitle>
                      </DialogHeader>
                      <ApiForm
                        api={selectedApi}
                        onSubmit={(data: any) => updateApiMutation.mutate({ 
                          id: selectedApi.id, 
                          data 
                        })}
                        isLoading={updateApiMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteApiMutation.mutate(api.id)}
                    data-testid={`button-delete-api-${api.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={api.isActive ? "default" : "secondary"}>
                  {api.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {api.apiDesignStyle}
                </Badge>
                <Badge variant="outline">
                  {api.authType}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {api.description || "No description available"}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Building className="h-4 w-4 mr-2" />
                  {api.provider.name}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Cloud className="h-4 w-4 mr-2" />
                  {api.service.displayName}
                </div>
                {api.basePath && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Route className="h-4 w-4 mr-2" />
                    {api.basePath}
                  </div>
                )}
                {api.rateLimit && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Zap className="h-4 w-4 mr-2" />
                    {api.rateLimit}
                  </div>
                )}
              </div>

              {api.supportedFormats && api.supportedFormats.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {api.supportedFormats.map((format: string) => (
                    <Badge key={format} variant="secondary" className="text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>
              )}

              {api.categories && api.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {api.categories.map((category: any) => (
                    <Badge key={category.id} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {api.endpoints?.length || 0} endpoints
                </div>
                <div className="flex space-x-2">
                  {api.documentationUrl && (
                    <a href={api.documentationUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Link href={`/apis/${api.id}`}>
                    <Button variant="outline" size="sm" data-testid={`button-view-api-${api.name}`}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApis.length === 0 && (
        <div className="text-center py-12">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No APIs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "APIs are created under services. Add a service first."}
          </p>
          {!searchTerm && (
            <div className="space-x-2">
              <Link href="/services">
                <Button variant="outline">
                  <Cloud className="mr-2 h-4 w-4" />
                  View Services
                </Button>
              </Link>
              <Button onClick={() => setIsCreateDialogOpen(true)} disabled={allApis.length === 0 && providers.every((p: any) => !p.services?.length)}>
                <Plus className="mr-2 h-4 w-4" />
                Add API
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}