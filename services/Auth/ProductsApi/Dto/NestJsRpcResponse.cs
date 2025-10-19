using System.Text.Json.Serialization;

namespace ProductsApi.Dto
{
    public class NestRpcResponse<T>
    {
        [JsonPropertyName("response")]
        public T? Response { get; set; }

        [JsonPropertyName("isDisposed")]
        public bool IsDisposed { get; set; }
    }
}
