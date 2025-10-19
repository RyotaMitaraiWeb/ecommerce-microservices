using Channel.Dto;
using Channel.Services;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using Tests.Util;

namespace Tests.Integration.Services;

public class ChannelServiceTests
{
    private ChannelService Service = null!;
    private IConfiguration Config = null!;

    [OneTimeSetUp]
    public async Task GlobalSetup()
    {
        await RabbitMqTestContainer.InitializeAsync();
    }

    [SetUp]
    public void Setup()
    {
        var settings = new Dictionary<string, string?>
        {
            ["RABBITMQ_HOST"] = RabbitMqTestContainer.HostName,
            ["RABBITMQ_USER"] = RabbitMqTestContainer.Username,
            ["RABBITMQ_PASSWORD"] = RabbitMqTestContainer.Password,
            ["RABBITMQ_PORT"] = RabbitMqTestContainer.Port.ToString(),
        };

        Config = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        Service = new ChannelService(Config);
    }

    [Test]
    public async Task PublishMessage_SendsMessageToQueue()
    {
        // Arrange
        string queue = $"test-queue-{Guid.NewGuid():N}";
        string expectedPattern = "user.created";
        var payload = new { Id = 123, Name = "Alice" };

        var factory = new ConnectionFactory
        {
            HostName = RabbitMqTestContainer.HostName,
            Port = RabbitMqTestContainer.Port,
            UserName = RabbitMqTestContainer.Username,
            Password = RabbitMqTestContainer.Password
        };

        using var connection = await factory.CreateConnectionAsync();
        using var channel = await connection.CreateChannelAsync();

        await channel.QueueDeclareAsync(
            queue: queue,
            durable: true,
            exclusive: false,
            autoDelete: false
        );

        var receivedTcs = new TaskCompletionSource<string>();

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            var body = Encoding.UTF8.GetString(ea.Body.ToArray());
            receivedTcs.TrySetResult(body);
            await Task.Yield();
        };

        await channel.BasicConsumeAsync(queue, autoAck: true, consumer);

        // Act
        await Service.PublishMessage(payload, expectedPattern, queue);

        // Assert
        string received = await receivedTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.That(received, Does.Contain("user.created"));
    }


    [TearDown]
    public async Task Teardown()
    {
        await Service.DisposeAsync();
    }

    [OneTimeTearDown]
    public async Task GlobalTeardown()
    {
        await RabbitMqTestContainer.DisposeAsync();
    }
}
