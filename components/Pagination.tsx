import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  itemsPerPage
}) => {
  const { t } = useThemeStore();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-0">
        {t('Showing')} <span className="font-medium text-slate-900 dark:text-white">{startItem}</span> {t('to')} <span className="font-medium text-slate-900 dark:text-white">{endItem}</span> {t('of')} <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> {t('results')}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('Previous')}
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Logic to show pages around current page could go here for large page counts
            // For now, simple simplified logic for demo
            let pageNum = i + 1;
             if (totalPages > 5) {
                if (currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                }
                if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - i);
                }
             }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={t('Next')}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;