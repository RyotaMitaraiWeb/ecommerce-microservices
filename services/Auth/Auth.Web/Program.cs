using Auth.Web.Extensions;

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

            var app = builder.Build();

            Console.WriteLine("running !");

            app.UseSwagger();
            app.UseSwaggerUI();

            //app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
