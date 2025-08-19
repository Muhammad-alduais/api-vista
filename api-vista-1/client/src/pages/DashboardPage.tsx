import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Layers, 
  Route, 
  Play, 
  Globe, 
  Tag,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const { data: providers = [] } = useQuery({
    queryKey: ["/api/providers"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Calculate statistics
  const totalProviders = providers.length;
  const totalServices = providers.reduce((acc: number, provider: any) => 
    acc + (provider.services?.length || 0), 0);
  const totalApis = providers.reduce((acc: number, provider: any) => 
    acc + (provider.services?.reduce((serviceAcc: number, service: any) => 
      serviceAcc + (service.apis?.length || 0), 0) || 0), 0);
  const totalEndpoints = providers.reduce((acc: number, provider: any) => 
    acc + (provider.services?.reduce((serviceAcc: number, service: any) => 
      serviceAcc + (service.apis?.reduce((apiAcc: number, api: any) => 
        apiAcc + (api.endpoints?.length || 0), 0) || 0), 0) || 0), 0);

  const activeProviders = providers.filter((p: any) => p.isActive).length;

  const stats = [
    {
      title: "Total Providers",
      value: totalProviders,
      icon: Building,
      description: `${activeProviders} active`,
      href: "/providers",
      color: "text-blue-600"
    },
    {
      title: "Categories",
      value: categories.length,
      icon: Tag,
      description: "Classification systems",
      href: "/categories",
      color: "text-green-600"
    },
    {
      title: "Services",
      value: totalServices,
      icon: Globe,
      description: "Service domains",
      href: "/services",
      color: "text-purple-600"
    },
    {
      title: "APIs",
      value: totalApis,
      icon: Layers,
      description: "API endpoints",
      href: "/apis",
      color: "text-orange-600"
    },
    {
      title: "Endpoints",
      value: totalEndpoints,
      icon: Route,
      description: "Resource endpoints",
      href: "/endpoints",
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            API Management Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Comprehensive overview of your API ecosystem
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="font-semibold text-blue-600">Developed by Duais</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.description}
              </p>
              <Link href={stat.href}>
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  View all <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Featured Providers
            </CardTitle>
            <CardDescription>
              Key API providers in your ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providers.slice(0, 3).map((provider: any) => (
              <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {provider.shortCode} • {provider.geographicCoverage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={provider.isActive ? "default" : "secondary"}>
                    {provider.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Link href={`/providers/${provider.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link href="/providers">
              <Button variant="outline" className="w-full">
                View All Providers
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories Overview
            </CardTitle>
            <CardDescription>
              API classification and organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.slice(0, 3).map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Tag className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <Link href={`/categories/${category.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
            <Link href="/categories">
              <Button variant="outline" className="w-full">
                View All Categories
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/providers/new">
              <Button className="w-full justify-start" variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Add Provider
              </Button>
            </Link>
            <Link href="/categories/new">
              <Button className="w-full justify-start" variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </Link>
            <Link href="/search">
              <Button className="w-full justify-start" variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                Search APIs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}