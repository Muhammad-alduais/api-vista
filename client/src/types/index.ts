import type { ProviderWithRelations, ApiWithRelations, EndpointWithRelations } from '@shared/schema';

export interface SearchResults {
  providers: ProviderWithRelations[];
  apis: ApiWithRelations[];
  endpoints: EndpointWithRelations[];
}

export interface ExportData {
  categories: any[];
  providers: any[];
  apis: any[];
  endpoints: any[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface FormField {
  id: string;
  value: string;
}

export interface PricingPlan {
  planName: string;
  pricingModel: string;
  includedRequests: string;
  overageCost: string;
  featuresIncluded: string[];
  rateLimit?: string;
  trialPeriod?: string;
  linkToPricingPage?: string;
}

export interface InputParameter {
  parameterName: string;
  type: string;
  required: boolean;
  description: string;
  constraints?: string;
  location: string;
}

export interface OutputField {
  fieldName: string;
  type: string;
  description: string;
  nullable: boolean;
  exampleValue?: string;
  nestedFields?: OutputField[];
}

export interface ResponseExample {
  scenario: string;
  httpStatusCode: number;
  exampleBody: string;
}

export interface ErrorCode {
  code: string;
  message: string;
  description: string;
}
