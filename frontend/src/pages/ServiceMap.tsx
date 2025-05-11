import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getServiceMap } from '../api/trace-service';
import { ServiceMapNode, ServiceMapEdge } from '../types';

const ServiceMap: React.FC = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    node?: ServiceMapNode;
    edge?: ServiceMapEdge;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });
  
  // Fetch service map data
  const { data: serviceMap, isLoading, isError, error } = useQuery({
    queryKey: ['serviceMap'],
    queryFn: getServiceMap
  });
  
  // D3-like force-directed graph simulation in React
  useEffect(() => {
    if (!serviceMap || !svgRef.current || !containerRef.current) return;
    
    // Clear any existing SVG content
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 600; // Fixed height for simplicity
    
    // Create nodes and links
    const nodes = [...serviceMap.nodes];
    const links = [...serviceMap.edges];
    
    // Simple force simulation (very basic implementation)
    const simulateForces = () => {
      // Center force
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      
      // Initialize node positions if not set
      nodes.forEach(node => {
        if (!node.x) node.x = centerX + (Math.random() - 0.5) * 200;
        if (!node.y) node.y = centerY + (Math.random() - 0.5) * 200;
        node.vx = 0;
        node.vy = 0;
      });
      
      // Run simulation
      for (let i = 0; i < 100; i++) { // Iterations
        // Apply repulsive forces between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            
            const dx = nodeB.x! - nodeA.x!;
            const dy = nodeB.y! - nodeA.y!;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1000 / (distance * distance); // Repulsive force
            
            nodeA.vx! -= (dx / distance) * force;
            nodeA.vy! -= (dy / distance) * force;
            nodeB.vx! += (dx / distance) * force;
            nodeB.vy! += (dy / distance) * force;
          }
        }
        
        // Apply attractive forces along links
        links.forEach(link => {
          const source = nodes.find(n => n.id === link.source)!;
          const target = nodes.find(n => n.id === link.target)!;
          
          const dx = target.x! - source.x!;
          const dy = target.y! - source.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance / 30; // Attractive force
          
          source.vx! += (dx / distance) * force;
          source.vy! += (dy / distance) * force;
          target.vx! -= (dx / distance) * force;
          target.vy! -= (dy / distance) * force;
        });
        
        // Apply center force
        nodes.forEach(node => {
          const dx = centerX - node.x!;
          const dy = centerY - node.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance / 50;
          
          node.vx! += (dx / distance) * force;
          node.vy! += (dy / distance) * force;
        });
        
        // Update positions
        nodes.forEach(node => {
          node.x! += node.vx! * 0.1;
          node.y! += node.vy! * 0.1;
          
          // Boundary checks
          node.x = Math.max(50, Math.min(containerWidth - 50, node.x!));
          node.y = Math.max(50, Math.min(containerHeight - 50, node.y!));
        });
      }
    };
    
    // Run simulation
    simulateForces();
    
    // Draw the graph
    // 1. Draw links (edges)
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source)!;
      const target = nodes.find(n => n.id === link.target)!;
      
      // Create line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', source.x!.toString());
      line.setAttribute('y1', source.y!.toString());
      line.setAttribute('x2', target.x!.toString());
      line.setAttribute('y2', target.y!.toString());
      line.setAttribute('stroke', link.errorCount > 0 ? '#ef4444' : '#64748b');
      line.setAttribute('stroke-width', Math.min(3, 1 + link.callCount / 20).toString());
      
      // Add event listeners
      line.addEventListener('mouseenter', (e) => {
        setTooltipInfo({
          x: (source.x! + target.x!) / 2,
          y: (source.y! + target.y!) / 2,
          edge: link,
          visible: true
        });
        line.setAttribute('stroke-width', (parseFloat(line.getAttribute('stroke-width')!) + 1).toString());
      });
      line.addEventListener('mouseleave', () => {
        setTooltipInfo(prev => ({ ...prev, visible: false }));
        line.setAttribute('stroke-width', Math.min(3, 1 + link.callCount / 20).toString());
      });
      
      svg.appendChild(line);
    });
    
    // 2. Draw nodes
    nodes.forEach(node => {
      // Create node group
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Create circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x!.toString());
      circle.setAttribute('cy', node.y!.toString());
      circle.setAttribute('r', (20 + Math.min(10, node.callCount / 10)).toString());
      circle.setAttribute('fill', node.errorCount > 0 ? '#fee2e2' : '#f1f5f9');
      circle.setAttribute('stroke', node.errorCount > 0 ? '#ef4444' : '#64748b');
      circle.setAttribute('stroke-width', '2');
      
      // Add event listeners
      circle.addEventListener('mouseenter', () => {
        setTooltipInfo({
          x: node.x!,
          y: node.y!,
          node: node,
          visible: true
        });
        circle.setAttribute('stroke-width', '3');
      });
      circle.addEventListener('mouseleave', () => {
        setTooltipInfo(prev => ({ ...prev, visible: false }));
        circle.setAttribute('stroke-width', '2');
      });
      circle.addEventListener('click', () => {
        navigate(`/services/${node.serviceName}`);
      });
      
      group.appendChild(circle);
      
      // Create label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x!.toString());
      text.setAttribute('y', node.y!.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.serviceName;
      
      group.appendChild(text);
      svg.appendChild(group);
    });
    
    // Set SVG dimensions
    svg.setAttribute('width', containerWidth.toString());
    svg.setAttribute('height', containerHeight.toString());
    
  }, [serviceMap, navigate]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">نقشه سرویس‌ها</h1>
      
      <div className="bg-card rounded-lg shadow border p-4">
        <p className="text-sm text-muted-foreground mb-4">
          این نقشه، ارتباطات بین سرویس‌های مختلف در سیستم را نمایش می‌دهد. 
          اندازه هر گره متناسب با تعداد فراخوانی‌های آن سرویس است و رنگ قرمز نشان‌دهنده خطا است.
        </p>
        
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <p>در حال بارگذاری نقشه سرویس‌ها...</p>
          </div>
        ) : isError ? (
          <div className="h-96 flex items-center justify-center text-destructive">
            <p>خطا در بارگذاری نقشه سرویس‌ها: {(error as Error).message}</p>
          </div>
        ) : serviceMap && serviceMap.nodes.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            <p>هیچ داده‌ای برای نمایش نقشه سرویس یافت نشد.</p>
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            {/* Service Map Visualization */}
            <svg ref={svgRef} className="w-full h-[600px]" />
            
            {/* Tooltip */}
            {tooltipInfo.visible && (
              <div 
                className="absolute bg-popover text-popover-foreground shadow-lg rounded-md p-3 z-10 min-w-[200px]"
                style={{
                  top: tooltipInfo.y + 30,
                  left: tooltipInfo.x,
                  transform: 'translateX(-50%)'
                }}
              >
                {tooltipInfo.node && (
                  <>
                    <h3 className="font-medium">{tooltipInfo.node.serviceName}</h3>
                    <div className="text-sm mt-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تعداد فراخوانی:</span>
                        <span>{tooltipInfo.node.callCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">میانگین زمان:</span>
                        <span>{tooltipInfo.node.avgDuration.toFixed(2)} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تعداد خطا:</span>
                        <span className={tooltipInfo.node.errorCount > 0 ? 'text-destructive' : ''}>
                          {tooltipInfo.node.errorCount}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-center">
                      برای مشاهده جزئیات سرویس کلیک کنید
                    </div>
                  </>
                )}
                
                {tooltipInfo.edge && (
                  <>
                    <h3 className="font-medium">
                      {tooltipInfo.edge.source} → {tooltipInfo.edge.target}
                    </h3>
                    <div className="text-sm mt-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تعداد فراخوانی:</span>
                        <span>{tooltipInfo.edge.callCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">میانگین زمان:</span>
                        <span>{tooltipInfo.edge.avgDuration.toFixed(2)} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تعداد خطا:</span>
                        <span className={tooltipInfo.edge.errorCount > 0 ? 'text-destructive' : ''}>
                          {tooltipInfo.edge.errorCount}
                        </span>
                      </div>
                    </div>
                    {tooltipInfo.edge.operations.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">عملیات‌ها:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tooltipInfo.edge.operations.slice(0, 3).map(op => (
                            <span key={op} className="px-1.5 py-0.5 bg-muted rounded-sm">
                              {op}
                            </span>
                          ))}
                          {tooltipInfo.edge.operations.length > 3 && (
                            <span className="text-muted-foreground">
                              +{tooltipInfo.edge.operations.length - 3} مورد دیگر
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add these properties to make TypeScript happy with our custom properties
declare module '../types' {
  interface ServiceMapNode {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
  }
}

export default ServiceMap;
