# ===========
# Global args
# ===========
ARG UV_VERSION=0.7.1
ARG PYTHON_VERSION=3.10
ARG DISTRO=bookworm
ARG WORKSPACE_NAME=app

# ======================================
# Stage 1: Builder
#   - Installs runtime dependencies only
#   - Uses UV for faster dep management
# ======================================
FROM ghcr.io/astral-sh/uv:${UV_VERSION}-python${PYTHON_VERSION}-${DISTRO}-slim AS builder
ARG WORKSPACE_NAME
WORKDIR /${WORKSPACE_NAME}

# Optimize builds
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

# Copy config files
COPY pyproject.toml uv.lock ./

# Install runtime dependencies only (no project, no dev)
RUN uv sync --frozen --no-install-project --no-dev

# =================================================
# Stage 2: Development
#   - Installs dev dependencies from pyproject.toml
#   - Disables bytecode for hot-reload
#   - Mountable source code
# =================================================
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-${DISTRO} AS development
ARG WORKSPACE_NAME
WORKDIR /${WORKSPACE_NAME}

# Copy built deps from builder
COPY --from=builder /root/.cache/uv /root/.cache/uv
COPY --from=builder /${WORKSPACE_NAME} /${WORKSPACE_NAME}

# Copy full source (can be overridden at runtime)
COPY . .

# Install dev dependencies (no --no-dev)
ENV FASTAPI_ENV=development UV_COMPILE_BYTECODE=0 
RUN uv sync --frozen

# Dev-specific settings
ENV PATH="/${WORKSPACE_NAME}/.venv/bin:$PATH"

# Dev command with reload
CMD ["uvicorn", "symbiont.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ===========================
# Stage 3: Production Runtime
#   - Minimal image
#   - Non-root user
#   - Bytecode enabled
# ===========================
FROM python:${PYTHON_VERSION}-slim-${DISTRO} AS production
ARG WORKSPACE_NAME
WORKDIR /${WORKSPACE_NAME}

# Create non-root user
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser && \
    mkdir -p /${WORKSPACE_NAME} && \
    chown -R appuser:appgroup /${WORKSPACE_NAME}
USER appuser

# Copy from builder
COPY --from=builder --chown=appuser:appgroup /root/.cache/uv /root/.cache/uv
COPY --from=builder --chown=appuser:appgroup /${WORKSPACE_NAME} /${WORKSPACE_NAME}

# Prod-specific settings
ENV FASTAPI_ENV=production UV_COMPILE_BYTECODE=1

# Install runtime deps only (prod)
RUN uv sync --frozen --no-dev

ENV PATH="/${WORKSPACE_NAME}/.venv/bin:$PATH"

# Runtime command
EXPOSE 8080
CMD ["uvicorn", "symbiont.main:app", "--host", "0.0.0.0", "--port", "8000"]
