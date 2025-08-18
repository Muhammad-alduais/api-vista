import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Waypoints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SearchBar } from '@/components/SearchBar';
import { CategoryManager } from '@/components/CategoryManager';
import { ProviderList } from '@/components/ProviderList';
import { ProviderDetails } from '@/components/ProviderDetails';
import { ApiSection } from '@/components/ApiSection';
import { ExportButton } from '@/components/ExportButton';
import { ProviderForm } from '@/components/forms/ProviderForm';
import type { ProviderWithRelations, SearchResults } from '@shared/schema';

export default function HomePage() {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isProviderFormOpen, setIsProviderFormOpen] = useState(false);

  const handleProviderSelect = (provider: ProviderWithRelations) => {
    setSelectedProvider(provider);
    setSearchResults(null);
  };

  const handleSearchResults = (results: SearchResults) => {
    setSearchResults(results);
    if (results.providers.length > 0 && !selectedProvider) {
      setSelectedProvider(results.providers[0]);
    }
  };

  const handleProviderUpdate = () => {
    // This will trigger a re-fetch of the selected provider
    if (selectedProvider) {
      // The provider list will refresh automatically due to query invalidation
    }
  };

  const handleProviderDelete = () => {
    setSelectedProvider(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Waypoints className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{t('api_catalog')}</h1>
                  <p className="text-sm text-muted-foreground" dir="rtl">كتالوج مزودي واجهة برمجة التطبيقات</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <ExportButton />
              <Button
                onClick={() => setIsProviderFormOpen(true)}
                className="bg-secondary hover:bg-secondary/90"
                data-testid="button-add-provider"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('add_provider')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearchResults={handleSearchResults} />
        </div>

        {/* Category Management */}
        <CategoryManager />

        {/* Breadcrumb Navigation */}
        {selectedProvider && (
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#" 
                    onClick={() => setSelectedProvider(null)}
                    className="text-primary hover:text-primary/80"
                  >
                    {t('all_providers')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    {selectedProvider.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider List Sidebar */}
          <div className="lg:col-span-1">
            <ProviderList
              selectedProviderId={selectedProvider?.id}
              onProviderSelect={handleProviderSelect}
              searchQuery={searchQuery}
            />
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedProvider ? (
              <>
                <ProviderDetails
                  provider={selectedProvider}
                  onEdit={handleProviderUpdate}
                  onDelete={handleProviderDelete}
                />
                <ApiSection
                  apis={selectedProvider.apis}
                  providerId={selectedProvider.id}
                  onApiUpdate={handleProviderUpdate}
                />
              </>
            ) : (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <Waypoints className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchResults ? 'Search Results' : 'Select a Provider'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchResults 
                    ? `Found ${searchResults.providers.length} providers, ${searchResults.apis.length} APIs, and ${searchResults.endpoints.length} endpoints`
                    : t('click_to_view_apis')
                  }
                </p>
                {searchResults && searchResults.providers.length > 0 && (
                  <Button
                    onClick={() => setSelectedProvider(searchResults.providers[0])}
                    variant="outline"
                  >
                    View First Result
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Provider Modal */}
        <Dialog open={isProviderFormOpen} onOpenChange={setIsProviderFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('add_provider')}</DialogTitle>
            </DialogHeader>
            <ProviderForm
              onClose={() => setIsProviderFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
