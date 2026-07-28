# CI/CD Lejiend Assignment

Deploy a ready-made Node.js application and MySQL database to an Ubuntu server with Docker Compose and GitHub Actions.

The application code and database are already prepared. Your priority is understanding and running the CI/CD workflow.

## Learning outcomes

- Understand the basic role of Node.js, Express, MySQL and environment variables.
- Identify which pipeline processes belong to CI and which belong to CD.
- Validate an application automatically before deployment.
- Deploy Node.js and MySQL to an Ubuntu server with Docker Compose.
- Keep production configuration in GitHub Secrets.
- Verify that Node.js can connect to MySQL through `/health`.

## Architecture

```text
Git push
  → GitHub Actions CI
  → GitHub Actions CD
  → Ubuntu server
  → Node.js container
  → MySQL container
```

## CI compared with CD

| Process | Stage | Purpose |
|---|---|---|
| Check out the repository | CI | Load the submitted source code |
| Set up Node.js | CI | Prepare the required runtime |
| Run `npm ci` | CI | Install exact dependency versions |
| Run `npm test` | CI | Validate application behaviour |
| Validate both Compose files | CI | Detect invalid Docker configuration |
| Build the Docker image | CI | Confirm that the application can be packaged |
| Configure SSH | CD | Prepare access to the Ubuntu server |
| Transfer project files | CD | Deliver the validated version |
| Create production `.env` | CD | Apply configuration from GitHub Secrets |
| Start MySQL | CD | Run the database service |
| Build and start Node.js | CD | Release the application |
| Call deployed `/health` | CD verification | Confirm Node.js and MySQL work together |

Remember:

```text
CI = Check the application.
CD = Deliver and verify the application.
```

The CD job uses `needs: continuous-integration`. If CI fails, CD does not run.

## Repository

Create a separate GitHub repository through the GitHub website:

```text
ci-cd-lejiend-assignment
```

Do not use GitHub CLI for this assignment. Clone the empty repository:

```bash
git clone git@github.com:<YOUR_GITHUB_USERNAME>/ci-cd-lejiend-assignment.git
cd ci-cd-lejiend-assignment
```

Copy this ready-made folder into the cloned repository.

## Project structure

```text
ci-cd-lejiend-assignment/
├── .github/workflows/deploy.yml
├── database/mysql/
│   ├── init/001-init.sql
│   └── docker-compose.yml
├── src/
│   ├── app.js
│   ├── database.js
│   └── server.js
├── tests/app.test.js
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

## Application context

Node.js runs JavaScript outside the browser. This project uses it to start a web server, receive HTTP requests and connect to MySQL.

Express provides two endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /` | Returns the application name and environment |
| `GET /health` | Sends `SELECT 1` to MySQL and reports system health |

MySQL stores relational data in databases and tables. Its initialization script creates `deployment_checks` and inserts one ready-made record.

The application health response is successful only when MySQL answers:

```json
{
  "status": "healthy",
  "application": "Lejiend CI/CD Assignment",
  "database": "connected"
}
```

If MySQL is unavailable, `/health` returns HTTP `503`.

## Environment variables

Create local configuration:

```bash
cp .env.example .env
```

Important variables:

| Variable | Purpose |
|---|---|
| `PORT` | Node.js application port |
| `APP_NAME` | Display name |
| `DB_HOST` | MySQL Docker service name; use `mysql` |
| `DB_NAME` | Database name |
| `DB_USER` | Application database user |
| `DB_PASSWORD` | Application database password |
| `DB_ROOT_PASSWORD` | MySQL administrator password |

Never commit `.env`. The committed `.env.example` contains placeholders only.

## Verify the Node.js code

Install dependencies and run the tests:

```bash
npm install
npm test
```

The automated tests use a controlled database substitute. The real database connection is verified later through Docker and the deployed `/health` endpoint.

## Run Node.js and MySQL locally

Start MySQL first. Its Compose project also creates the shared Docker network:

```bash
docker compose --env-file .env -f database/mysql/docker-compose.yml up -d
```

Wait until it is healthy:

```bash
docker compose --env-file .env -f database/mysql/docker-compose.yml ps
```

Build and start Node.js:

```bash
docker compose up --build -d
```

Verify the integrated application:

```bash
curl http://localhost:3000
curl http://localhost:3000/health
```

View logs:

```bash
docker compose logs
docker compose --env-file .env -f database/mysql/docker-compose.yml logs
```

Stop the services without deleting database data:

```bash
docker compose down
docker compose --env-file .env -f database/mysql/docker-compose.yml down
```

Do not add `--volumes` during normal use because that deletes stored MySQL data.

## Upload the project

```bash
git add .
git commit -m "Add ready-made Node.js CI/CD assignment"
git push origin main
```

Confirm that `.env`, `node_modules` and private keys are absent from GitHub.

## Prepare the Ubuntu server

The server requires SSH, Docker Engine and Docker Compose.

Connect and verify Docker:

```bash
ssh ubuntu@<SERVER_IP>
docker --version
docker compose version
docker ps
```

Create the deployment directory:

