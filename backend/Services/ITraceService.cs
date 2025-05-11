using AminTahlil.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AminTahlil.Api.Services
{
    public interface ITraceService
    {
        Task<Trace> GetTraceAsync(string traceId);
        Task<List<Trace>> SearchTracesAsync(TraceSearchParameters parameters);
        Task<List<string>> GetServicesAsync();
        Task<List<string>> GetOperationsAsync(string service);
        Task<List<Trace>> GetErrorTracesAsync(int limit = 10);
        Task<List<Span>> GetSlowSpansAsync(int limit = 10);
        Task<ServiceMap> GetServiceMapAsync();
    }
}
