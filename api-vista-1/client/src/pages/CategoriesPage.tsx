import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Languages,
  Building,
  Layers
} from "lucide-react";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["/api/providers"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Category created",
        description: "The category has been successfully created.",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Category updated",
        description: "The category has been successfully updated.",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
    }
  });

  const filteredCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryUsage = (categoryId: string) => {
    const providerCount = providers.filter((provider: any) =>
      provider.categories?.some((cat: any) => cat.id === categoryId)
    ).length;
    
    const apiCount = providers.reduce((acc: number, provider: any) =>
      acc + (provider.services?.reduce((serviceAcc: number, service: any) =>
        serviceAcc + (service.apis?.filter((api: any) =>
          api.categories?.some((cat: any) => cat.id === categoryId)
        ).length || 0), 0) || 0), 0);

    return { providerCount, apiCount };
  };

  const CategoryForm = ({ category, onSubmit, isLoading: submitting }: any) => {
    const [formData, setFormData] = useState({
      name: category?.name || "",
      nameAr: category?.nameAr || "",
      description: category?.description || "",
      descriptionAr: category?.descriptionAr || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Category Name (English) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Aviation"
              required
              data-testid="input-category-name"
            />
          </div>
          <div>
            <Label htmlFor="nameAr">Category Name (Arabic)</Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="e.g., طيران"
              dir="rtl"
              data-testid="input-category-name-ar"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (English)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the category..."
            data-testid="textarea-category-description"
          />
        </div>

        <div>
          <Label htmlFor="descriptionAr">Description (Arabic)</Label>
          <Textarea
            id="descriptionAr"
            value={formData.descriptionAr}
            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
            placeholder="وصف الفئة..."
            dir="rtl"
            data-testid="textarea-category-description-ar"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedCategory(null);
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            data-testid="button-submit-category"
          >
            {submitting ? "Saving..." : category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Tag className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading categories...</p>
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
            API Categories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Organize and classify your API providers and services
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-category">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={(data: any) => createCategoryMutation.mutate(data)}
              isLoading={createCategoryMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-categories"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category: any) => {
          const usage = getCategoryUsage(category.id);
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Tag className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.nameAr && (
                        <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                          {category.nameAr}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Dialog open={isEditDialogOpen && selectedCategory?.id === category.id} 
                           onOpenChange={(open) => {
                             setIsEditDialogOpen(open);
                             if (!open) setSelectedCategory(null);
                           }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          data-testid={`button-edit-category-${category.name.toLowerCase()}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Category: {category.name}</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                          category={selectedCategory}
                          onSubmit={(data: any) => updateCategoryMutation.mutate({ 
                            id: selectedCategory.id, 
                            data 
                          })}
                          isLoading={updateCategoryMutation.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                      data-testid={`button-delete-category-${category.name.toLowerCase()}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {category.description}
                </div>
                
                {category.descriptionAr && (
                  <div className="text-sm text-gray-600 dark:text-gray-300" dir="rtl">
                    {category.descriptionAr}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {usage.providerCount} providers
                    </div>
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-1" />
                      {usage.apiCount} APIs
                    </div>
                  </div>
                  {category.nameAr && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Languages className="h-4 w-4 mr-1" />
                      Bilingual
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <Link href={`/categories/${category.id}`}>
                    <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-category-${category.name.toLowerCase()}`}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No categories found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first category."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>
      )}
    </div>
  );
}