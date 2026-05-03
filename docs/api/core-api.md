# Core API

All routes are served under the global prefix:

- `/api/v1`

## Catalog

- `GET /api/v1/grades`
- `GET /api/v1/grades/:gradeId`
- `GET /api/v1/grades/:gradeId/topics`
- `GET /api/v1/topics/:topicId`
- `GET /api/v1/topics/:topicId/knowledge-points`
- `GET /api/v1/knowledge-points/:id`
- `GET /api/v1/knowledge-points/:id/quiz-questions`
- `GET /api/v1/search?q=keyword`

## Content Metadata

- `GET /api/v1/catalog/overview`
- `GET /api/v1/content-imports/latest`
- `GET /api/v1/system/health`

## Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

`Authorization` header format:

- `Bearer <token>`

## Learning

- `GET /api/v1/learning/overview/me`
- `GET /api/v1/learning/knowledge-points/:id/status`
- `POST /api/v1/learning/knowledge-points/:id/start`
- `POST /api/v1/learning/knowledge-points/:id/complete`
- `POST /api/v1/learning/knowledge-points/:id/quiz-submissions`

## Commerce

- `GET /api/v1/commerce/products`
- `GET /api/v1/commerce/me`
- `POST /api/v1/commerce/topics/:topicId/trial`
- `POST /api/v1/commerce/orders`
- `POST /api/v1/commerce/orders/:orderId/pay`
- `POST /api/v1/commerce/orders/:orderId/cancel`

## Admin

- `GET /api/v1/admin/content/status`
- `POST /api/v1/admin/content/review`
- `POST /api/v1/admin/content/publish`
- `POST /api/v1/admin/content/rollback`
- `GET /api/v1/admin/reports/overview`
- `GET /api/v1/admin/reports/hot-topics`
- `GET /api/v1/admin/ai-content/summary`
- `GET /api/v1/admin/ai-content/drafts`
- `POST /api/v1/admin/ai-content/:id/review`
