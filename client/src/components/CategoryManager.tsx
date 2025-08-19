import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCategories, useDeleteCategory } from '@/hooks/use-categories';
import { CategoryForm } from './forms/CategoryForm';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@shared/schema';

export function CategoryManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return <div className="text-center py-4">{t('loading')}</div>;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('category_management')}</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-500 hover:bg-green-600" data-testid="button-add-category">
                <Plus className="h-4 w-4 mr-2" />
                {t('add_category')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : t('add_category')}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onClose={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5"
              data-testid={`category-${category.id}`}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(category)}
                className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                data-testid={`button-edit-category-${category.id}`}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(category.id)}
                className="h-5 w-5 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                data-testid={`button-delete-category-${category.id}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-gray-500 text-sm">{t('no_data')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
