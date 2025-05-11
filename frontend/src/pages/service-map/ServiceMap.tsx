import React, { useEffect, useState } from 'react';
import { getServiceMapVisualization, getFilteredServiceMap } from '../../api/service-map-service';
import { ServiceMapVisualizationResponse, ServiceMap as ServiceMapType } from '../../types';
import ServiceMapVisualization from '../../components/service-map/ServiceMapVisualization';
import { ExportServiceOptions } from '../../components/export/ExportOptions';
import { useNavigate } from 'react-router-dom';

const ServiceMap: React.FC = () => {
  const [serviceMapData, setServiceMapData] = useState<ServiceMapVisualizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(24);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getServiceMapVisualization(timeRange);
        setServiceMapData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching service map data:', err);
        setError('خطا در دریافت اطلاعات نقشه سرویس. لطفاً صفحه را مجدداً بارگذاری کنید.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
    // Navigate to service details in a real app:
    // navigate(`/services/${serviceId}`);
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(Number(event.target.value));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">نقشه سرویس</h1>
        
        <div className="flex items-center">
          <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 ml-2">
            بازه زمانی:
          </label>
          <select
            id="timeRange"
            className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value={6}>۶ ساعت اخیر</option>
            <option value={12}>۱۲ ساعت اخیر</option>
            <option value={24}>۲۴ ساعت اخیر</option>
            <option value={48}>۴۸ ساعت اخیر</option>
            <option value={72}>۷۲ ساعت اخیر</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ServiceMapVisualization 
            data={serviceMapData} 
            isLoading={isLoading}
            onNodeClick={handleServiceClick}
          />
        </div>
        
        <div className="lg:col-span-1">
          {selectedService && (
            <ExportServiceOptions serviceName={selectedService} />
          )}
          
          {selectedService && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3">جزئیات سرویس</h3>
              
              <div className="text-gray-700">
                <p className="mb-2">
                  <span className="font-medium">نام سرویس: </span>
                  {selectedService}
                </p>
                
                {serviceMapData?.serviceMap.nodes.find(n => n.id === selectedService) && (
                  <>
                    <p className="mb-2">
                      <span className="font-medium">تعداد فراخوانی: </span>
                      {serviceMapData.serviceMap.nodes.find(n => n.id === selectedService)?.callCount.toLocaleString()}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">میانگین زمان پاسخ: </span>
                      {serviceMapData.serviceMap.nodes.find(n => n.id === selectedService)?.avgDuration.toFixed(2)} ms
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">تعداد خطا: </span>
                      {serviceMapData.serviceMap.nodes.find(n => n.id === selectedService)?.errorCount}
                    </p>
                  </>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => navigate(`/services/${selectedService}`)}
                  >
                    مشاهده جزئیات
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!selectedService && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center text-gray-500">
              <p>برای نمایش جزئیات، روی یک سرویس در نقشه کلیک کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceMap;
