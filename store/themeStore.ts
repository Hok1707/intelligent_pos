import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'km';
export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Sidebar
  'Dashboard': { en: 'Dashboard', km: 'ផ្ទាំងគ្រប់គ្រង' },
  'Stock': { en: 'Stock', km: 'ស្តុកទំនិញ' },
  'Installments': { en: 'Installments', km: 'ការបង់រំលស់' },
  'Plans': { en: 'Plans', km: 'គម្រោង' },
  'AI Studio': { en: 'AI Studio', km: 'ស្ទូឌីយោ AI' },
  'Sign Out': { en: 'Sign Out', km: 'ចាកចេញ' },
  
  // Dashboard
  'Overview': { en: 'Dashboard Overview', km: 'ទិដ្ឋភាពទូទៅនៃផ្ទាំងគ្រប់គ្រង' },
  'Total Stock Value': { en: 'Total Stock Value', km: 'តម្លៃស្តុកសរុប' },
  'Low Stock Items': { en: 'Low Stock Items', km: 'ទំនិញជិតអស់ស្តុក' },
  'Active Customers': { en: 'Active Customers', km: 'អតិថិជនសកម្ម' },
  'Monthly Revenue': { en: 'Monthly Revenue', km: 'ចំណូលប្រចាំខែ' },
  'Weekly Sales': { en: 'Weekly Sales', km: 'ការលក់ប្រចាំសប្តាហ៍' },
  'Revenue Trend': { en: 'Revenue Trend', km: 'និន្នាការចំណូល' },
  'Requires attention': { en: 'Requires attention', km: 'ត្រូវការការយកចិត្តទុកដាក់' },
  'from last month': { en: 'from last month', km: 'ពីខែមុន' },

  // Stock
  'Inventory Management': { en: 'Inventory Management', km: 'ការគ្រប់គ្រងសារពើភ័ណ្ឌ' },
  'Add Item': { en: 'Add Item', km: 'បន្ថែមទំនិញ' },
  'Edit Item': { en: 'Edit Item', km: 'កែសម្រួលទំនិញ' },
  'Update Item': { en: 'Update Item', km: 'ធ្វើបច្ចុប្បន្នភាពទំនិញ' },
  'Search placeholder': { en: 'Search by name or SKU...', km: 'ស្វែងរកតាមឈ្មោះ ឬ SKU...' },
  'Item Name': { en: 'Item Name', km: 'ឈ្មោះទំនិញ' },
  'Brand': { en: 'Brand', km: 'ម៉ាក' },
  'Price': { en: 'Price', km: 'តម្លៃ' },
  'Quantity': { en: 'Quantity', km: 'បរិមាណ' },
  'Category': { en: 'Category', km: 'ប្រភេទ' },
  'Stock Level': { en: 'Stock Level', km: 'កម្រិតស្តុក' },
  'Status': { en: 'Status', km: 'ស្ថានភាព' },
  'Actions': { en: 'Actions', km: 'សកម្មភាព' },
  'In Stock': { en: 'In Stock', km: 'មានក្នុងស្តុក' },
  'Low Stock': { en: 'Low Stock', km: 'ជិតអស់ស្តុក' },
  'Out of Stock': { en: 'Out of Stock', km: 'អស់ស្តុក' },
  'Bulk Actions': { en: 'Bulk Actions', km: 'សកម្មភាពជាក្រុម' },
  'items selected': { en: 'items selected', km: 'ទំនិញបានជ្រើសរើស' },
  'Delete Selected': { en: 'Delete Selected', km: 'លុបដែលបានជ្រើសរើស' },
  'Update Stock': { en: 'Update Stock', km: 'ធ្វើបច្ចុប្បន្នភាពស្តុក' },
  'Set New Quantity': { en: 'Set New Quantity', km: 'កំណត់បរិមាណថ្មី' },
  'Apply': { en: 'Apply', km: 'អនុវត្ត' },
  'Cancel': { en: 'Cancel', km: 'បោះបង់' },
  'Product Name': { en: 'Product Name', km: 'ឈ្មោះផលិតផល' },
  'Are you sure you want to delete': { en: 'Are you sure you want to delete', km: 'តើអ្នកប្រាកដថាចង់លុប' },
  'items': { en: 'items', km: 'ធាតុ' },
  'Update stock quantity for': { en: 'Update stock quantity for', km: 'ធ្វើបច្ចុប្បន្នភាពបរិមាណស្តុកសម្រាប់' },
  'selected items': { en: 'selected items', km: 'ធាតុដែលបានជ្រើសរើស' },
  'No items found': { en: 'No items found matching your search.', km: 'រកមិនឃើញធាតុដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។' },

  // Form Validation
  'Name required': { en: 'Product name must be at least 2 characters', km: 'ឈ្មោះផលិតផលត្រូវមានយ៉ាងហោចណាស់ ២ តួអក្សរ' },
  'SKU required': { en: 'SKU must be at least 3 characters', km: 'SKU ត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ' },
  'Brand required': { en: 'Brand is required', km: 'ត្រូវការម៉ាក' },
  'Price required': { en: 'Price must be greater than 0', km: 'តម្លៃត្រូវតែធំជាង ០' },
  'Quantity required': { en: 'Quantity cannot be negative', km: 'បរិមាណមិនអាចអវិជ្ជមានបានទេ' },

  // Payments
  'Payments & Installments': { en: 'Payments & Installments', km: 'ការទូទាត់ និងការបង់រំលស់' },
  'Installment Calculator': { en: 'Installment Calculator', km: 'ម៉ាស៊ីនគណនាការបង់រំលស់' },
  'Device Price': { en: 'Device Price ($)', km: 'តម្លៃឧបករណ៍ ($)' },
  'Duration': { en: 'Duration (Months)', km: 'រយៈពេល (ខែ)' },
  'Months': { en: 'Months', km: 'ខែ' },
  'Interest Rate': { en: 'Interest Rate (%)', km: 'អត្រាការប្រាក់ (%)' },
  'Monthly Payment': { en: 'Monthly Payment', km: 'ការបង់ប្រចាំខែ' },
  'Total Repayment': { en: 'Total Repayment', km: 'ការសងសរុប' },
  'Upcoming Due Dates': { en: 'Upcoming Due Dates', km: 'កាលបរិច្ឆេទត្រូវបង់ប្រាក់' },
  'Installment Management': { en: 'Installment Management', km: 'ការគ្រប់គ្រងការបង់រំលស់' },
  'Customer': { en: 'Customer', km: 'អតិថិជន' },
  'Device': { en: 'Device', km: 'ឧបករណ៍' },
  'Total Amount': { en: 'Total Amount', km: 'ចំនួនទឹកប្រាក់សរុប' },
  'Remaining': { en: 'Remaining', km: 'នៅសល់' },
  'Next Due': { en: 'Next Due', km: 'ថ្ងៃកំណត់បន្ទាប់' },
  'Search installments...': { en: 'Search installments...', km: 'ស្វែងរកការបង់រំលស់...' },
  'Paid': { en: 'Paid', km: 'បានបង់' },
  'Overdue': { en: 'Overdue', km: 'ហួសកំណត់' },
  'Pending': { en: 'Pending', km: 'រង់ចាំ' },
  'No installments found': { en: 'No installment plans found.', km: 'រកមិនឃើញគម្រោងបង់រំលស់ទេ។' },

  // Subscriptions
  'Choose your plan': { en: 'Choose your plan', km: 'ជ្រើសរើសគម្រោងរបស់អ្នក' },
  'Manage your shop': { en: 'Manage your shop efficiently with our flexible subscription tiers.', km: 'គ្រប់គ្រងហាងរបស់អ្នកប្រកបដោយប្រសិទ្ធភាពជាមួយកម្រិតនៃការជាវដ៏បត់បែនរបស់យើង។' },
  'Current Plan Label': { en: 'Current Plan:', km: 'គម្រោងបច្ចុប្បន្ន៖' },
  'View Details': { en: 'View Details', km: 'មើលព័ត៌មានលម្អិត' },
  'BEST VALUE': { en: 'BEST VALUE', km: 'តម្លៃល្អបំផុត' },
  'Switch to': { en: 'Switch to', km: 'ប្តូរទៅ' },
  'Active Plan': { en: 'Active Plan', km: 'គម្រោងសកម្ម' },
  'Included Features': { en: 'Included Features', km: 'លក្ខណៈពិសេសរួមបញ្ចូល' },
  'Enterprise Security': { en: 'Enterprise-grade Security', km: 'សុវត្ថិភាពកម្រិតសហគ្រាស' },
  'Security Desc': { en: 'All plans include 256-bit SSL encryption and automated daily backups.', km: 'គម្រោងទាំងអស់រួមបញ្ចូលការអ៊ិនគ្រីប SSL 256-bit និងការបម្រុងទុកដោយស្វ័យប្រវត្តិប្រចាំថ្ងៃ។' },
  'Close': { en: 'Close', km: 'បិទ' },
  'AI POWERED': { en: 'AI POWERED', km: 'ដំណើរការដោយ AI' },

  // Plan Content
  'Starter': { en: 'Starter', km: 'ចាប់ផ្តើម' },
  'Pro Growth': { en: 'Pro Growth', km: 'គាំទ្រកំណើន' },
  'Enterprise AI': { en: 'Enterprise AI', km: 'សហគ្រាស AI' },
  'Starter Desc': { en: 'The essential toolkit for new businesses. Manage your stock and view basic reports completely free.', km: 'ឧបករណ៍សំខាន់សម្រាប់អាជីវកម្មថ្មី។ គ្រប់គ្រងស្តុក និងមើលរបាយការណ៍មូលដ្ឋានដោយឥតគិតថ្លៃ។' },
  'Pro Desc': { en: 'Designed for growing retailers who need to manage payments, installments, and customer relationships effectively.', km: 'រចនាឡើងសម្រាប់អ្នកលក់រាយដែលកំពុងរីកចម្រើន ដែលត្រូវការគ្រប់គ្រងការទូទាត់ ការបង់រំលស់ និងទំនាក់ទំនងអតិថិជនប្រកបដោយប្រសិទ្ធភាព។' },
  'Enterprise Desc': { en: 'The ultimate power suite. Unlock generative AI to create marketing assets, analyze complex data, and automate workflows.', km: 'ឈុតថាមពលចុងក្រោយ។ ដោះសោ AI បង្កើតដើម្បីបង្កើតធនធានទីផ្សារ វិភាគទិន្នន័យស្មុគស្មាញ និងស្វ័យប្រវត្តិកម្មការងារ។' },
  'Ideal Small': { en: 'Small businesses, Pop-up stores', km: 'អាជីវកម្មខ្នាតតូច ហាងចល័ត' },
  'Ideal Growing': { en: 'Growing retailers, Multi-location stores', km: 'អ្នកលក់រាយដែលកំពុងរីកចម្រើន ហាងដែលមានទីតាំងច្រើន' },
  'Ideal Enterprise': { en: 'Enterprise chains, High-volume sellers', km: 'បណ្តាញសហគ្រាស អ្នកលក់ក្នុងបរិមាណច្រើន' },
  'Basic Dashboard': { en: 'Basic Dashboard', km: 'ផ្ទាំងគ្រប់គ្រងមូលដ្ឋាន' },
  'Standard Support': { en: 'Standard Support', km: 'ការគាំទ្រស្តង់ដារ' },
  '1 Admin User': { en: '1 Admin User', km: 'អ្នកគ្រប់គ្រង ១ នាក់' },
  'Everything in Starter': { en: 'Everything in Starter', km: 'អ្វីៗទាំងអស់នៅក្នុងគម្រោងចាប់ផ្តើម' },
  'Customer CRM': { en: 'Customer CRM', km: 'ការគ្រប់គ្រងទំនាក់ទំនងអតិថិជន' },
  'Advanced Analytics': { en: 'Advanced Analytics', km: 'ការវិភាគកម្រិតខ្ពស់' },
  'Email Support': { en: 'Email Support', km: 'ការគាំទ្រតាមអ៊ីមែល' },
  'Everything in Pro': { en: 'Everything in Pro', km: 'អ្វីៗទាំងអស់នៅក្នុងគម្រោងគាំទ្រកំណើន' },
  'Gemini 3 Pro AI Assistant': { en: 'Gemini 3 Pro AI Assistant', km: 'ជំនួយការ AI Gemini 3 Pro' },
  'Image Generation Studio': { en: 'Image Generation Studio', km: 'ស្ទូឌីយោបង្កើតរូបភាព' },
  'Unlimited AI Tokens': { en: 'Unlimited AI Tokens', km: 'AI Tokens មិនកំណត់' },
  'Priority 24/7 Support': { en: 'Priority 24/7 Support', km: 'ការគាំទ្រអាទិភាព ២៤/៧' },

  // AI Tools
  'AI Assistant': { en: 'AI Assistant', km: 'ជំនួយការ AI' },
  'Image Studio': { en: 'Image Studio', km: 'ស្ទូឌីយោរូបភាព' },
  'Ask placeholder': { en: "Ask about stock, or say 'Remind me to...'", km: "សួរអំពីស្តុក ឬនិយាយថា 'រំលឹកខ្ញុំឱ្យ...'" },
  'Tasks': { en: 'Tasks', km: 'ភារកិច្ច' },
  'Task Empty': { en: 'Your task list is empty.', km: 'បញ្ជីភារកិច្ចរបស់អ្នកទទេ' },
  'Image Prompt': { en: 'Image Prompt', km: 'ការពិពណ៌នារូបភាព' },
  'Describe image': { en: 'Describe the smartphone promotional image you want...', km: 'ពិពណ៌នារូបភាពផ្សព្វផ្សាយស្មាតហ្វូនដែលអ្នកចង់បាន...' },
  'Generate Image': { en: 'Generate Image', km: 'បង្កើតរូបភាព' },
  'Generating': { en: 'Generating...', km: 'កំពុងបង្កើត...' },
  'Resolution': { en: 'Resolution', km: 'កម្រិតបង្ហាញ' },
  'Model Welcome': { en: 'Hello! I am your SmartPOS assistant. You can ask me questions or say "Remind me to..." to create a task.', km: 'សួស្តី! ខ្ញុំគឺជាជំនួយការ SmartPOS របស់អ្នក។ អ្នកអាចសួរខ្ញុំនូវសំណួរ ឬនិយាយថា "Remind me to..." ដើម្បីបង្កើតភារកិច្ច។' },
  'Error Error': { en: "I'm sorry, I encountered an error processing your request.", km: "ខ្ញុំសុំទោស ខ្ញុំបានជួបបញ្ហាក្នុងការដំណើរការសំណើរបស់អ្នក។" },
  'Task Added': { en: "I've added this to your tasks list.", km: "ខ្ញុំបានបន្ថែមវាទៅក្នុងបញ្ជីភារកិច្ចរបស់អ្នកហើយ។" },
  'Note Quality': { en: 'High-quality generation (2K/4K) uses the gemini-3-pro-image-preview model.', km: 'ការបង្កើតគុណភាពខ្ពស់ (2K/4K) ប្រើប្រាស់ម៉ូដែល gemini-3-pro-image-preview ។' },

  // Landing Page
  'Login': { en: 'Login', km: 'ចូល' },
  'Get Started': { en: 'Get Started', km: 'ចាប់ផ្តើម' },
  'Start Free Trial': { en: 'Start Free Trial', km: 'សាកល្បងឥតគិតថ្លៃ' },
  'See How It Works': { en: 'See How It Works', km: 'មើលរបៀបដែលវាដំណើរការ' },
  'Trusted by': { en: 'Trusted by innovative retailers', km: 'ជឿទុកចិត្តដោយអ្នកលក់រាយប្រកបដោយភាពច្នៃប្រឌិត' },
  'Landing Title 1': { en: 'Manage your Phone Store', km: 'គ្រប់គ្រងហាងទូរស័ព្ទរបស់អ្នក' },
  'Landing Title 2': { en: 'with AI Superpowers', km: 'ជាមួយថាមពល AI' },
  'Landing Subtitle': { en: 'The all-in-one POS, ERP, and Stock management system designed for modern smartphone retailers. Now with Gemini AI integration.', km: 'ប្រព័ន្ធ POS, ERP និងការគ្រប់គ្រងស្តុក ដែលរចនាឡើងសម្រាប់អ្នកលក់រាយស្មាតហ្វូនសម័យថ្មី។ ឥឡូវនេះមានការរួមបញ្ចូល Gemini AI ។' },
  'Real-time Analytics': { en: 'Real-time Analytics', km: 'ការវិភាគទិន្នន័យផ្ទាល់' },
  'Feature Desc 1': { en: 'Track sales, low stock, and revenue with our interactive dashboard.', km: 'តាមដានការលក់ ស្តុកទាប និងចំណូលជាមួយផ្ទាំងគ្រប់គ្រងអន្តរកម្មរបស់យើង។' },
  'Secure Payments': { en: 'Secure Payments', km: 'ការទូទាត់ដែលមានសុវត្ថិភាព' },
  'Feature Desc 2': { en: 'Manage installment plans and customer payments with ease.', km: 'គ្រប់គ្រងគម្រោងបង់រំលស់ និងការទូទាត់របស់អតិថិជនដោយងាយស្រួល។' },
  'Gemini AI Tools': { en: 'Gemini AI Tools', km: 'ឧបករណ៍ Gemini AI' },
  'Feature Desc 3': { en: 'Generate marketing visuals and get business advice from our AI assistant.', km: 'បង្កើតរូបភាពទីផ្សារ និងទទួលបានដំបូន្មានអាជីវកម្មពីជំនួយការ AI របស់យើង។' },
  'Instant Setup': { en: 'Instant Setup', km: 'ការដំឡើងភ្លាមៗ' },
  'Instant Setup Desc': { en: 'Get up and running in minutes. Import your inventory via CSV and start selling immediately.', km: 'ដំណើរការក្នុងរយៈពេលប៉ុន្មាននាទី។ នាំចូលសារពើភ័ណ្ឌរបស់អ្នកតាមរយៈ CSV ហើយចាប់ផ្តើមលក់ភ្លាមៗ។' },
  'CRM Built-in': { en: 'CRM Built-in', km: 'CRM ភ្ជាប់មកជាមួយ' },
  'CRM Desc': { en: 'Track customer purchase history, manage loyalty points, and send automated follow-ups.', km: 'តាមដានប្រវត្តិការទិញរបស់អតិថិជន គ្រប់គ្រងពិន្ទុស្មោះត្រង់ និងផ្ញើការតាមដានដោយស្វ័យប្រវត្តិ។' },
  'Multi-Language': { en: 'Multi-Language', km: 'ពហុភាសា' },
  'Multi-Language Desc': { en: 'Support for English and Khmer out of the box, with more languages coming soon.', km: 'ការគាំទ្រសម្រាប់ភាសាអង់គ្លេស និងខ្មែរ ជាមួយភាសាជាច្រើនទៀតដែលនឹងមកដល់ក្នុងពេលឆាប់ៗនេះ។' },
  'Everything needed': { en: 'Everything you need to scale', km: 'អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីពង្រីក' },
  'Stop wrestling': { en: 'Stop wrestling with spreadsheets and disjointed tools. SmartPOS unifies your entire operation.', km: 'ឈប់ពិបាកជាមួយតារាង និងឧបករណ៍ដែលមិនជាប់លាប់។ SmartPOS បង្រួបបង្រួមប្រតិបត្តិការទាំងមូលរបស់អ្នក។' },
  'Powered by Google': { en: 'Powered by Google Gemini', km: 'ដំណើរការដោយ Google Gemini' },
  'Personal Assistant': { en: 'Your Personal Business Assistant', km: 'ជំនួយការអាជីវកម្មផ្ទាល់ខ្លួនរបស់អ្នក' },
  'Imagine having': { en: 'Imagine having a data analyst, marketing manager, and support agent available 24/7. SmartPOS AI helps you:', km: 'ស្រមៃថាមានអ្នកវិភាគទិន្នន័យ អ្នកគ្រប់គ្រងទីផ្សារ និងភ្នាក់ងារគាំទ្រដែលអាចរកបាន ២៤/៧ ។ SmartPOS AI ជួយអ្នក៖' },
  'AI List 1': { en: 'Draft professional emails to customers', km: 'រៀបចំអ៊ីមែលដែលមានជំនាញវិជ្ជាជីវៈទៅកាន់អតិថិជន' },
  'AI List 2': { en: 'Generate promotional images for social media', km: 'បង្កើតរូបភាពផ្សព្វផ្សាយសម្រាប់បណ្តាញសង្គម' },
  'AI List 3': { en: 'Analyze sales trends and predict stock shortages', km: 'វិភាគនិន្នាការលក់ និងទស្សន៍ទាយការខ្វះខាតស្តុក' },
  'AI List 4': { en: 'Answer complex queries about your business performance', km: 'ឆ្លើយសំណួរស្មុគស្មាញអំពីការអនុវត្តអាជីវកម្មរបស់អ្នក' },
  'Ready to transform': { en: 'Ready to transform your business?', km: 'ត្រៀមខ្លួនដើម្បីផ្លាស់ប្តូរអាជីវកម្មរបស់អ្នកហើយឬនៅ?' },
  'Join thousands': { en: 'Join thousands of retailers using SmartPOS to drive growth and efficiency.', km: 'ចូលរួមជាមួយអ្នកលក់រាយរាប់ពាន់នាក់ដែលប្រើប្រាស់ SmartPOS ដើម្បីជំរុញកំណើន និងប្រសិទ្ធភាព។' },
  'No credit card': { en: 'No credit card required. 14-day free trial.', km: 'មិនត្រូវការកាតឥណទានទេ។ ការសាកល្បងឥតគិតថ្លៃ ១៤ ថ្ងៃ។' },
  'Footer Copyright': { en: '© 2024 SmartPOS Inc. Powered by Gemini 3 Pro.', km: 'រក្សាសិទ្ធិគ្រប់យ៉ាង © 2024 SmartPOS Inc. ដំណើរការដោយ Gemini 3 Pro.' },
  'Privacy Policy': { en: 'Privacy Policy', km: 'គោលការណ៍​ភាព​ឯកជន' },
  'Terms of Service': { en: 'Terms of Service', km: 'លក្ខខណ្ឌ​នៃ​សេវាកម្ម' },
  'Contact Support': { en: 'Contact Support', km: 'ទាក់ទង​ផ្នែក​ជំនួយ' },
  'Version Info': { en: 'v2.0 Now Available with Gemini 3 Pro', km: 'v2.0 ឥឡូវនេះមានជាមួយ Gemini 3 Pro' },
  
  // Login / Register
  'Welcome back': { en: 'Welcome back', km: 'សូមស្វាគមន៍មកវិញ' },
  'Enter credentials': { en: 'Enter your credentials to access your dashboard', km: 'បញ្ចូលព័ត៌មានសម្ងាត់របស់អ្នកដើម្បីចូលប្រើផ្ទាំងគ្រប់គ្រង' },
  'Email Address': { en: 'Email Address', km: 'អាសយដ្ឋានអ៊ីមែល' },
  'Password': { en: 'Password', km: 'ពាក្យសម្ងាត់' },
  'Forgot password?': { en: 'Forgot password?', km: 'ភ្លេចពាក្យសម្ងាត់?' },
  'Sign In': { en: 'Sign In', km: 'ចូលគណនី' },
  'No account': { en: "Don't have an account?", km: "មិនទាន់មានគណនី?" },
  'Sign up': { en: 'Sign up', km: 'ចុះឈ្មោះ' },
  'Back to Login': { en: 'Back to Login', km: 'ត្រឡប់ទៅចូលគណនីវិញ' },
  'Register': { en: 'Register', km: 'ចុះឈ្មោះ' },
  'Registration Mock': { en: 'Registration is mocked. Please go to Login.', km: 'ការចុះឈ្មោះគឺសាកល្បង។ សូមចូលទៅកាន់ការចូលគណនី។' },
  'Username': { en: 'Username', km: 'ឈ្មោះអ្នកប្រើប្រាស់' },
  'Confirm Password': { en: 'Confirm Password', km: 'បញ្ជាក់ពាក្យសម្ងាត់' },
  'Create Account': { en: 'Create Account', km: 'បង្កើតគណនី' },
  'Already have an account?': { en: 'Already have an account?', km: 'មានគណនីរួចហើយ?' },
  'Username min length': { en: 'Username must be at least 3 characters', km: 'ឈ្មោះអ្នកប្រើប្រាស់ត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ' },
  'Invalid email': { en: 'Invalid email address', km: 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ' },
  'Password min length': { en: 'Password must be at least 6 characters', km: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ' },
  'Passwords do not match': { en: 'Passwords do not match', km: 'ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ' },
  'Verifying': { en: 'Verifying...', km: 'កំពុងផ្ទៀងផ្ទាត់...' },

  // Access Control
  'Access Restricted': { en: 'Access Restricted', km: 'ការចូលប្រើត្រូវបានដាក់កម្រិត' },
  'Feature requires': { en: 'This feature requires the', km: 'លក្ខណៈពិសេសនេះត្រូវការ' },
  'plan or higher': { en: 'plan or higher. Please upgrade your subscription to access this page.', km: 'គម្រោងឬខ្ពស់ជាងនេះ។ សូមដំឡើងការជាវរបស់អ្នកដើម្បីចូលប្រើទំព័រនេះ។' },
  'View Upgrade Options': { en: 'View Upgrade Options', km: 'មើលជម្រើសដំឡើង' },

  // Pagination
  'Previous': { en: 'Previous', km: 'មុន' },
  'Next': { en: 'Next', km: 'បន្ទាប់' },
  'Page': { en: 'Page', km: 'ទំព័រ' },
  'of': { en: 'of', km: 'នៃ' },
  'Showing': { en: 'Showing', km: 'បង្ហាញ' },
  'to': { en: 'to', km: 'ដល់' },
  'results': { en: 'results', km: 'លទ្ធផល' },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'en',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        const item = translations[key];
        return item ? item[lang] : key;
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);