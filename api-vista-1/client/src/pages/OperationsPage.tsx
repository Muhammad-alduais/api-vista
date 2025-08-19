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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Play,
  Plus,
  Edit,
  Trash2,
  Building,
  Cloud,
  Layers,
  Route,
  Key,
  Clock,
  Settings,
  FileText,
  Hash,
  Database
} from "lucide-react";

export default function OperationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/providers"],
  });

  const createOperationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/operations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Operation created",
        description: "The operation has been successfully created.",
      });
    }
  });

  const updateOperationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/operations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsEditDialogOpen(false);
      setSelectedOperation(null);
      toast({
        title: "Operation updated",
        description: "The operation has been successfully updated.",
      });
    }
  });

  const deleteOperationMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/operations/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: "Operation deleted",
        description: "The operation has been successfully deleted.",
      });
    }
  });

  // Flatten operations from all providers, services, APIs, and endpoints
  const allOperations = providers.flatMap((provider: any) =>
    (provider.services || []).flatMap((service: any) =>
      (service.apis || []).flatMap((api: any) =>
        (api.endpoints || []).flatMap((endpoint: any) =>
          (endpoint.operations || []).map((operation: any) => ({
            ...operation,
            provider: provider,
            service: service,
            api: api,
            endpoint: endpoint
          }))
        )
      )
    )
  );

  const filteredOperations = allOperations.filter((operation: any) =>
    operation.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.operationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.endpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get endpoints for dropdown selection
  const allEndpoints = providers.flatMap((provider: any) =>
    (provider.services || []).flatMap((service: any) =>
      (service.apis || []).flatMap((api: any) =>
        (api.endpoints || []).map((endpoint: any) => ({
          ...endpoint,
          provider: provider,
          service: service,
          api: api,
          label: `${provider.name} > ${service.displayName} > ${api.displayName} > ${endpoint.name}`
        }))
      )
    )
  );

  const OperationForm = ({ operation, onSubmit, isLoading: submitting }: any) => {
    const [formData, setFormData] = useState({
      endpointId: operation?.endpointId || "",
      method: operation?.method || "GET",
      operationId: operation?.operationId || "",
      summary: operation?.summary || "",
      description: operation?.description || "",
      authRequired: operation?.authRequired ?? true,
      scopes: operation?.scopes || [],
      rateLimit: operation?.rateLimit || "",
      defaultResponseFormat: operation?.defaultResponseFormat || "json",
      cacheable: operation?.cacheable || false,
      cacheTime: operation?.cacheTime || 0,
      isActive: operation?.isActive ?? true
    });

    const [newScope, setNewScope] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    const responseFormats = ["json", "xml", "csv", "text", "binary"];

    const addScope = () => {
      if (newScope.trim() && !formData.scopes.includes(newScope.trim())) {
        setFormData({
          ...formData,
          scopes: [...formData.scopes, newScope.trim()]
        });
        setNewScope("");
      }
    };

    const removeScope = (scope: string) => {
      setFormData({
        ...formData,
        scopes: formData.scopes.filter((s: string) => s !== scope)
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor="endpointId">Endpoint *</Label>
              <Select 
                value={formData.endpointId} 
                onValueChange={(value) => setFormData({ ...formData, endpointId: value })}
              >
                <SelectTrigger data-testid="select-operation-endpoint">
                  <SelectValue placeholder="Select an endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {allEndpoints.map((endpoint: any) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      {endpoint.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method">HTTP Method *</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger data-testid="select-operation-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {httpMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="operationId">Operation ID</Label>
                <Input
                  id="operationId"
                  value={formData.operationId}
                  onChange={(e) => setFormData({ ...formData, operationId: e.target.value })}
                  placeholder="e.g., getFlights, createUser"
                  data-testid="input-operation-id"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary *</Label>
              <Input
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of the operation"
                required
                data-testid="input-operation-summary"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the operation..."
                data-testid="textarea-operation-description"
              />
            </div>

            <div>
              <Label htmlFor="defaultResponseFormat">Default Response Format</Label>
              <Select 
                value={formData.defaultResponseFormat} 
                onValueChange={(value) => setFormData({ ...formData, defaultResponseFormat: value })}
              >
                <SelectTrigger data-testid="select-operation-response-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {responseFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="authRequired"
                checked={formData.authRequired}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, authRequired: checked as boolean })
                }
                data-testid="checkbox-auth-required"
              />
              <Label htmlFor="authRequired">Authentication Required</Label>
            </div>

            <div>
              <Label>Scopes</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    placeholder="e.g., flights:read, users:write"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addScope())}
                    data-testid="input-new-scope"
                  />
                  <Button
                    type="button"
                    onClick={addScope}
                    disabled={!newScope.trim()}
                    data-testid="button-add-scope"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.scopes.map((scope: string) => (
                    <Badge 
                      key={scope} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeScope(scope)}
                      data-testid={`badge-scope-${scope}`}
                    >
                      {scope} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="rateLimit">Rate Limit</Label>
              <Input
                id="rateLimit"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                placeholder="e.g., 100 requests/minute"
                data-testid="input-operation-rate-limit"
              />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cacheable"
                checked={formData.cacheable}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, cacheable: checked as boolean })
                }
                data-testid="checkbox-cacheable"
              />
              <Label htmlFor="cacheable">Cacheable Response</Label>
            </div>

            {formData.cacheable && (
              <div>
                <Label htmlFor="cacheTime">Cache Time (seconds)</Label>
                <Input
                  id="cacheTime"
                  type="number"
                  value={formData.cacheTime}
                  onChange={(e) => setFormData({ ...formData, cacheTime: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 300"
                  min="0"
                  data-testid="input-cache-time"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedOperation(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !formData.endpointId}
            data-testid="button-submit-operation"
          >
            {submitting ? "Saving..." : operation ? "Update Operation" : "Create Operation"}
          </Button>
        </div>
      </form>
    );
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      POST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      PUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      PATCH: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      HEAD: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      OPTIONS: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return colors[method] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Play className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading operations...</p>
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
            API Operations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage HTTP operations, parameters, and response schemas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-operation">
              <Plus className="mr-2 h-4 w-4" />
              Add Operation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Operation</DialogTitle>
            </DialogHeader>
            <OperationForm
              onSubmit={(data: any) => createOperationMutation.mutate(data)}
              isLoading={createOperationMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search operations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-operations"
        />
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOperations.map((operation: any) => (
          <Card key={operation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <Play className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{operation.summary}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {operation.operationId || "No operation ID"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog open={isEditDialogOpen && selectedOperation?.id === operation.id} 
                         onOpenChange={(open) => {
                           setIsEditDialogOpen(open);
                           if (!open) setSelectedOperation(null);
                         }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOperation(operation)}
                        data-testid={`button-edit-operation-${operation.operationId || operation.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Operation: {operation.summary}</DialogTitle>
                      </DialogHeader>
                      <OperationForm
                        operation={selectedOperation}
                        onSubmit={(data: any) => updateOperationMutation.mutate({ 
                          id: selectedOperation.id, 
                          data 
                        })}
                        isLoading={updateOperationMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteOperationMutation.mutate(operation.id)}
                    data-testid={`button-delete-operation-${operation.operationId || operation.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={getMethodColor(operation.method)}>
                  {operation.method}
                </Badge>
                <Badge variant={operation.isActive ? "default" : "secondary"}>
                  {operation.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {operation.defaultResponseFormat?.toUpperCase() || "JSON"}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {operation.description || "No description available"}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Building className="h-4 w-4 mr-2" />
                  {operation.provider.name}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Route className="h-4 w-4 mr-2" />
                  {operation.endpoint.path}
                </div>
                {operation.authRequired && (
                  <div className="flex items-center text-green-600">
                    <Key className="h-4 w-4 mr-2" />
                    Auth required
                  </div>
                )}
                {operation.cacheable && (
                  <div className="flex items-center text-blue-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Cacheable ({operation.cacheTime}s)
                  </div>
                )}
                {operation.rateLimit && (
                  <div className="flex items-center text-orange-600">
                    <Settings className="h-4 w-4 mr-2" />
                    {operation.rateLimit}
                  </div>
                )}
              </div>

              {operation.scopes && operation.scopes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {operation.scopes.map((scope: string) => (
                    <Badge key={scope} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Hash className="h-4 w-4 inline mr-1" />
                  {operation.parameters?.length || 0} params
                </div>
                <Link href={`/operations/${operation.id}`}>
                  <Button variant="outline" size="sm" data-testid={`button-view-operation-${operation.operationId || operation.id}`}>
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOperations.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No operations found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Operations are created under endpoints. Add an endpoint first."}
          </p>
          {!searchTerm && (
            <div className="space-x-2">
              <Link href="/endpoints">
                <Button variant="outline">
                  <Route className="mr-2 h-4 w-4" />
                  View Endpoints
                </Button>
              </Link>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                disabled={allEndpoints.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Operation
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}