```bash
sudo mkdir -p /opt/ci-cd-lejiend-assignment
sudo chown ubuntu:ubuntu /opt/ci-cd-lejiend-assignment
```

Allow the application port `3000` in the AWS Security Group or applicable firewall. Do not expose MySQL port `3306` publicly.

Use a dedicated SSH deployment key. Its public key belongs in the server user's `~/.ssh/authorized_keys`; its private key belongs in GitHub Secrets.

## Configure GitHub Secrets

Open:

```text
Repository → Settings → Secrets and variables → Actions
```

Add:

| Secret | Example/purpose |
|---|---|
| `SERVER_HOST` | Server public IP or domain |
| `SERVER_USER` | `ubuntu` |
| `SERVER_PORT` | `22` |
| `SERVER_SSH_KEY` | Complete private deployment key |
| `APP_PORT` | `3000` |
| `APP_NAME` | `Lejiend CI/CD Assignment` |
| `DB_NAME` | `lejiend_assignment` |
| `DB_USER` | `lejiend_user` |
| `DB_PASSWORD` | Strong application password |
| `DB_ROOT_PASSWORD` | Different strong root password |

The workflow creates `/opt/ci-cd-lejiend-assignment/.env` from these secrets without committing it.

## Review the ready-made workflow

The workflow is located at `.github/workflows/deploy.yml`.

Its two jobs are:

```yaml
continuous-integration:
  name: CI - Validate Application

continuous-deployment:
  name: CD - Deploy to Ubuntu Server
  needs: continuous-integration
```

The workflow runs on a push to `main` and can also be started manually from the Actions page.

### AI review prompt

Use this prompt with your coding assistant:

```text
Review .github/workflows/deploy.yml against README.md.

Explain which steps belong to Continuous Integration and which belong
to Continuous Deployment.

Check for invalid YAML, incorrect secret names, exposed secrets,
incorrect deployment paths, unsafe SSH handling, Docker Compose errors,
missing job dependencies, and a health check that cannot fail.

The CI job must install dependencies, test, validate both Compose files,
and build the Docker image. It must not modify the Ubuntu server.

The CD job must run only after CI succeeds, transfer the validated files,
create the production .env from GitHub Secrets, start MySQL, wait until
MySQL is healthy, deploy Node.js, and verify GET /health.

Fix only confirmed problems and explain every change.
```

## Run the pipeline

Push a change:

```bash
git add .
git commit -m "Configure CI/CD assignment"
git push origin main
```

Open the repository's **Actions** page.

Expected journey:

```text
CI - Validate Application
✓ Install dependencies
✓ Run tests
✓ Validate Compose files
✓ Build Docker image

CD - Deploy to Ubuntu Server
✓ Connect and transfer
✓ Create production environment
✓ Start healthy MySQL
✓ Deploy Node.js
✓ Verify /health
```

Test the server:

```bash
curl http://<SERVER_IP>:3000
curl http://<SERVER_IP>:3000/health
```

## Demonstrate automatic deployment

Change the message returned by `src/app.js`, then push:

```bash
git add src/app.js
git commit -m "Update application message"
git push origin main
```

Do not SSH into the server to run `git pull`. GitHub Actions should validate and deploy the update automatically.

## Troubleshooting

### CI: `npm ci` fails

Ensure both `package.json` and `package-lock.json` are committed.

### CI: Compose validation fails

Create `.env` from `.env.example`, then inspect:

```bash
docker compose config
docker compose --env-file .env -f database/mysql/docker-compose.yml config
```

### CD: SSH connection fails

Check `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`, `SERVER_SSH_KEY`, port `22`, and the matching public key in `authorized_keys`.

### CD: MySQL is unhealthy

On the server:

```bash
cd /opt/ci-cd-lejiend-assignment
docker compose --env-file .env -f database/mysql/docker-compose.yml ps
docker compose --env-file .env -f database/mysql/docker-compose.yml logs
```

### CD: `/health` returns `503`

Check that MySQL is healthy and that `DB_HOST=mysql`. Inside the Node.js container, `localhost` refers to Node.js itself, not MySQL.

```bash
docker compose ps
docker compose logs
```

### Application works locally but not publicly

Test on the server:

```bash
curl http://localhost:3000/health
```

If it succeeds, review the AWS Security Group, firewall and public IP.

## Submission checklist

- [ ] Separate repository named `ci-cd-lejiend-assignment`
- [ ] `.env` and credentials are not committed
- [ ] `npm test` passes
- [ ] MySQL starts and becomes healthy
- [ ] Local `/health` reports `database: connected`
- [ ] All required GitHub Secrets are configured
- [ ] CI validates before CD begins
- [ ] Failed CI prevents CD
- [ ] CD deploys MySQL and Node.js
- [ ] Deployed `/health` succeeds
- [ ] A new code change deploys automatically

## Mission accomplished

```text
Develop → Push → CI: Validate → CD: Deploy → CD: Verify
```

The main achievement is a repeatable CI/CD process that validates every change before automatically deploying the Node.js application and its MySQL dependency.
# ci-cd-lejiend-assignment
# ci-cd-lejiend-assignment
# ci-cd-lejiend-assignment


## Auto deployment test - 29 July 2026