import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategories } from '@/hooks/use-categories';
import { useCreateApi, useUpdateApi } from '@/hooks/use-apis';
import { useToast } from '@/hooks/use-toast';
import { insertApiSchema, type ApiWithRelations } from '@shared/schema';

const formSchema = insertApiSchema.extend({
  categoryIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ApiFormProps {
  api?: ApiWithRelations | null;
  providerId: string;
  onClose: () => void;
}

export function ApiForm({ api, providerId, onClose }: ApiFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const createApi = useCreateApi();
  const updateApi = useUpdateApi();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providerId,
      name: '',
      description: '',
      baseUrl: '',
      version: '',
      authType: '',
      rateLimit: '',
      supportedFormats: [],
      apiDesignStyle: '',
      isActive: true,
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (api) {
      form.reset({
        providerId: api.providerId,
        name: api.name,
        description: api.description || '',
        baseUrl: api.baseUrl,
        version: api.version || '',
        authType: api.authType || '',
        rateLimit: api.rateLimit || '',
        supportedFormats: api.supportedFormats || [],
        apiDesignStyle: api.apiDesignStyle || '',
        isActive: api.isActive || true,
        categoryIds: api.categories.map(c => c.id),
      });
    }
  }, [api, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const { categoryIds, ...apiData } = data;

      if (api) {
        await updateApi.mutateAsync({
          id: api.id,
          ...apiData,
          categoryIds: categoryIds || [],
        });
        toast({
          title: "Success",
          description: "API updated successfully",
        });
      } else {
        await createApi.mutateAsync({
          ...apiData,
          categoryIds: categoryIds || [],
        });
        toast({
          title: "Success",
          description: "API created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Flight Tracking API" {...field} data-testid="input-api-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., v2.1" {...field} value={field.value || ''} data-testid="input-api-version" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('base_url')} *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/v1" {...field} data-testid="input-base-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth_type')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., API Key, OAuth2" {...field} value={field.value || ''} data-testid="input-auth-type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rateLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rate_limit')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1000 req/hour" {...field} value={field.value || ''} data-testid="input-rate-limit" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiDesignStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Design Style</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RESTful, GraphQL" {...field} value={field.value || ''} data-testid="input-design-style" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this API..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                      data-testid="textarea-api-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Is this API currently active and available?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      data-testid="switch-api-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
                          data-testid={`checkbox-api-category-${category.id}`}
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
            disabled={createApi.isPending || updateApi.isPending}
            data-testid="button-save-api"
          >
            {api ? 'Update API' : 'Create API'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
