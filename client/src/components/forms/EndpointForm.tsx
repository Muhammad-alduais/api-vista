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
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateEndpoint, useUpdateEndpoint } from '@/hooks/use-endpoints';
import { useToast } from '@/hooks/use-toast';
import { insertEndpointSchema, type Endpoint } from '@shared/schema';
import type { FormField as FormFieldType, InputParameter, OutputField, ResponseExample, ErrorCode } from '@/types';

const formSchema = insertEndpointSchema.extend({
  httpMethodsInput: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EndpointFormProps {
  endpoint?: Endpoint | null;
  apiId: string;
  onClose: () => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export function EndpointForm({ endpoint, apiId, onClose }: EndpointFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [inputParameters, setInputParameters] = useState<InputParameter[]>([]);
  const [outputFields, setOutputFields] = useState<OutputField[]>([]);
  const [responseExamples, setResponseExamples] = useState<ResponseExample[]>([]);
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);

  const createEndpoint = useCreateEndpoint();
  const updateEndpoint = useUpdateEndpoint();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiId,
      name: '',
      path: '',
      httpMethods: [],
      description: '',
      authRequired: true,
      inputParameters: null,
      outputSchema: null,
      responseExamples: null,
      errorCodes: null,
      endpointRateLimit: '',
    },
  });

  useEffect(() => {
    if (endpoint) {
      form.reset({
        apiId: endpoint.apiId,
        name: endpoint.name,
        path: endpoint.path,
        description: endpoint.description || '',
        httpMethods: endpoint.httpMethods || [],
        authRequired: endpoint.authRequired || false,
        endpointRateLimit: endpoint.endpointRateLimit || '',
        httpMethodsInput: endpoint.httpMethods || [],
        inputParameters: endpoint.inputParameters,
        outputSchema: endpoint.outputSchema,
        responseExamples: endpoint.responseExamples,
        errorCodes: endpoint.errorCodes,
      });
      
      setSelectedMethods(endpoint.httpMethods || []);
      setInputParameters((endpoint.inputParameters as InputParameter[]) || []);
      setOutputFields((endpoint.outputSchema as OutputField[]) || []);
      setResponseExamples((endpoint.responseExamples as ResponseExample[]) || []);
      setErrorCodes((endpoint.errorCodes as ErrorCode[]) || []);
    }
  }, [endpoint, form]);

  const addInputParameter = () => {
    setInputParameters([...inputParameters, {
      parameterName: '',
      type: '',
      required: false,
      description: '',
      constraints: '',
      location: 'query'
    }]);
  };

  const removeInputParameter = (index: number) => {
    setInputParameters(inputParameters.filter((_, i) => i !== index));
  };

  const updateInputParameter = (index: number, field: keyof InputParameter, value: any) => {
    const updated = [...inputParameters];
    updated[index] = { ...updated[index], [field]: value };
    setInputParameters(updated);
  };

  const addOutputField = () => {
    setOutputFields([...outputFields, {
      fieldName: '',
      type: '',
      description: '',
      nullable: false,
      exampleValue: ''
    }]);
  };

  const removeOutputField = (index: number) => {
    setOutputFields(outputFields.filter((_, i) => i !== index));
  };

  const updateOutputField = (index: number, field: keyof OutputField, value: any) => {
    const updated = [...outputFields];
    updated[index] = { ...updated[index], [field]: value };
    setOutputFields(updated);
  };

  const addResponseExample = () => {
    setResponseExamples([...responseExamples, {
      scenario: '',
      httpStatusCode: 200,
      exampleBody: ''
    }]);
  };

  const removeResponseExample = (index: number) => {
    setResponseExamples(responseExamples.filter((_, i) => i !== index));
  };

  const updateResponseExample = (index: number, field: keyof ResponseExample, value: any) => {
    const updated = [...responseExamples];
    updated[index] = { ...updated[index], [field]: value };
    setResponseExamples(updated);
  };

  const addErrorCode = () => {
    setErrorCodes([...errorCodes, {
      code: '',
      message: '',
      description: ''
    }]);
  };

  const removeErrorCode = (index: number) => {
    setErrorCodes(errorCodes.filter((_, i) => i !== index));
  };

  const updateErrorCode = (index: number, field: keyof ErrorCode, value: any) => {
    const updated = [...errorCodes];
    updated[index] = { ...updated[index], [field]: value };
    setErrorCodes(updated);
  };

  const handleMethodToggle = (method: string) => {
    const updated = selectedMethods.includes(method)
      ? selectedMethods.filter(m => m !== method)
      : [...selectedMethods, method];
    setSelectedMethods(updated);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { httpMethodsInput, ...endpointData } = data;
      
      const processedData = {
        ...endpointData,
        httpMethods: selectedMethods,
        inputParameters: inputParameters.length > 0 ? inputParameters : null,
        outputSchema: outputFields.length > 0 ? outputFields : null,
        responseExamples: responseExamples.length > 0 ? responseExamples : null,
        errorCodes: errorCodes.length > 0 ? errorCodes : null,
      };

      if (endpoint) {
        await updateEndpoint.mutateAsync({
          id: endpoint.id,
          ...processedData,
        });
        toast({
          title: "Success",
          description: "Endpoint updated successfully",
        });
      } else {
        await createEndpoint.mutateAsync(processedData);
        toast({
          title: "Success",
          description: "Endpoint created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save endpoint",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Get Flight Data" {...field} data-testid="input-endpoint-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., /flights/{id}" {...field} data-testid="input-endpoint-path" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this endpoint does..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                      data-testid="textarea-endpoint-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-sm font-medium mb-3 block">HTTP Methods</FormLabel>
              <div className="flex flex-wrap gap-2">
                {HTTP_METHODS.map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={selectedMethods.includes(method) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMethodToggle(method)}
                    data-testid={`button-method-${method.toLowerCase()}`}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="authRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-auth-required"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Authentication Required</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Does this endpoint require authentication?
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endpointRateLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint Rate Limit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100 req/min" {...field} value={field.value || ''} data-testid="input-endpoint-rate-limit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inputParameters.map((param, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end p-4 border rounded-lg">
                  <div>
                    <FormLabel className="text-xs">Parameter Name</FormLabel>
                    <Input
                      value={param.parameterName}
                      onChange={(e) => updateInputParameter(index, 'parameterName', e.target.value)}
                      placeholder="name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Type</FormLabel>
                    <Input
                      value={param.type}
                      onChange={(e) => updateInputParameter(index, 'type', e.target.value)}
                      placeholder="string"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Location</FormLabel>
                    <Input
                      value={param.location}
                      onChange={(e) => updateInputParameter(index, 'location', e.target.value)}
                      placeholder="query"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <Input
                      value={param.description}
                      onChange={(e) => updateInputParameter(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={param.required}
                      onCheckedChange={(checked) => updateInputParameter(index, 'required', checked)}
                    />
                    <FormLabel className="text-xs">Required</FormLabel>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInputParameter(index)}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addInputParameter}
                className="w-full"
                data-testid="button-add-input-parameter"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Input Parameter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outputFields.map((field, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-4 border rounded-lg">
                  <div>
                    <FormLabel className="text-xs">Field Name</FormLabel>
                    <Input
                      value={field.fieldName}
                      onChange={(e) => updateOutputField(index, 'fieldName', e.target.value)}
                      placeholder="fieldName"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Type</FormLabel>
                    <Input
                      value={field.type}
                      onChange={(e) => updateOutputField(index, 'type', e.target.value)}
                      placeholder="string"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <Input
                      value={field.description}
                      onChange={(e) => updateOutputField(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.nullable}
                      onCheckedChange={(checked) => updateOutputField(index, 'nullable', checked)}
                    />
                    <FormLabel className="text-xs">Nullable</FormLabel>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOutputField(index)}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addOutputField}
                className="w-full"
                data-testid="button-add-output-field"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Output Field
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createEndpoint.isPending || updateEndpoint.isPending}
            data-testid="button-save-endpoint"
          >
            {endpoint ? 'Update Endpoint' : 'Create Endpoint'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
