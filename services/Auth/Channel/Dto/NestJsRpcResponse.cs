using System.Text.Json.Serialization;

namespace Channel.Dto
{
    public class NestRpcResponseEnvelope<T>
    {
        [JsonPropertyName("response")]
        public T? Response { get; set; }

        [JsonPropertyName("isDisposed")]
        public bool IsDisposed { get; set; }
    }
}
