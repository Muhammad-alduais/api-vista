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
  Building,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Globe,
  Shield,
  Clock,
  Database,
  Tag,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone
} from "lucide-react";

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
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

  const createProviderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Provider created",
        description: "The provider has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create provider. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsEditDialogOpen(false);
      setSelectedProvider(null);
      toast({
        title: "Provider updated",
        description: "The provider has been successfully updated.",
      });
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/providers/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      toast({
        title: "Provider deleted",
        description: "The provider has been successfully deleted.",
      });
    }
  });

  const filteredProviders = providers.filter((provider: any) =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.geographicCoverage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProviderForm = ({ provider, onSubmit, isLoading: submitting }: any) => {
    const [formData, setFormData] = useState({
      name: provider?.name || "",
      shortCode: provider?.shortCode || "",
      websiteUrl: provider?.websiteUrl || "",
      logoUrl: provider?.logoUrl || "",
      documentationUrl: provider?.documentationUrl || "",
      geographicCoverage: provider?.geographicCoverage || "",
      dataSources: provider?.dataSources || [],
      historicalDataAvailable: provider?.historicalDataAvailable || false,
      historicalDataDepth: provider?.historicalDataDepth || "",
      realtimeLatency: provider?.realtimeLatency || "",
      dataGranularity: provider?.dataGranularity || "",
      dataCompleteness: provider?.dataCompleteness || "",
      dataRefreshRate: provider?.dataRefreshRate || "",
      uptimeGuarantee: provider?.uptimeGuarantee || "",
      serviceLevelAgreement: provider?.serviceLevelAgreement || "",
      supportChannels: provider?.supportChannels || [],
      maintenanceWindows: provider?.maintenanceWindows || "",
      incidentResponseTime: provider?.incidentResponseTime || "",
      pricingModel: provider?.pricingModel || "",
      freeTierAvailable: provider?.freeTierAvailable || false,
      complianceStandards: provider?.complianceStandards || [],
      dataRetentionPolicy: provider?.dataRetentionPolicy || "",
      privacyPolicy: provider?.privacyPolicy || "",
      termsOfService: provider?.termsOfService || "",
      supportEmail: provider?.supportEmail || "",
      salesContact: provider?.salesContact || "",
      technicalContact: provider?.technicalContact || "",
      categoryIds: provider?.categories?.map((c: any) => c.id) || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Provider Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Flightradar24"
                  required
                  data-testid="input-provider-name"
                />
              </div>
              <div>
                <Label htmlFor="shortCode">Short Code *</Label>
                <Input
                  id="shortCode"
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                  placeholder="e.g., FR24"
                  required
                  data-testid="input-provider-shortcode"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  required
                  data-testid="input-provider-website"
                />
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  data-testid="input-provider-logo"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="documentationUrl">Documentation URL</Label>
              <Input
                id="documentationUrl"
                type="url"
                value={formData.documentationUrl}
                onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                placeholder="https://example.com/docs"
                data-testid="input-provider-docs"
              />
            </div>

            <div>
              <Label htmlFor="geographicCoverage">Geographic Coverage</Label>
              <Input
                id="geographicCoverage"
                value={formData.geographicCoverage}
                onChange={(e) => setFormData({ ...formData, geographicCoverage: e.target.value })}
                placeholder="e.g., Global, North America, Europe"
                data-testid="input-provider-coverage"
              />
            </div>

            <div>
              <Label htmlFor="categories">Categories</Label>
              <div className="space-y-2">
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
                      data-testid={`checkbox-category-${category.name.toLowerCase()}`}
                    />
                    <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="realtimeLatency">Realtime Latency</Label>
                <Input
                  id="realtimeLatency"
                  value={formData.realtimeLatency}
                  onChange={(e) => setFormData({ ...formData, realtimeLatency: e.target.value })}
                  placeholder="e.g., < 5 seconds"
                  data-testid="input-provider-latency"
                />
              </div>
              <div>
                <Label htmlFor="dataGranularity">Data Granularity</Label>
                <Input
                  id="dataGranularity"
                  value={formData.dataGranularity}
                  onChange={(e) => setFormData({ ...formData, dataGranularity: e.target.value })}
                  placeholder="e.g., Per second, Per minute"
                  data-testid="input-provider-granularity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataCompleteness">Data Completeness</Label>
                <Input
                  id="dataCompleteness"
                  value={formData.dataCompleteness}
                  onChange={(e) => setFormData({ ...formData, dataCompleteness: e.target.value })}
                  placeholder="e.g., 95%+"
                  data-testid="input-provider-completeness"
                />
              </div>
              <div>
                <Label htmlFor="dataRefreshRate">Data Refresh Rate</Label>
                <Input
                  id="dataRefreshRate"
                  value={formData.dataRefreshRate}
                  onChange={(e) => setFormData({ ...formData, dataRefreshRate: e.target.value })}
                  placeholder="e.g., 1-5 seconds"
                  data-testid="input-provider-refresh"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="historicalDataAvailable"
                checked={formData.historicalDataAvailable}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, historicalDataAvailable: checked as boolean })
                }
                data-testid="checkbox-historical-data"
              />
              <Label htmlFor="historicalDataAvailable">Historical Data Available</Label>
            </div>

            {formData.historicalDataAvailable && (
              <div>
                <Label htmlFor="historicalDataDepth">Historical Data Depth</Label>
                <Input
                  id="historicalDataDepth"
                  value={formData.historicalDataDepth}
                  onChange={(e) => setFormData({ ...formData, historicalDataDepth: e.target.value })}
                  placeholder="e.g., 7 years"
                  data-testid="input-provider-history-depth"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricingModel">Pricing Model</Label>
                <Input
                  id="pricingModel"
                  value={formData.pricingModel}
                  onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                  placeholder="e.g., Subscription + Usage"
                  data-testid="input-provider-pricing"
                />
              </div>
              <div>
                <Label htmlFor="uptimeGuarantee">Uptime Guarantee</Label>
                <Input
                  id="uptimeGuarantee"
                  value={formData.uptimeGuarantee}
                  onChange={(e) => setFormData({ ...formData, uptimeGuarantee: e.target.value })}
                  placeholder="e.g., 99.9%"
                  data-testid="input-provider-uptime"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="freeTierAvailable"
                checked={formData.freeTierAvailable}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, freeTierAvailable: checked as boolean })
                }
                data-testid="checkbox-free-tier"
              />
              <Label htmlFor="freeTierAvailable">Free Tier Available</Label>
            </div>

            <div>
              <Label htmlFor="serviceLevelAgreement">Service Level Agreement</Label>
              <Textarea
                id="serviceLevelAgreement"
                value={formData.serviceLevelAgreement}
                onChange={(e) => setFormData({ ...formData, serviceLevelAgreement: e.target.value })}
                placeholder="Describe SLA terms..."
                data-testid="textarea-provider-sla"
              />
            </div>

            <div>
              <Label htmlFor="dataRetentionPolicy">Data Retention Policy</Label>
              <Textarea
                id="dataRetentionPolicy"
                value={formData.dataRetentionPolicy}
                onChange={(e) => setFormData({ ...formData, dataRetentionPolicy: e.target.value })}
                placeholder="Describe data retention policy..."
                data-testid="textarea-provider-retention"
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="support@example.com"
                  data-testid="input-provider-support-email"
                />
              </div>
              <div>
                <Label htmlFor="salesContact">Sales Contact</Label>
                <Input
                  id="salesContact"
                  type="email"
                  value={formData.salesContact}
                  onChange={(e) => setFormData({ ...formData, salesContact: e.target.value })}
                  placeholder="sales@example.com"
                  data-testid="input-provider-sales-email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="technicalContact">Technical Contact</Label>
              <Input
                id="technicalContact"
                type="email"
                value={formData.technicalContact}
                onChange={(e) => setFormData({ ...formData, technicalContact: e.target.value })}
                placeholder="tech@example.com"
                data-testid="input-provider-tech-email"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="privacyPolicy">Privacy Policy URL</Label>
                <Input
                  id="privacyPolicy"
                  type="url"
                  value={formData.privacyPolicy}
                  onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.value })}
                  placeholder="https://example.com/privacy"
                  data-testid="input-provider-privacy"
                />
              </div>
              <div>
                <Label htmlFor="termsOfService">Terms of Service URL</Label>
                <Input
                  id="termsOfService"
                  type="url"
                  value={formData.termsOfService}
                  onChange={(e) => setFormData({ ...formData, termsOfService: e.target.value })}
                  placeholder="https://example.com/terms"
                  data-testid="input-provider-terms"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedProvider(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            data-testid="button-submit-provider"
          >
            {submitting ? "Saving..." : provider ? "Update Provider" : "Create Provider"}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Database className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading providers...</p>
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
            API Providers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage API providers and their configurations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-provider">
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Provider</DialogTitle>
            </DialogHeader>
            <ProviderForm
              onSubmit={(data: any) => createProviderMutation.mutate(data)}
              isLoading={createProviderMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search providers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-providers"
        />
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider: any) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {provider.shortCode}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Dialog open={isEditDialogOpen && selectedProvider?.id === provider.id} 
                         onOpenChange={(open) => {
                           setIsEditDialogOpen(open);
                           if (!open) setSelectedProvider(null);
                         }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProvider(provider)}
                        data-testid={`button-edit-provider-${provider.shortCode}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Provider: {provider.name}</DialogTitle>
                      </DialogHeader>
                      <ProviderForm
                        provider={selectedProvider}
                        onSubmit={(data: any) => updateProviderMutation.mutate({ 
                          id: selectedProvider.id, 
                          data 
                        })}
                        isLoading={updateProviderMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProviderMutation.mutate(provider.id)}
                    data-testid={`button-delete-provider-${provider.shortCode}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={provider.isActive ? "default" : "secondary"}>
                  {provider.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {provider.geographicCoverage || "Global"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Globe className="h-4 w-4 mr-2" />
                  <a 
                    href={provider.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Website
                  </a>
                </div>
                {provider.documentationUrl && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <a 
                      href={provider.documentationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Documentation
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {provider.freeTierAvailable && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Free tier available
                  </div>
                )}
                {provider.historicalDataAvailable && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Database className="h-4 w-4 mr-2" />
                    Historical data: {provider.historicalDataDepth}
                  </div>
                )}
                {provider.uptimeGuarantee && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    Uptime: {provider.uptimeGuarantee}
                  </div>
                )}
              </div>

              {provider.categories && provider.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {provider.categories.map((category: any) => (
                    <Badge key={category.id} variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {provider.services?.length || 0} services
                </div>
                <Link href={`/providers/${provider.id}`}>
                  <Button variant="outline" size="sm" data-testid={`button-view-provider-${provider.shortCode}`}>
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No providers found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first API provider."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          )}
        </div>
      )}
    </div>
  );
}