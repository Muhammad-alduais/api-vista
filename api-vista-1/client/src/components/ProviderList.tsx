import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProviders } from '@/hooks/use-providers';
import type { ProviderWithRelations } from '@shared/schema';

interface ProviderListProps {
  selectedProviderId?: string;
  onProviderSelect: (provider: ProviderWithRelations) => void;
  searchQuery?: string;
}

export function ProviderList({ selectedProviderId, onProviderSelect, searchQuery }: ProviderListProps) {
  const { t } = useTranslation();
  const { data: providers, isLoading } = useProviders(searchQuery);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t('all_providers')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('click_to_view_apis')}</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {providers?.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedProviderId === provider.id ? 'bg-muted' : ''
              }`}
              onClick={() => onProviderSelect(provider)}
              data-testid={`provider-${provider.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {provider.shortCode || provider.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {provider.name}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {provider.websiteUrl}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {provider.categories.slice(0, 2).map((category) => (
                      <Badge key={category.id} variant="secondary" className="text-xs">
                        {category.name}
                      </Badge>
                    ))}
                    {provider.categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.categories.length - 2}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {provider.apis.length} APIs
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
          {(!providers || providers.length === 0) && (
            <div className="p-6 text-center text-muted-foreground">
              {t('no_data')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
