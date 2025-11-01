import * as jwt from 'jsonwebtoken';

export function generateJwt(email: string, userId: string) {
  return jwt.sign(
    {
      Email: email,
      Id: userId,
    },
    process.env.PRODUCTS_JWT_SECRET!,
    {
      issuer: process.env.PRODUCTS_JWT_ISSUER,
      audience: process.env.PRODUCTS_JWT_AUDIENCE,
    },
  );
}

export function populateJwtEnvironmentVariables() {
  process.env.PRODUCTS_JWT_SECRET =
    'oknNKJNjknjkqnkjwnjkn3kjn23kjn23kjnklAlakmn';

  process.env.PRODUCTS_JWT_ISSUER = 'http://localhost:5000';
  process.env.PRODUCTS_JWT_AUDIENCE = 'ecommerceMicroservices';
}
