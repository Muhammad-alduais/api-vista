import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApiForm } from './forms/ApiForm';
import { EndpointList } from './EndpointList';
import { useDeleteApi } from '@/hooks/use-apis';
import { useToast } from '@/hooks/use-toast';
import type { ApiWithRelations } from '@shared/schema';

interface ApiSectionProps {
  apis: ApiWithRelations[];
  providerId: string;
  onApiUpdate?: () => void;
}

export function ApiSection({ apis, providerId, onApiUpdate }: ApiSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [expandedApis, setExpandedApis] = useState<Set<string>>(new Set());
  const [editingApi, setEditingApi] = useState<ApiWithRelations | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const deleteApi = useDeleteApi();

  const toggleApiExpansion = (apiId: string) => {
    const newExpanded = new Set(expandedApis);
    if (newExpanded.has(apiId)) {
      newExpanded.delete(apiId);
    } else {
      newExpanded.add(apiId);
    }
    setExpandedApis(newExpanded);
  };

  const handleEdit = (api: ApiWithRelations) => {
    setEditingApi(api);
    setIsFormOpen(true);
  };

  const handleDelete = async (api: ApiWithRelations) => {
    if (window.confirm(t('delete_confirm'))) {
      try {
        await deleteApi.mutateAsync(api.id);
        toast({
          title: "Success",
          description: "API deleted successfully",
        });
        onApiUpdate?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete API",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingApi(null);
    onApiUpdate?.();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('apis')}</CardTitle>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-api"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('add_api')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {apis.map((api) => (
              <div key={api.id} className="p-6" data-testid={`api-${api.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium">{api.name}</h4>
                      {api.version && (
                        <Badge variant="outline">{api.version}</Badge>
                      )}
                      <Badge variant={api.isActive ? "default" : "secondary"}>
                        {api.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </div>
                    
                    {api.description && (
                      <p className="text-muted-foreground mb-4">{api.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('base_url')}
                        </dt>
                        <dd className="text-sm font-mono">{api.baseUrl}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('auth_type')}
                        </dt>
                        <dd className="text-sm">{api.authType || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('rate_limit')}
                        </dt>
                        <dd className="text-sm">{api.rateLimit || 'N/A'}</dd>
                      </div>
                    </div>
                    
                    {api.categories.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t('categories')}:
                        </span>
                        {api.categories.map((category) => (
                          <Badge key={category.id} variant="secondary">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Collapsible
                      open={expandedApis.has(api.id)}
                      onOpenChange={() => toggleApiExpansion(api.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto font-medium text-primary"
                          data-testid={`button-toggle-endpoints-${api.id}`}
                        >
                          {expandedApis.has(api.id) ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          {t('endpoints')} ({api.endpoints.length})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <EndpointList
                          endpoints={api.endpoints}
                          apiId={api.id}
                          onEndpointUpdate={onApiUpdate}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  
                  <div className="flex items-start space-x-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(api)}
                      data-testid={`button-edit-api-${api.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(api)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-api-${api.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {apis.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                {t('no_data')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingApi ? 'Edit API' : t('add_api')}
            </DialogTitle>
          </DialogHeader>
          <ApiForm
            api={editingApi}
            providerId={providerId}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
