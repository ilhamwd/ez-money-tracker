#!/usr/bin/env bash
set -e

# Always run from the project root directory
cd "$(dirname "$0")"

REPO="iilhamwd/my-images"
TAG="${1:-}"

BACKEND_IMAGE="${REPO}:ez-money-tracker-backend"
FRONTEND_IMAGE="${REPO}:ez-money-tracker-frontend"

PLATFORM_ARG=()
if [ -n "${PLATFORM:-}" ]; then
  PLATFORM_ARG=(--platform "${PLATFORM}")
fi

echo "==> Building Backend image (${BACKEND_IMAGE})..."
docker build "${PLATFORM_ARG[@]}" -f backend/Dockerfile -t "${BACKEND_IMAGE}" -t ez-money-tracker-backend .

echo "==> Building Frontend image (${FRONTEND_IMAGE})..."
docker build "${PLATFORM_ARG[@]}" -f frontend/Dockerfile -t "${FRONTEND_IMAGE}" -t ez-money-tracker-frontend .

if [ -n "$TAG" ]; then
  echo "==> Tagging version ${TAG}..."
  docker tag "${BACKEND_IMAGE}" "${REPO}:ez-money-tracker-backend-${TAG}"
  docker tag "${FRONTEND_IMAGE}" "${REPO}:ez-money-tracker-frontend-${TAG}"
fi

echo "==> Pushing Backend image to Docker Hub..."
docker push "${BACKEND_IMAGE}"

echo "==> Pushing Frontend image to Docker Hub..."
docker push "${FRONTEND_IMAGE}"

if [ -n "$TAG" ]; then
  echo "==> Pushing versioned images (${TAG}) to Docker Hub..."
  docker push "${REPO}:ez-money-tracker-backend-${TAG}"
  docker push "${REPO}:ez-money-tracker-frontend-${TAG}"
fi

echo "==> Successfully built and pushed all images!"
