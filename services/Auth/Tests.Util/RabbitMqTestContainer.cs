using DotNet.Testcontainers.Builders;
using Testcontainers.RabbitMq;

namespace Tests.Util;

public static class RabbitMqTestContainer
{
    private static RabbitMqContainer _container = null!;
    private static bool _started = false;

    public static async Task InitializeAsync()
    {
        if (_started) return;

        _container = new RabbitMqBuilder()
            .WithUsername("guest")
            .WithPassword("guest")
            .WithWaitStrategy(Wait.ForUnixContainer()
                .UntilInternalTcpPortIsAvailable(5672)
                .UntilMessageIsLogged("Server startup complete"))
            .Build();

        await _container.StartAsync();
        _started = true;
    }

    public static string HostName => _container.Hostname;
    public static string Username => "guest";
    public static string Password => "guest";
    public static ushort Port => _container.GetMappedPublicPort(5672);

    public static async Task DisposeAsync()
    {
        if (_container != null)
            await _container.DisposeAsync();
    }
}
