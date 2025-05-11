import React, { useEffect, useRef, useState } from 'react';
import { ServiceMapVisualizationResponse, ServiceMapNode, ServiceMapEdge } from '../../types';
import { formatDuration, formatPercentage } from '../../utils/formatters';

interface ServiceMapVisualizationProps {
  data: ServiceMapVisualizationResponse | null;
  isLoading: boolean;
  onNodeClick?: (serviceId: string) => void;
}

const ServiceMapVisualization: React.FC<ServiceMapVisualizationProps> = ({ 
  data, 
  isLoading,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node?: ServiceMapNode; edge?: ServiceMapEdge } | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    // Clear SVG
    const svg = svgRef.current;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    const { width, height } = data.layout.dimensions;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Create groups for edges and nodes
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(edgesGroup);
    svg.appendChild(nodesGroup);
    
    // Draw edges
    data.serviceMap.edges.forEach(edge => {
      const sourcePos = data.layout.nodePositions[edge.source];
      const targetPos = data.layout.nodePositions[edge.target];
      
      if (!sourcePos || !targetPos) return;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sourcePos.x.toString());
      line.setAttribute('y1', sourcePos.y.toString());
      line.setAttribute('x2', targetPos.x.toString());
      line.setAttribute('y2', targetPos.y.toString());
      line.setAttribute('stroke', edge.errorCount > 0 ? '#ef4444' : '#6366f1');
      line.setAttribute('stroke-width', Math.log(edge.callCount + 1).toString());
      line.setAttribute('stroke-opacity', '0.6');
      
      // Add interaction
      line.onmouseover = (e) => {
        setTooltip({
          x: (sourcePos.x + targetPos.x) / 2,
          y: (sourcePos.y + targetPos.y) / 2,
          edge
        });
        line.setAttribute('stroke-width', (Math.log(edge.callCount + 1) * 2).toString());
        line.setAttribute('stroke-opacity', '1');
      };
      
      line.onmouseout = () => {
        setTooltip(null);
        line.setAttribute('stroke-width', Math.log(edge.callCount + 1).toString());
        line.setAttribute('stroke-opacity', '0.6');
      };
      
      edgesGroup.appendChild(line);
      
      // Add arrow
      const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
      const arrowSize = 10;
      
      const arrowX = targetPos.x - 30 * Math.cos(angle);
      const arrowY = targetPos.y - 30 * Math.sin(angle);
      
      const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const p1x = arrowX;
      const p1y = arrowY;
      const p2x = arrowX - arrowSize * Math.cos(angle - Math.PI / 6);
      const p2y = arrowY - arrowSize * Math.sin(angle - Math.PI / 6);
      const p3x = arrowX - arrowSize * Math.cos(angle + Math.PI / 6);
      const p3y = arrowY - arrowSize * Math.sin(angle + Math.PI / 6);
      
      arrowMarker.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`);
      arrowMarker.setAttribute('fill', edge.errorCount > 0 ? '#ef4444' : '#6366f1');
      
      edgesGroup.appendChild(arrowMarker);
    });
    
    // Draw nodes
    data.serviceMap.nodes.forEach(node => {
      const pos = data.layout.nodePositions[node.id];
      if (!pos) return;
      
      // Group for the node
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('cursor', 'pointer');
      
      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', '25');
      circle.setAttribute('fill', node.errorCount > 0 ? '#fecaca' : '#e0e7ff');
      circle.setAttribute('stroke', node.errorCount > 0 ? '#ef4444' : '#6366f1');
      circle.setAttribute('stroke-width', '2');
      
      // Add highlight if selected
      if (selectedNode === node.id) {
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        highlight.setAttribute('cx', pos.x.toString());
        highlight.setAttribute('cy', pos.y.toString());
        highlight.setAttribute('r', '30');
        highlight.setAttribute('fill', 'none');
        highlight.setAttribute('stroke', '#3b82f6');
        highlight.setAttribute('stroke-width', '3');
        highlight.setAttribute('stroke-dasharray', '5,5');
        nodeGroup.appendChild(highlight);
      }
      
      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', pos.y.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('alignment-baseline', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#1e293b');
      text.textContent = node.serviceName;
      
      // Add interactions
      nodeGroup.onmouseover = () => {
        circle.setAttribute('r', '28');
        setTooltip({ x: pos.x, y: pos.y - 40, node });
      };
      
      nodeGroup.onmouseout = () => {
        circle.setAttribute('r', '25');
        setTooltip(null);
      };
      
      nodeGroup.onclick = () => {
        setSelectedNode(node.id);
        if (onNodeClick) {
          onNodeClick(node.id);
        }
      };
      
      nodeGroup.appendChild(circle);
      nodeGroup.appendChild(text);
      nodesGroup.appendChild(nodeGroup);
    });
    
  }, [data, selectedNode, onNodeClick]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">اطلاعات نقشه سرویس در دسترس نیست.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">نقشه سرویس</h2>
          <div className="text-sm text-gray-500">
            <span className="ml-4">{data.statistics.serviceCount} سرویس</span>
            <span>{data.statistics.connectionCount} ارتباط</span>
          </div>
        </div>
        
        <div className="flex">
          {/* Service Map Visualization */}
          <div className="flex-1 relative border border-gray-200 rounded-lg h-[600px] overflow-hidden">
            <svg
              ref={svgRef}
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            ></svg>
            
            {/* Tooltip */}
            {tooltip && (
              <div 
                className="absolute bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 w-64"
                style={{ 
                  left: `${tooltip.x}px`, 
                  top: `${tooltip.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                {tooltip.node && (
                  <>
                    <h3 className="font-bold text-blue-800">{tooltip.node.serviceName}</h3>
                    <div className="mt-1 space-y-1 text-sm">
                      <p><span className="font-medium">تعداد فراخوانی:</span> {tooltip.node.callCount.toLocaleString()}</p>
                      <p><span className="font-medium">میانگین زمان:</span> {formatDuration(tooltip.node.avgDuration)}</p>
                      <p><span className="font-medium">تعداد خطا:</span> {tooltip.node.errorCount}</p>
                      <p><span className="font-medium">نرخ خطا:</span> {formatPercentage(tooltip.node.errorCount / tooltip.node.callCount)}</p>
                    </div>
                  </>
                )}
                
                {tooltip.edge && (
                  <>
                    <h3 className="font-bold text-blue-800">
                      {tooltip.edge.source} → {tooltip.edge.target}
                    </h3>
                    <div className="mt-1 space-y-1 text-sm">
                      <p><span className="font-medium">تعداد فراخوانی:</span> {tooltip.edge.callCount.toLocaleString()}</p>
                      <p><span className="font-medium">میانگین زمان:</span> {formatDuration(tooltip.edge.avgDuration)}</p>
                      <p><span className="font-medium">تعداد خطا:</span> {tooltip.edge.errorCount}</p>
                      <p><span className="font-medium">عملیات‌ها:</span> {tooltip.edge.operations.length}</p>
                    </div>
                    {tooltip.edge.operations.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-xs">عملیات‌ها:</p>
                        <div className="max-h-20 overflow-y-auto mt-1">
                          <ul className="text-xs text-gray-600">
                            {tooltip.edge.operations.map((op, i) => (
                              <li key={i}>{op}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Statistics Panel */}
          <div className="w-64 mr-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">آمار کلی</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">تعداد سرویس‌ها:</span> {data.statistics.serviceCount}</p>
              <p><span className="font-medium">تعداد ارتباطات:</span> {data.statistics.connectionCount}</p>
              <p><span className="font-medium">تعداد عملیات‌ها:</span> {data.statistics.operationCount}</p>
              <p><span className="font-medium">تعداد تریس‌ها:</span> {data.statistics.traceCount}</p>
            </div>
            
            <h3 className="font-semibold text-gray-700 mt-4 mb-2">سرویس‌های با بیشترین ارتباط</h3>
            <div className="space-y-1 text-sm">
              {data.statistics.mostConnectedServices.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate">{service.serviceName}</span>
                  <span className="font-medium">{service.connectionCount}</span>
                </div>
              ))}
            </div>
            
            <h3 className="font-semibold text-gray-700 mt-4 mb-2">سرویس‌های با بیشترین خطا</h3>
            <div className="space-y-1 text-sm">
              {data.statistics.highestErrorRateServices.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate">{service.serviceName}</span>
                  <span className="font-medium text-red-600">{formatPercentage(service.errorRate)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          نکته: برای دیدن جزئیات هر سرویس یا ارتباط، روی آن کلیک کنید.
        </div>
      </div>
    </div>
  );
};

export default ServiceMapVisualization;
