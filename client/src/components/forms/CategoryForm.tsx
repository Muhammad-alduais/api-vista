import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';
import { useToast } from '@/hooks/use-toast';
import { insertCategorySchema, type Category } from '@shared/schema';

type FormData = typeof insertCategorySchema._type;

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<FormData>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: category?.name || '',
      nameAr: category?.nameAr || '',
      description: category?.description || '',
      descriptionAr: category?.descriptionAr || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, ...data });
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await createCategory.mutateAsync(data);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name (English) *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Flight Tracking" {...field} data-testid="input-category-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., تتبع الرحلات" {...field} value={field.value || ''} data-testid="input-category-name-ar" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe this category..."
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                    data-testid="textarea-category-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="وصف هذه الفئة..."
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                    data-testid="textarea-category-description-ar"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createCategory.isPending || updateCategory.isPending}
            data-testid="button-save-category"
          >
            {category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
