using System.Text.Json.Serialization;
using System.Text.Json;
using Microsoft.OpenApi.Models;
using Database;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Jwt.Services.Contracts;
using Jwt.Services;
using Auth.Services.Contracts;
using Auth.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Jwt.Constants;

namespace Auth.Web.Extensions
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services, WebApplicationBuilder builder)
        {
            services
                .AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                    options.JsonSerializerOptions.WriteIndented = true;
                    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            return services
                .AddEndpointsApiExplorer()
                .AddSwaggerGen(options =>
                {
                options.DescribeAllParametersInCamelCase();
                options.ResolveConflictingActions(api => api.First());
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Ecommerce auth microservice", Version = "v1" });
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });
                    options.AddSecurityRequirement(new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            Array.Empty<string>()
                        }
                    });
                })
                .AddLogging()
                .AddCors()
                .AddScoped<IJwtService, JwtService>()
                .AddScoped<IUserService, UserService>();
        }

        public static IServiceCollection AddDatabase(this IServiceCollection services, WebApplicationBuilder builder)
        {
            var connectionBuilder = new NpgsqlConnectionStringBuilder()
            {
                Host = builder.Configuration["AUTH_DB_HOST"],
                Database = builder.Configuration["AUTH_DB_NAME"],
                Username = builder.Configuration["AUTH_DB_USERNAME"],
                Password = builder.Configuration["AUTH_DB_PASSWORD"],
            };

            string connectionUrl = connectionBuilder.ConnectionString;

            return services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(connectionUrl, b => b.MigrationsAssembly("Auth.Web"));
            });
        }

        public static IServiceCollection AddBearerAuthentication(this IServiceCollection services, WebApplicationBuilder builder)
        {
            services
                .AddScoped<JwtBearerEvents>()
                .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidAudience = builder.Configuration[ConfigurationKeys.Audience],
                    ValidIssuer = builder.Configuration[ConfigurationKeys.Issuer],
                    IssuerSigningKey = new
                        SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration[ConfigurationKeys.Secret]!)),

                };

                options.EventsType = typeof(JwtBearerEvents);
            });

            return services;
                
        }
    }
}
