#!/usr/bin/env bash
set -e

# Always run from the project root directory
cd "$(dirname "$0")"

REPO="iilhamwd/my-images"
TAG="${1:-}"

# Target platform: defaults to multi-arch (linux/amd64 and linux/arm64)
# Deployments to GCP/cloud Linux require linux/amd64
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"

BACKEND_IMAGE="${REPO}:emt-be"
FRONTEND_IMAGE="${REPO}:emt-fe"

echo "==> Ensuring Docker buildx builder is set up for multi-platform builds..."
if ! docker buildx inspect multiarch-builder >/dev/null 2>&1; then
  docker buildx create --name multiarch-builder --use --bootstrap || true
else
  docker buildx use multiarch-builder || true
fi

BACKEND_TAGS=("-t" "${BACKEND_IMAGE}")
FRONTEND_TAGS=("-t" "${FRONTEND_IMAGE}")

if [ -n "$TAG" ]; then
  BACKEND_TAGS+=("-t" "${REPO}:emt-be-${TAG}")
  FRONTEND_TAGS+=("-t" "${REPO}:emt-fe-${TAG}")
fi

echo "==> Building and pushing Backend image (${BACKEND_IMAGE}) for ${PLATFORM}..."
docker buildx build \
  --platform "${PLATFORM}" \
  "${BACKEND_TAGS[@]}" \
  -f backend/Dockerfile \
  --push \
  .

echo "==> Building and pushing Frontend image (${FRONTEND_IMAGE}) for ${PLATFORM}..."
docker buildx build \
  --platform "${PLATFORM}" \
  "${FRONTEND_TAGS[@]}" \
  -f frontend/Dockerfile \
  --push \
  .

echo "==> Successfully built and pushed multi-platform images to Docker Hub!"
