# Lessons learned

## What I built
A multi-job GitHub Actions CI/CD pipeline with:
- Job 1: lint + Jest tests with coverage enforcement (80% minimum)
- Job 2: Docker build + push to Docker Hub (only on main)
- Job 3: SSH deploy to a remote server using a deploy script
- A separate PR check pipeline that runs on every pull request

## Key concepts

### Job dependencies with needs:
Jobs run in parallel by default. Using needs: test makes the build
job wait for tests to pass first. This prevents broken code from
ever reaching Docker Hub or the server.

### Passing data between jobs with outputs:
The build job calculates the image tag once and passes it to the
deploy job using outputs: and the needs context.

### Caching Docker layers with cache-from type=gha
GitHub Actions can cache Docker build layers between runs.
Cuts build time from 2min to 20s on repeat builds.

### SSH deploy with appleboy/ssh-action
We store deploy.sh on the server and trigger it remotely.
The script handles pull, stop, run, health check, and rollback.

### Coverage enforcement
Setting coverageThreshold in package.json fails the pipeline
automatically if coverage drops below 80%.

## Secrets needed
- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN
- SERVER_HOST
- SERVER_USER
- SERVER_SSH_KEY
