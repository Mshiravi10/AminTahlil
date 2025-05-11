using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AminTahlil.Api.Models
{
    // Jaeger API Search Parameters
    public class TraceSearchParameters
    {
        public string Service { get; set; }
        public string Operation { get; set; }
        public string Tags { get; set; }
        public int? MinDuration { get; set; }
        public int? MaxDuration { get; set; }
        public DateTime? StartTimeMin { get; set; }
        public DateTime? StartTimeMax { get; set; }
        public int Limit { get; set; } = 20;
    }

    // Jaeger API Response Models
    public class JaegerTraceResponse
    {
        [JsonPropertyName("data")]
        public List<JaegerTrace> Data { get; set; }
        
        [JsonPropertyName("total")]
        public int Total { get; set; }
        
        [JsonPropertyName("limit")]
        public int Limit { get; set; }
        
        [JsonPropertyName("offset")]
        public int Offset { get; set; }
        
        [JsonPropertyName("errors")]
        public List<string> Errors { get; set; }
    }

    public class JaegerTrace
    {
        [JsonPropertyName("traceID")]
        public string TraceId { get; set; }
        
        [JsonPropertyName("spans")]
        public List<JaegerSpan> Spans { get; set; }
        
        [JsonPropertyName("processes")]
        public Dictionary<string, JaegerProcess> Processes { get; set; }
        
        [JsonPropertyName("warnings")]
        public List<string> Warnings { get; set; }
    }

    public class JaegerSpan
    {
        [JsonPropertyName("traceID")]
        public string TraceId { get; set; }
        
        [JsonPropertyName("spanID")]
        public string SpanId { get; set; }
        
        [JsonPropertyName("operationName")]
        public string OperationName { get; set; }
        
        [JsonPropertyName("references")]
        public List<JaegerReference> References { get; set; }
        
        [JsonPropertyName("startTime")]
        public long StartTimeUnix { get; set; }
        
        [JsonPropertyName("duration")]
        public long DurationMicros { get; set; }
        
        [JsonPropertyName("tags")]
        public List<JaegerTag> Tags { get; set; }
        
        [JsonPropertyName("logs")]
        public List<JaegerLog> Logs { get; set; }
        
        [JsonPropertyName("processID")]
        public string ProcessId { get; set; }
        
        [JsonPropertyName("warnings")]
        public List<string> Warnings { get; set; }
        
        [JsonIgnore]
        public DateTime StartTime => DateTimeOffset.FromUnixTimeMilliseconds(StartTimeUnix / 1000).DateTime;
        
        [JsonIgnore]
        public DateTime EndTime => StartTime.AddMilliseconds(DurationMicros / 1000.0);
    }

    public class JaegerReference
    {
        [JsonPropertyName("refType")]
        public string RefType { get; set; }
        
        [JsonPropertyName("traceID")]
        public string TraceId { get; set; }
        
        [JsonPropertyName("spanID")]
        public string SpanId { get; set; }
    }

    public class JaegerTag
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }
        
        [JsonPropertyName("type")]
        public string Type { get; set; }
        
        [JsonPropertyName("value")]
        public object Value { get; set; }
    }

    public class JaegerLog
    {
        [JsonPropertyName("timestamp")]
        public long TimestampUnix { get; set; }
        
        [JsonPropertyName("fields")]
        public List<JaegerTag> Fields { get; set; }
        
        [JsonIgnore]
        public DateTime Timestamp => DateTimeOffset.FromUnixTimeMilliseconds(TimestampUnix / 1000).DateTime;
    }

    public class JaegerProcess
    {
        [JsonPropertyName("serviceName")]
        public string ServiceName { get; set; }
        
        [JsonPropertyName("tags")]
        public List<JaegerTag> Tags { get; set; }
    }

    // Service Map models
    public class ServiceMapNode
    {
        public string Id { get; set; }
        public string ServiceName { get; set; }
        public int CallCount { get; set; }
        public double AvgDuration { get; set; }
        public int ErrorCount { get; set; }
    }

    public class ServiceMapEdge
    {
        public string Source { get; set; }
        public string Target { get; set; }
        public int CallCount { get; set; }
        public double AvgDuration { get; set; }
        public int ErrorCount { get; set; }
        public List<string> Operations { get; set; } = new List<string>();
    }

    public class ServiceMap
    {
        public List<ServiceMapNode> Nodes { get; set; } = new List<ServiceMapNode>();
        public List<ServiceMapEdge> Edges { get; set; } = new List<ServiceMapEdge>();
    }
}
