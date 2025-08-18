import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      'api_catalog': 'API Provider Catalog',
      'language_toggle': 'EN | ع',
      'export_data': 'Export Data',
      'add_provider': 'Add Provider',
      
      // Search
      'search_placeholder': 'Search providers, APIs, endpoints...',
      
      // Category Management
      'category_management': 'Category Management',
      'add_category': 'Add Category',
      
      // Navigation
      'all_providers': 'All Providers',
      'click_to_view_apis': 'Click to view APIs',
      
      // Provider Details
      'basic_information': 'Basic Information',
      'coverage_technical': 'Coverage & Technical',
      'short_code': 'Short Code',
      'website_url': 'Website URL',
      'documentation': 'Documentation',
      'geographic_coverage': 'Geographic Coverage',
      'data_sources': 'Data Sources',
      'realtime_latency': 'Real-time Latency',
      
      // APIs
      'apis': 'APIs',
      'add_api': 'Add API',
      'endpoints': 'Endpoints',
      'add_endpoint': 'Add Endpoint',
      'base_url': 'Base URL',
      'auth_type': 'Auth Type',
      'rate_limit': 'Rate Limit',
      'categories': 'Categories',
      
      // Forms
      'provider_name': 'Provider Name',
      'required': 'Required',
      'cancel': 'Cancel',
      'save': 'Save',
      'create_provider': 'Create Provider',
      'update_provider': 'Update Provider',
      'delete_confirm': 'Are you sure you want to delete this item?',
      
      // Status
      'active': 'Active',
      'inactive': 'Inactive',
      'loading': 'Loading...',
      'no_data': 'No data available',
      'error': 'An error occurred',
      
      // Export
      'export_json': 'Export as JSON',
      'export_csv': 'Export as CSV',
    }
  },
  ar: {
    translation: {
      // Header
      'api_catalog': 'كتالوج مزودي واجهة برمجة التطبيقات',
      'language_toggle': 'ع | EN',
      'export_data': 'تصدير البيانات',
      'add_provider': 'إضافة مزود',
      
      // Search
      'search_placeholder': 'البحث في المزودين والواجهات...',
      
      // Category Management
      'category_management': 'إدارة الفئات',
      'add_category': 'إضافة فئة',
      
      // Navigation
      'all_providers': 'جميع المزودين',
      'click_to_view_apis': 'انقر لعرض واجهات برمجة التطبيقات',
      
      // Provider Details
      'basic_information': 'المعلومات الأساسية',
      'coverage_technical': 'التغطية والتقنية',
      'short_code': 'الرمز المختصر',
      'website_url': 'رابط الموقع',
      'documentation': 'الوثائق',
      'geographic_coverage': 'التغطية الجغرافية',
      'data_sources': 'مصادر البيانات',
      'realtime_latency': 'زمن الاستجابة الفوري',
      
      // APIs
      'apis': 'واجهات برمجة التطبيقات',
      'add_api': 'إضافة واجهة برمجة تطبيقات',
      'endpoints': 'نقاط النهاية',
      'add_endpoint': 'إضافة نقطة نهاية',
      'base_url': 'الرابط الأساسي',
      'auth_type': 'نوع المصادقة',
      'rate_limit': 'حد المعدل',
      'categories': 'الفئات',
      
      // Forms
      'provider_name': 'اسم المزود',
      'required': 'مطلوب',
      'cancel': 'إلغاء',
      'save': 'حفظ',
      'create_provider': 'إنشاء مزود',
      'update_provider': 'تحديث مزود',
      'delete_confirm': 'هل أنت متأكد من حذف هذا العنصر؟',
      
      // Status
      'active': 'نشط',
      'inactive': 'غير نشط',
      'loading': 'جاري التحميل...',
      'no_data': 'لا توجد بيانات متاحة',
      'error': 'حدث خطأ',
      
      // Export
      'export_json': 'تصدير كـ JSON',
      'export_csv': 'تصدير كـ CSV',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
