namespace Channel.Dto
{
    public class RpcPayload<TPayload>
    {
        public required string Id { get; set; }
        public required TPayload? Data { get; set; }
        public required string Pattern { get; set; }

    }
}
