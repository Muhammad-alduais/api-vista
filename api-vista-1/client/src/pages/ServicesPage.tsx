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
  Cloud,
  Plus,
  Edit,
  Trash2,
  Building,
  Layers,
  Package,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Service created",
        description: "The service has been successfully created.",
      });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      toast({
        title: "Service updated",
        description: "The service has been successfully updated.",
      });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/services/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: "Service deleted",
        description: "The service has been successfully deleted.",
      });
    }
  });

  // Flatten services from all providers
  const allServices = providers.flatMap((provider: any) =>
    (provider.services || []).map((service: any) => ({
      ...service,
      provider: provider
    }))
  );

  const filteredServices = allServices.filter((service: any) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ServiceForm = ({ service, onSubmit, isLoading: submitting }: any) => {
    const [formData, setFormData] = useState({
      providerId: service?.providerId || "",
      name: service?.name || "",
      displayName: service?.displayName || "",
      description: service?.description || "",
      icon: service?.icon || "package",
      version: service?.version || "1.0",
      isActive: service?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const iconOptions = [
      { value: "package", label: "Package" },
      { value: "cloud", label: "Cloud" },
      { value: "api", label: "API" },
      { value: "database", label: "Database" },
      { value: "analytics", label: "Analytics" },
      { value: "plane", label: "Aviation" },
      { value: "globe", label: "Global" },
      { value: "shield", label: "Security" }
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="providerId">Provider *</Label>
          <Select 
            value={formData.providerId} 
            onValueChange={(value) => setFormData({ ...formData, providerId: value })}
          >
            <SelectTrigger data-testid="select-service-provider">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., flight-tracking"
              required
              data-testid="input-service-name"
            />
          </div>
          <div>
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Flight Tracking"
              required
              data-testid="input-service-display-name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the service..."
            data-testid="textarea-service-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select 
              value={formData.icon} 
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger data-testid="select-service-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 1.0, 2.1"
              data-testid="input-service-version"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedService(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !formData.providerId}
            data-testid="button-submit-service"
          >
            {submitting ? "Saving..." : service ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Cloud className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading services...</p>
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
            API Services
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage service domains and their API collections
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-service">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={(data: any) => createServiceMutation.mutate(data)}
              isLoading={createServiceMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-services"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service: any) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.displayName}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      v{service.version}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog open={isEditDialogOpen && selectedService?.id === service.id} 
                         onOpenChange={(open) => {
                           setIsEditDialogOpen(open);
                           if (!open) setSelectedService(null);
                         }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedService(service)}
                        data-testid={`button-edit-service-${service.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Service: {service.displayName}</DialogTitle>
                      </DialogHeader>
                      <ServiceForm
                        service={selectedService}
                        onSubmit={(data: any) => updateServiceMutation.mutate({ 
                          id: selectedService.id, 
                          data 
                        })}
                        isLoading={updateServiceMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteServiceMutation.mutate(service.id)}
                    data-testid={`button-delete-service-${service.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {service.name}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {service.description || "No description available"}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {service.provider.name}
                </div>
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-1" />
                  {service.apis?.length || 0} APIs
                </div>
              </div>

              <div className="pt-2 border-t">
                <Link href={`/services/${service.id}`}>
                  <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-service-${service.name}`}>
                    View APIs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No services found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Services are created under providers. Add a provider first."}
          </p>
          {!searchTerm && (
            <div className="space-x-2">
              <Link href="/providers">
                <Button variant="outline">
                  <Building className="mr-2 h-4 w-4" />
                  View Providers
                </Button>
              </Link>
              <Button onClick={() => setIsCreateDialogOpen(true)} disabled={providers.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}