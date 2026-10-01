# Guess the price (full version)

![Guess the price logo](https://res.cloudinary.com/dnh0go0q2/image/upload/v1736198420/OG_banner_small_qatyz2.png)

Test your shopping knowledge in this entertaining price guessing game! Challenge yourself in two different game modes or compete with friends to see who can guess product prices most accurately.

## Key features

- Classic mode
- This or that mode
- Multiplayer classic mode
- Use your own products

## Live site

The demo for this project only contains single player modes, you can get that branch of the code [here](https://github.com/pavece/guess-the-price/tree/single-player-only).
Live site: [https://guesstheprice.pavece.com/](https://guesstheprice.pavece.com/)

## Development setup

This is a monorepo built using Turborepo. You can find both the client and server apps in the **/apps** directory.
You can run both apps separately (recommended for development) or using one single command from the root of the monorepo.

1. Clone the repository

   ```bash
    git clone https://github.com/pavece/guess-the-price.git
   ```

2. Install dependencies

   ```bash
    npm i
   ```

3. Setup environment variables

   Rename /apps/client/.env.template to .env.local
   Update the variables with your desired configuration. The default variables included in the template should work if you don't change the backend port :)

   Rename /apps/server/.env.template to .env
   Generate a random string to use as API_KEY for the admin apis. You will need to provide this key when adding/removing products or categories using the API.
   Make sure to place the correct database url. The default variables should work if you are following along.

4. Start the local database

   This step is optional, I provided a docker compose file with the setup to run a local PostgreSQL instance. If you have other instance running feel free to use it. Just remember to configure the DATABASE_URL variable in /apps/server/.env

   ```bash
    cd /apps/server
    docker compose up -d
   ```

5. Run the prisma migration and generate client

   (This should be performed once you set up the database)

   ```bash
   cd /apps/server
   npx prisma migrate dev --name "Initial migration"
   ```

   ```bash
   cd /apps/server
   npx prisma generate
   ```

6. Execute seed procedure and/or add custom products

   ```bash
    cd /apps/server
    npm run seed
   ```

   You can add new products and categories manually using a tool like PG admin.
   Or use the included api to create products and categories

   ```txt
   Add categories --> POST localhost:3000/api/category/new?apiKey=YOUR API KEY
   Add products --> POST localhost:3000/api/product/new?apiKey=YOUR API KEY
   ```

   Providing product or category information like this:

   ```json
   "product": {
       "name": "Test",
       "image": "http://example.com",
       "price": 10
   }
   ```

   Check the endpoint implementation for more details.

7. Run the project

   ```bash
   npm run dev
   ```

8. Visit the site

You can now visit the site, check the frontend url that is shown in the client app logs.

## Build using docker

1. Setup env variables as indicated in the development setup part

   Important: frontend variables are loaded from the .env file, backend variables can be changed in the compose file

2. Run docker compose

```bash
docker compose up -d
```

> [!CAUTION]
> The compose file includes a database setup script that will generate the migration and seed the database. Once you run this compose the first time comment that part.\*\*

## Hosting recommendations

If you want to host this project for your online store or similar application, **I strongly recommend using the single-player-only branch** available [here](https://github.com/pavece/guess-the-price/tree/single-player-only).

Please note: While the multiplayer functionality works fine, it's implemented with basic features only. I don't recommend using the multiplayer version as-is for public-facing deployments without additional development.

Want to play with friends? Go ahead and host the full version! The multiplayer functionality is perfect for private games among friends and small groups.

> [!CAUTION]
> This server implements sockets.
> You won't be able to host the server app in serverless platforms like vercel.
