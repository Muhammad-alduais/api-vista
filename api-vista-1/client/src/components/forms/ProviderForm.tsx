import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategories } from '@/hooks/use-categories';
import { useCreateProvider, useUpdateProvider } from '@/hooks/use-providers';
import { useToast } from '@/hooks/use-toast';
import { insertProviderSchema, type ProviderWithRelations } from '@shared/schema';
import type { FormField as FormFieldType } from '@/types';

const formSchema = insertProviderSchema.extend({
  categoryIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProviderFormProps {
  provider?: ProviderWithRelations | null;
  onClose: () => void;
}

export function ProviderForm({ provider, onClose }: ProviderFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [dataSourceFields, setDataSourceFields] = useState<FormFieldType[]>([]);
  const [limitationFields, setLimitationFields] = useState<FormFieldType[]>([]);
  const [restrictionFields, setRestrictionFields] = useState<FormFieldType[]>([]);
  const [sdkFields, setSdkFields] = useState<FormFieldType[]>([]);

  const { data: categories } = useCategories();
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      shortCode: '',
      websiteUrl: '',
      logoUrl: '',
      documentationUrl: '',
      geographicCoverage: '',
      dataSources: [],
      historicalDataAvailable: false,
      historicalDataDepth: '',
      realtimeLatency: '',
      dataGranularity: '',
      dataCompleteness: '',
      dataRefreshRate: '',
      uptimeSla: '',
      updateFrequency: '',
      knownLimitations: [],
      dataAccuracyMetrics: '',
      dataValidationProcedures: '',
      responseTimeLatency: '',
      reliabilityHistory: '',
      dataFreshness: '',
      licenseType: '',
      termsOfUseUrl: '',
      dataUsageRestrictions: [],
      attributionRequirements: '',
      supportContact: '',
      sdksAvailable: [],
      deprecationPolicyUrl: '',
      serviceStatusPageUrl: '',
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (provider) {
      form.reset({
        ...provider,
        categoryIds: provider.categories.map(c => c.id),
      });
      
      // Initialize array fields
      setDataSourceFields(
        provider.dataSources?.map((value, index) => ({ id: `ds-${index}`, value })) || []
      );
      setLimitationFields(
        provider.knownLimitations?.map((value, index) => ({ id: `kl-${index}`, value })) || []
      );
      setRestrictionFields(
        provider.dataUsageRestrictions?.map((value, index) => ({ id: `dur-${index}`, value })) || []
      );
      setSdkFields(
        provider.sdksAvailable?.map((value, index) => ({ id: `sdk-${index}`, value })) || []
      );
    }
  }, [provider, form]);

  const addField = (
    fields: FormFieldType[],
    setFields: React.Dispatch<React.SetStateAction<FormFieldType[]>>,
    prefix: string
  ) => {
    const newId = `${prefix}-${Date.now()}`;
    setFields([...fields, { id: newId, value: '' }]);
  };

  const removeField = (
    fields: FormFieldType[],
    setFields: React.Dispatch<React.SetStateAction<FormFieldType[]>>,
    id: string
  ) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (
    fields: FormFieldType[],
    setFields: React.Dispatch<React.SetStateAction<FormFieldType[]>>,
    id: string,
    value: string
  ) => {
    setFields(fields.map(field => field.id === id ? { ...field, value } : field));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { categoryIds, ...providerData } = data;
      
      // Convert array fields
      const processedData = {
        ...providerData,
        dataSources: dataSourceFields.map(f => f.value).filter(Boolean),
        knownLimitations: limitationFields.map(f => f.value).filter(Boolean),
        dataUsageRestrictions: restrictionFields.map(f => f.value).filter(Boolean),
        sdksAvailable: sdkFields.map(f => f.value).filter(Boolean),
      };

      if (provider) {
        await updateProvider.mutateAsync({
          id: provider.id,
          ...processedData,
          categoryIds: categoryIds || [],
        });
        toast({
          title: "Success",
          description: "Provider updated successfully",
        });
      } else {
        await createProvider.mutateAsync({
          ...processedData,
          categoryIds: categoryIds || [],
        });
        toast({
          title: "Success",
          description: "Provider created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save provider",
        variant: "destructive",
      });
    }
  };

  const renderArrayField = (
    label: string,
    fields: FormFieldType[],
    setFields: React.Dispatch<React.SetStateAction<FormFieldType[]>>,
    prefix: string
  ) => (
    <div>
      <FormLabel className="text-sm font-medium mb-2 block">{label}</FormLabel>
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center space-x-2">
            <Input
              value={field.value}
              onChange={(e) => updateField(fields, setFields, field.id, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeField(fields, setFields, field.id)}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addField(fields, setFields, prefix)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add {label}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('basic_information')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('provider_name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., FlightRadar24" {...field} data-testid="input-provider-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('short_code')} *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., FR24" {...field} data-testid="input-short-code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('website_url')} *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} data-testid="input-website-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('documentation')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://docs.example.com" {...field} value={field.value || ''} data-testid="input-documentation-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('coverage_technical')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="geographicCoverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('geographic_coverage')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Global" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="realtimeLatency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('realtime_latency')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1-3 seconds" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {renderArrayField('Data Sources', dataSourceFields, setDataSourceFields, 'ds')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories?.map((category) => (
                <FormField
                  key={category.id}
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), category.id]);
                            } else {
                              field.onChange(field.value?.filter((id) => id !== category.id));
                            }
                          }}
                          data-testid={`checkbox-category-${category.id}`}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {category.name}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createProvider.isPending || updateProvider.isPending}
            data-testid="button-save-provider"
          >
            {provider ? t('update_provider') : t('create_provider')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
