# ecommerce-microservices

## How to run
```bash
docker compose -f 'docker-compose.dev.yml' up -d --build # runs services in development mode
docker compose -f 'docker-compose.prod.yml' up -d --build # runs services in production mode
```

### Do I need anything else to run the app?
The development variant of the project does not require any additional configurations; it will spin up a fully working app with a single command

The production variant requires the following actions:
- applying the migrations in the ``Auth`` project. This has to be done manually, as running them automatically would require including more components in the Docker image, which would make it larger.