using AminTahlil.Api.Models;
using AminTahlil.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AminTahlil.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly ITraceService _traceService;
        private readonly ILogger<ExportController> _logger;

        public ExportController(ITraceService traceService, ILogger<ExportController> logger)
        {
            _traceService = traceService ?? throw new ArgumentNullException(nameof(traceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Export a trace as JSON
        /// </summary>
        /// <param name="traceId">The ID of the trace to export</param>
        /// <returns>JSON file with trace data</returns>
        [HttpGet("trace/{traceId}/json")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportTraceAsJson(string traceId)
        {
            try
            {
                _logger.LogInformation($"Exporting trace {traceId} as JSON");
                
                var trace = await _traceService.GetTraceAsync(traceId);
                if (trace == null)
                {
                    return NotFound($"Trace with ID {traceId} not found");
                }
                
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true
                };
                
                var json = JsonSerializer.Serialize(trace, options);
                var bytes = Encoding.UTF8.GetBytes(json);
                
                return File(bytes, "application/json", $"trace-{traceId}.json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting trace {traceId} as JSON");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while exporting the trace");
            }
        }

        /// <summary>
        /// Export a trace as CSV
        /// </summary>
        /// <param name="traceId">The ID of the trace to export</param>
        /// <returns>CSV file with trace data</returns>
        [HttpGet("trace/{traceId}/csv")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportTraceAsCsv(string traceId)
        {
            try
            {
                _logger.LogInformation($"Exporting trace {traceId} as CSV");
                
                var trace = await _traceService.GetTraceAsync(traceId);
                if (trace == null)
                {
                    return NotFound($"Trace with ID {traceId} not found");
                }
                
                var sb = new StringBuilder();
                
                // Headers
                sb.AppendLine("SpanId,ParentSpanId,ServiceName,OperationName,StartTime,EndTime,Duration,HasError");
                
                // Rows
                foreach (var span in trace.Spans)
                {
                    sb.AppendLine(
                        $"{span.SpanId}," +
                        $"{span.ParentSpanId ?? "null"}," +
                        $"{EscapeCsvField(span.ServiceName)}," +
                        $"{EscapeCsvField(span.OperationName)}," +
                        $"{span.StartTime:yyyy-MM-dd HH:mm:ss.fff}," +
                        $"{span.EndTime:yyyy-MM-dd HH:mm:ss.fff}," +
                        $"{span.Duration.TotalMilliseconds:F3}," +
                        $"{span.HasError}"
                    );
                }
                
                var bytes = Encoding.UTF8.GetBytes(sb.ToString());
                return File(bytes, "text/csv", $"trace-{traceId}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting trace {traceId} as CSV");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while exporting the trace");
            }
        }

        /// <summary>
        /// Generate a summary report for a trace
        /// </summary>
        /// <param name="traceId">The ID of the trace</param>
        /// <returns>HTML report with trace summary and visualizations</returns>
        [HttpGet("trace/{traceId}/report")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateTraceReport(string traceId)
        {
            try
            {
                _logger.LogInformation($"Generating report for trace {traceId}");
                
                var trace = await _traceService.GetTraceAsync(traceId);
                if (trace == null)
                {
                    return NotFound($"Trace with ID {traceId} not found");
                }
                
                var report = GenerateHtmlReport(trace);
                var bytes = Encoding.UTF8.GetBytes(report);
                
                return File(bytes, "text/html", $"trace-report-{traceId}.html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating report for trace {traceId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while generating the report");
            }
        }

        /// <summary>
        /// Export service statistics
        /// </summary>
        /// <param name="service">The service name</param>
        /// <param name="timeRangeHours">Time range in hours to analyze (default: 24 hours)</param>
        /// <returns>CSV file with service statistics</returns>
        [HttpGet("service/{service}/csv")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportServiceStatistics(string service, [FromQuery] int timeRangeHours = 24)
        {
            try
            {
                _logger.LogInformation($"Exporting statistics for service {service}");
                
                // Check if service exists
                var services = await _traceService.GetServicesAsync();
                if (!services.Contains(service))
                {
                    return NotFound($"Service '{service}' not found");
                }
                
                // Get operations for the service
                var operations = await _traceService.GetOperationsAsync(service);
                
                // Get traces involving this service
                var parameters = new TraceSearchParameters
                {
                    Service = service,
                    StartTimeMin = DateTime.UtcNow.AddHours(-timeRangeHours),
                    Limit = 100
                };
                
                var traces = await _traceService.SearchTracesAsync(parameters);
                
                // Generate CSV
                var sb = new StringBuilder();
                
                // Service summary
                sb.AppendLine($"Service: {service}");
                sb.AppendLine($"Analysis Period: Last {timeRangeHours} hours");
                sb.AppendLine($"Number of Operations: {operations.Count}");
                sb.AppendLine($"Number of Traces: {traces.Count}");
                sb.AppendLine($"Number of Error Traces: {traces.Count(t => t.HasError)}");
                sb.AppendLine();
                
                // Operation statistics
                sb.AppendLine("Operation,Count,Avg Duration (ms),Max Duration (ms),Error Count");
                
                foreach (var operation in operations)
                {
                    var relevantSpans = traces
                        .SelectMany(t => t.Spans)
                        .Where(s => s.ServiceName == service && s.OperationName == operation)
                        .ToList();
                    
                    if (relevantSpans.Any())
                    {
                        var count = relevantSpans.Count;
                        var avgDuration = relevantSpans.Average(s => s.Duration.TotalMilliseconds);
                        var maxDuration = relevantSpans.Max(s => s.Duration.TotalMilliseconds);
                        var errorCount = relevantSpans.Count(s => s.HasError);
                        
                        sb.AppendLine(
                            $"{EscapeCsvField(operation)}," +
                            $"{count}," +
                            $"{avgDuration:F3}," +
                            $"{maxDuration:F3}," +
                            $"{errorCount}"
                        );
                    }
                    else
                    {
                        sb.AppendLine($"{EscapeCsvField(operation)},0,0,0,0");
                    }
                }
                
                sb.AppendLine();
                
                // Recent traces
                sb.AppendLine("Recent Traces:");
                sb.AppendLine("TraceId,Start Time,Duration (ms),Has Error");
                
                foreach (var trace in traces.OrderByDescending(t => t.StartTime).Take(20))
                {
                    sb.AppendLine(
                        $"{trace.TraceId}," +
                        $"{trace.StartTime:yyyy-MM-dd HH:mm:ss.fff}," +
                        $"{trace.Duration.TotalMilliseconds:F3}," +
                        $"{trace.HasError}"
                    );
                }
                
                var bytes = Encoding.UTF8.GetBytes(sb.ToString());
                return File(bytes, "text/csv", $"service-stats-{service}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exporting statistics for service {service}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while exporting service statistics");
            }
        }

        private string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
            {
                return string.Empty;
            }
            
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            
            return field;
        }

        private string GenerateHtmlReport(Trace trace)
        {
            // Generate a simple HTML report for the trace
            var sb = new StringBuilder();
            
            sb.AppendLine("<!DOCTYPE html>");
            sb.AppendLine("<html dir=\"rtl\">");
            sb.AppendLine("<head>");
            sb.AppendLine("  <meta charset=\"UTF-8\">");
            sb.AppendLine("  <title>گزارش تریس - امین‌تحلیل</title>");
            sb.AppendLine("  <style>");
            sb.AppendLine("    body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }");
            sb.AppendLine("    h1, h2 { color: #333; }");
            sb.AppendLine("    .container { max-width: 1200px; margin: 0 auto; }");
            sb.AppendLine("    .header { text-align: center; margin-bottom: 30px; }");
            sb.AppendLine("    .summary { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; }");
            sb.AppendLine("    .span { border: 1px solid #eee; padding: 10px; margin-bottom: 10px; }");
            sb.AppendLine("    .has-error { border-left: 4px solid #f44336; }");
            sb.AppendLine("    .gantt { overflow-x: auto; margin: 20px 0; }");
            sb.AppendLine("    .gantt-container { position: relative; height: 400px; width: 100%; }");
            sb.AppendLine("    .gantt-bar { position: absolute; height: 20px; background-color: #3f51b5; border-radius: 3px; color: white; text-align: center; line-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }");
            sb.AppendLine("    .gantt-bar-error { background-color: #f44336; }");
            sb.AppendLine("    .table { width: 100%; border-collapse: collapse; }");
            sb.AppendLine("    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: right; }");
            sb.AppendLine("    .table th { background-color: #f5f5f5; }");
            sb.AppendLine("    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }");
            sb.AppendLine("  </style>");
            sb.AppendLine("</head>");
            sb.AppendLine("<body>");
            sb.AppendLine("  <div class=\"container\">");
            sb.AppendLine("    <div class=\"header\">");
            sb.AppendLine("      <h1>گزارش تریس</h1>");
            sb.AppendLine("      <p>تولید‌شده توسط سیستم امین‌تحلیل</p>");
            sb.AppendLine("    </div>");
            
            // Trace Summary
            sb.AppendLine("    <div class=\"summary\">");
            sb.AppendLine("      <h2>خلاصه تریس</h2>");
            sb.AppendLine($"      <p><strong>شناسه تریس:</strong> {trace.TraceId}</p>");
            sb.AppendLine($"      <p><strong>سرویس اصلی:</strong> {trace.RootService}</p>");
            sb.AppendLine($"      <p><strong>زمان شروع:</strong> {trace.StartTime:yyyy-MM-dd HH:mm:ss.fff}</p>");
            sb.AppendLine($"      <p><strong>زمان پایان:</strong> {trace.EndTime:yyyy-MM-dd HH:mm:ss.fff}</p>");
            sb.AppendLine($"      <p><strong>مدت زمان کل:</strong> {trace.Duration.TotalMilliseconds:F3} میلی‌ثانیه</p>");
            sb.AppendLine($"      <p><strong>تعداد اسپن‌ها:</strong> {trace.Spans.Count}</p>");
            sb.AppendLine($"      <p><strong>تعداد سرویس‌ها:</strong> {trace.Spans.Select(s => s.ServiceName).Distinct().Count()}</p>");
            sb.AppendLine($"      <p><strong>وضعیت:</strong> {(trace.HasError ? "<span style=\"color: red;\">با خطا</span>" : "<span style=\"color: green;\">موفق</span>")}</p>");
            sb.AppendLine("    </div>");
            
            // Gantt Chart
            sb.AppendLine("    <h2>نمودار زمان‌بندی</h2>");
            sb.AppendLine("    <div class=\"gantt\">");
            sb.AppendLine("      <div class=\"gantt-container\">");
            
            var traceStartMs = new DateTimeOffset(trace.StartTime).ToUnixTimeMilliseconds();
            var traceDurationMs = trace.Duration.TotalMilliseconds;
            
            foreach (var span in trace.Spans)
            {
                var spanStartMs = new DateTimeOffset(span.StartTime).ToUnixTimeMilliseconds();
                var spanDurationMs = span.Duration.TotalMilliseconds;
                
                var left = ((spanStartMs - traceStartMs) / traceDurationMs) * 100;
                var width = (spanDurationMs / traceDurationMs) * 100;
                
                // Make sure small spans are still visible
                if (width < 0.5) width = 0.5;
                
                var top = Array.IndexOf(trace.Spans.ToArray(), span) * 25 + 10;
                var errorClass = span.HasError ? " gantt-bar-error" : "";
                
                sb.AppendLine($"        <div class=\"gantt-bar{errorClass}\" style=\"left: {left}%; width: {width}%; top: {top}px;\" title=\"{span.ServiceName}: {span.OperationName} ({spanDurationMs:F2} ms)\">{span.ServiceName}: {span.OperationName}</div>");
            }
            
            sb.AppendLine("      </div>");
            sb.AppendLine("    </div>");
            
            // Spans Table
            sb.AppendLine("    <h2>جدول اسپن‌ها</h2>");
            sb.AppendLine("    <table class=\"table\">");
            sb.AppendLine("      <thead>");
            sb.AppendLine("        <tr>");
            sb.AppendLine("          <th>شناسه اسپن</th>");
            sb.AppendLine("          <th>شناسه اسپن والد</th>");
            sb.AppendLine("          <th>سرویس</th>");
            sb.AppendLine("          <th>عملیات</th>");
            sb.AppendLine("          <th>زمان شروع</th>");
            sb.AppendLine("          <th>مدت زمان (ms)</th>");
            sb.AppendLine("          <th>وضعیت</th>");
            sb.AppendLine("        </tr>");
            sb.AppendLine("      </thead>");
            sb.AppendLine("      <tbody>");
            
            foreach (var span in trace.Spans)
            {
                var errorClass = span.HasError ? " has-error" : "";
                sb.AppendLine($"        <tr class=\"{errorClass}\">");
                sb.AppendLine($"          <td>{span.SpanId}</td>");
                sb.AppendLine($"          <td>{span.ParentSpanId ?? "—"}</td>");
                sb.AppendLine($"          <td>{span.ServiceName}</td>");
                sb.AppendLine($"          <td>{span.OperationName}</td>");
                sb.AppendLine($"          <td>{span.StartTime:HH:mm:ss.fff}</td>");
                sb.AppendLine($"          <td>{span.Duration.TotalMilliseconds:F3}</td>");
                sb.AppendLine($"          <td>{(span.HasError ? "<span style=\"color: red;\">خطا</span>" : "<span style=\"color: green;\">موفق</span>")}</td>");
                sb.AppendLine("        </tr>");
            }
            
            sb.AppendLine("      </tbody>");
            sb.AppendLine("    </table>");
            
            // Footer
            sb.AppendLine("    <div class=\"footer\">");
            sb.AppendLine("      <p>این گزارش به صورت خودکار توسط سیستم امین‌تحلیل تولید شده است. تاریخ تولید: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "</p>");
            sb.AppendLine("    </div>");
            
            sb.AppendLine("  </div>");
            sb.AppendLine("</body>");
            sb.AppendLine("</html>");
            
            return sb.ToString();
        }
    }
}
