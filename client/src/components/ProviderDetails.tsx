import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProviderForm } from './forms/ProviderForm';
import { useDeleteProvider } from '@/hooks/use-providers';
import { useToast } from '@/hooks/use-toast';
import type { ProviderWithRelations } from '@shared/schema';

interface ProviderDetailsProps {
  provider: ProviderWithRelations;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProviderDetails({ provider, onEdit, onDelete }: ProviderDetailsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteProvider = useDeleteProvider();

  const handleDelete = async () => {
    if (window.confirm(t('delete_confirm'))) {
      try {
        await deleteProvider.mutateAsync(provider.id);
        toast({
          title: "Success",
          description: "Provider deleted successfully",
        });
        onDelete?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete provider",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-primary font-bold text-xl">
                  {provider.shortCode || provider.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground" data-testid={`text-provider-name-${provider.id}`}>
                  {provider.name}
                </h2>
                <p className="text-muted-foreground">
                  <a
                    href={provider.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary flex items-center gap-1"
                    data-testid={`link-provider-website-${provider.id}`}
                  >
                    {provider.websiteUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {provider.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                data-testid={`button-edit-provider-${provider.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
                data-testid={`button-delete-provider-${provider.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">{t('basic_information')}</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('short_code')}</dt>
                <dd className="text-sm text-foreground">{provider.shortCode || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('website_url')}</dt>
                <dd className="text-sm text-foreground">
                  <a
                    href={provider.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {provider.websiteUrl}
                  </a>
                </dd>
              </div>
              {provider.documentationUrl && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('documentation')}</dt>
                  <dd className="text-sm text-foreground">
                    <a
                      href={provider.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {provider.documentationUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">{t('coverage_technical')}</h4>
            <dl className="space-y-2">
              {provider.geographicCoverage && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('geographic_coverage')}</dt>
                  <dd className="text-sm text-foreground">{provider.geographicCoverage}</dd>
                </div>
              )}
              {provider.dataSources && provider.dataSources.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('data_sources')}</dt>
                  <dd className="text-sm text-foreground">{provider.dataSources.join(', ')}</dd>
                </div>
              )}
              {provider.realtimeLatency && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('realtime_latency')}</dt>
                  <dd className="text-sm text-foreground">{provider.realtimeLatency}</dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>
          <ProviderForm
            provider={provider}
            onClose={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
