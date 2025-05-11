using AminTahlil.Api.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AminTahlil.Api.Services
{
    public interface IJaegerClient
    {
        Task<JaegerTraceResponse> SearchTracesAsync(TraceSearchParameters parameters);
        Task<JaegerTraceResponse> GetTraceAsync(string traceId);
        Task<List<string>> GetServicesAsync();
        Task<List<string>> GetOperationsAsync(string service);
    }
}
