using Auth.Web.Extensions;
using Database;
using Microsoft.EntityFrameworkCore;

namespace Auth.Web
{
    public partial class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddServices(builder);
            builder.Services.AddBearerAuthentication(builder);
            builder.Services.AddDatabase(builder);
            var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
            builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

            var app = builder.Build();

            Console.WriteLine("running!");

            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
