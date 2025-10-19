using Database;
using Database.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;
using Tests.Util.Fakes;

namespace Tests.Util;

public static class TestDB
{
    private static PostgreSqlContainer _postgresContainer = null!;
    private static bool _initialized = false;

    public static async Task InitializeContainerAsync()
    {
        if (_initialized) return;

        _postgresContainer = new PostgreSqlBuilder()
            .WithDatabase("template") // not used directly
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();

        await _postgresContainer.StartAsync();
        _initialized = true;
    }

    public static async Task<AppDbContext> GetDbContext()
    {
        if (!_initialized)
            await InitializeContainerAsync();

        // create a new unique database per test
        string dbName = $"testdb_{Guid.NewGuid():N}";
        await CreateDatabaseAsync(dbName);

        string connString = BuildConnectionString(dbName);
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connString)
            .Options;

        var dbContext = new AppDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();
        await Seed(dbContext);
        return dbContext;
    }

    private static async Task CreateDatabaseAsync(string dbName)
    {
        var masterConn = new NpgsqlConnection(_postgresContainer.GetConnectionString());
        await masterConn.OpenAsync();

        // Create a new database
        using var cmd = new NpgsqlCommand($"CREATE DATABASE \"{dbName}\";", masterConn);
        await cmd.ExecuteNonQueryAsync();

        await masterConn.CloseAsync();
    }

    private static string BuildConnectionString(string dbName)
    {
        var baseConn = new NpgsqlConnectionStringBuilder(_postgresContainer.GetConnectionString())
        {
            Database = dbName
        };
        return baseConn.ConnectionString;
    }

    public static readonly List<User> Users =
    [
        FakeUsers.GenerateFakeUser("abCde12@!"),
        FakeUsers.GenerateFakeUser("woekAasx!22"),
        FakeUsers.GenerateFakeUser("Astrongpassword1!"),
    ];

    private static async Task Seed(AppDbContext dbContext)
    {
        await dbContext.AddRangeAsync(Users);
        await dbContext.SaveChangesAsync();
    }

    public static async Task DisposeContainerAsync()
    {
        if (_postgresContainer != null)
            await _postgresContainer.DisposeAsync();
    }
}
