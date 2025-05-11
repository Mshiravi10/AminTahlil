import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { compareTraces } from '../../api/comparison-service';
import { getServices, getTrace } from '../../api/trace-service';
import { TraceComparisonResult, Trace } from '../../types';
import TraceComparison from '../../components/comparison/TraceComparison';

const TraceComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [comparisonResult, setComparisonResult] = useState<TraceComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTraceIds, setSelectedTraceIds] = useState<string[]>([]);
  const [availableTraces, setAvailableTraces] = useState<Trace[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  
  // Initialize selected trace IDs from URL parameters
  useEffect(() => {
    const traceIds = searchParams.get('traceIds');
    if (traceIds) {
      setSelectedTraceIds(traceIds.split(','));
    }
  }, [searchParams]);
  
  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await getServices();
        setServices(servicesData);
        if (servicesData.length > 0 && !selectedService) {
          setSelectedService(servicesData[0]);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('خطا در دریافت لیست سرویس‌ها.');
      }
    };
    
    fetchServices();
  }, []);
  
  // Fetch comparison data when trace IDs change
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (selectedTraceIds.length < 2) {
        setComparisonResult(null);
        return;
      }
      
      try {
        setIsLoading(true);
        const result = await compareTraces({ traceIds: selectedTraceIds });
        setComparisonResult(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError('خطا در دریافت اطلاعات مقایسه تریس‌ها.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [selectedTraceIds]);
  
  // Handle trace selection
  const handleTraceSelect = (traceId: string) => {
    navigate(`/traces/${traceId}`);
  };
  
  // Handle adding a trace to comparison
  const handleAddTrace = async (traceId: string) => {
    if (selectedTraceIds.includes(traceId) || !traceId) return;
    
    try {
      // Verify trace exists
      await getTrace(traceId);
      
      // Add to selected traces
      const newSelectedTraceIds = [...selectedTraceIds, traceId];
      setSelectedTraceIds(newSelectedTraceIds);
      
      // Update URL
      navigate({
        pathname: '/comparison',
        search: `?traceIds=${newSelectedTraceIds.join(',')}`
      });
    } catch (err) {
      setError(`تریس با شناسه ${traceId} یافت نشد.`);
    }
  };
  
  // Handle removing a trace from comparison
  const handleRemoveTrace = (traceId: string) => {
    const newSelectedTraceIds = selectedTraceIds.filter(id => id !== traceId);
    setSelectedTraceIds(newSelectedTraceIds);
    
    // Update URL
    navigate({
      pathname: '/comparison',
      search: newSelectedTraceIds.length > 0 ? `?traceIds=${newSelectedTraceIds.join(',')}` : ''
    });
  };
  
  // Handle service change to fetch traces for that service
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">مقایسه تریس‌ها</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Selection Panel */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">انتخاب تریس‌ها برای مقایسه</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selected Traces */}
          <div>
            <h3 className="text-md font-medium mb-2">تریس‌های انتخاب‌شده</h3>
            
            {selectedTraceIds.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 text-gray-500 text-center">
                تریسی انتخاب نشده است. حداقل دو تریس برای مقایسه انتخاب کنید.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTraceIds.map((traceId, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded p-2">
                    <span className="font-mono text-sm truncate">{traceId}</span>
                    <button
                      onClick={() => handleRemoveTrace(traceId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Trace */}
          <div>
            <h3 className="text-md font-medium mb-2">افزودن تریس</h3>
            
            <div className="space-y-3">
              {/* Manual Entry */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  افزودن با شناسه تریس:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="traceId"
                    className="flex-1 border border-gray-300 rounded-r-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="شناسه تریس را وارد کنید"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('traceId') as HTMLInputElement;
                      handleAddTrace(input.value);
                      input.value = '';
                    }}
                    className="bg-blue-500 text-white py-2 px-4 rounded-l-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    افزودن
                  </button>
                </div>
              </div>
              
              {/* From Service */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  جستجو بر اساس سرویس:
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedService}
                  onChange={handleServiceChange}
                >
                  {services.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Results */}
      {selectedTraceIds.length >= 2 ? (
        <TraceComparison 
          data={comparisonResult} 
          isLoading={isLoading}
          onTraceSelect={handleTraceSelect}
        />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          لطفاً حداقل دو تریس را برای مقایسه انتخاب کنید.
        </div>
      )}
    </div>
  );
};

export default TraceComparisonPage;
