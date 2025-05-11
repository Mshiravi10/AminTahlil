using System;
using System.Collections.Generic;

namespace AminTahlil.Api.Models
{
    public class Trace
    {
        public string TraceId { get; set; }
        public List<Span> Spans { get; set; } = new List<Span>();
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration => EndTime - StartTime;
        public string RootService => Spans.FirstOrDefault(s => s.ParentSpanId == null)?.ServiceName ?? string.Empty;
        public bool HasError => Spans.Any(s => s.Tags.Any(t => t.Key == "error" && t.Value?.ToString() == "true"));
    }

    public class Span
    {
        public string SpanId { get; set; }
        public string ParentSpanId { get; set; }
        public string TraceId { get; set; }
        public string OperationName { get; set; }
        public string ServiceName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration => EndTime - StartTime;
        public Dictionary<string, object> Tags { get; set; } = new Dictionary<string, object>();
        public List<Log> Logs { get; set; } = new List<Log>();
        public bool HasError => Tags.ContainsKey("error") && Tags["error"]?.ToString() == "true";
    }

    public class Log
    {
        public DateTime Timestamp { get; set; }
        public Dictionary<string, object> Fields { get; set; } = new Dictionary<string, object>();
    }
}
