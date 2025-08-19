import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EndpointForm } from './forms/EndpointForm';
import { useDeleteEndpoint } from '@/hooks/use-endpoints';
import { useToast } from '@/hooks/use-toast';
import type { Endpoint } from '@shared/schema';

interface EndpointListProps {
  endpoints: Endpoint[];
  apiId: string;
  onEndpointUpdate?: () => void;
}

export function EndpointList({ endpoints, apiId, onEndpointUpdate }: EndpointListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const deleteEndpoint = useDeleteEndpoint();

  const handleEdit = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
    setIsFormOpen(true);
  };

  const handleDelete = async (endpoint: Endpoint) => {
    if (window.confirm(t('delete_confirm'))) {
      try {
        await deleteEndpoint.mutateAsync(endpoint.id);
        toast({
          title: "Success",
          description: "Endpoint deleted successfully",
        });
        onEndpointUpdate?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete endpoint",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEndpoint(null);
    onEndpointUpdate?.();
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PUT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium">{t('endpoints')}</h5>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="text-primary hover:text-primary"
            data-testid="button-add-endpoint"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('add_endpoint')}
          </Button>
        </div>
        
        <div className="space-y-2">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="flex items-center justify-between p-3 bg-background rounded border"
              data-testid={`endpoint-${endpoint.id}`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex flex-wrap gap-1">
                  {endpoint.httpMethods?.map((method) => (
                    <Badge
                      key={method}
                      className={`text-xs font-medium ${getMethodColor(method)}`}
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
                <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                {endpoint.description && (
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {endpoint.description}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(endpoint)}
                  className="h-6 w-6 p-0"
                  data-testid={`button-edit-endpoint-${endpoint.id}`}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(endpoint)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  data-testid={`button-delete-endpoint-${endpoint.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {endpoints.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              {t('no_data')}
            </p>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEndpoint ? 'Edit Endpoint' : t('add_endpoint')}
            </DialogTitle>
          </DialogHeader>
          <EndpointForm
            endpoint={editingEndpoint}
            apiId={apiId}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
