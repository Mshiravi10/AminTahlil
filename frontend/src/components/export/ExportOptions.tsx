import React from 'react';
import { 
  exportTraceAsJson, 
  exportTraceAsCsv, 
  generateTraceReport,
  exportServiceStatistics
} from '../../api/export-service';

interface ExportTraceOptionsProps {
  traceId: string;
}

export const ExportTraceOptions: React.FC<ExportTraceOptionsProps> = ({ traceId }) => {
  const handleExportJson = () => {
    window.open(exportTraceAsJson(traceId), '_blank');
  };
  
  const handleExportCsv = () => {
    window.open(exportTraceAsCsv(traceId), '_blank');
  };
  
  const handleGenerateReport = () => {
    window.open(generateTraceReport(traceId), '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-3">خروجی‌گیری تریس</h3>
      <div className="space-y-3">
        <button
          onClick={handleExportJson}
          className="w-full py-2 px-4 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          خروجی JSON
        </button>
        
        <button
          onClick={handleExportCsv}
          className="w-full py-2 px-4 border border-green-500 text-green-500 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          خروجی CSV
        </button>
        
        <button
          onClick={handleGenerateReport}
          className="w-full py-2 px-4 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ایجاد گزارش HTML
        </button>
      </div>
    </div>
  );
};

interface ExportServiceOptionsProps {
  serviceName: string;
}

export const ExportServiceOptions: React.FC<ExportServiceOptionsProps> = ({ serviceName }) => {
  const [timeRange, setTimeRange] = React.useState(24);
  
  const handleExportStatistics = () => {
    window.open(exportServiceStatistics(serviceName, timeRange), '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-3">خروجی‌گیری اطلاعات سرویس</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          بازه زمانی (ساعت):
        </label>
        <select
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={6}>۶ ساعت اخیر</option>
          <option value={12}>۱۲ ساعت اخیر</option>
          <option value={24}>۲۴ ساعت اخیر</option>
          <option value={48}>۴۸ ساعت اخیر</option>
          <option value={72}>۷۲ ساعت اخیر</option>
        </select>
      </div>
      
      <button
        onClick={handleExportStatistics}
        className="w-full py-2 px-4 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
      >
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        خروجی آمار سرویس (CSV)
      </button>
    </div>
  );
};
