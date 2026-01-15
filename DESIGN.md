Social Media Platform – Backend Intern Assignment

1️⃣ Overview

This project implements the backend for a Social Media Platform supporting core social networking features such as:

User management

Creating posts with hashtags

Following / unfollowing users

Liking / unliking posts

Personalized user feed

User activity history

The backend is built using Node.js, Express, TypeScript, TypeORM, and SQLite, following clean separation of concerns and production-like database practices.

2️⃣ Tech Stack & Tools

Runtime: Node.js

Framework: Express.js

Language: TypeScript

ORM: TypeORM

Database: SQLite

Migrations: TypeORM migrations only (synchronize: false)

Testing: Interactive PowerShell script (test.ps1)

3️⃣ Project Structure
src/
├── controllers/     # Business logic
├── routes/          # API route definitions
├── entities/        # TypeORM entities
├── migrations/      # Database migrations
├── data-source.ts   # TypeORM DataSource config
├── index.ts         # App entry point
test.ps1             # Interactive CLI test script
database.sqlite      # SQLite database

Design Principle

Entities → Data structure only

Controllers → Business logic

Routes → API wiring

Migrations → Schema evolution

Test script → Manual + automated verification

4️⃣ Database Schema & Relationships
Entities Implemented
# User

id

firstName

lastName

email (unique)

createdAt, updatedAt

# Post

id

content

author (Many-to-One → User)

hashtags (Many-to-Many → Hashtag)

createdAt

#️ Hashtag

id

tag (unique)

Linked to posts via join table

# Follow

follower (User)

following (User)

Composite unique index (followerId, followingId)

createdAt

# Like

user (User)

post (Post)

Composite unique index (userId, postId)

createdAt

5️⃣ Indexing Strategy

Indexes are used to ensure performance and data integrity:

Unique email on users.email

Composite index on:

(followerId, followingId) → prevents duplicate follows

(userId, postId) → prevents multiple likes on same post

Indexed timestamps for:

Sorting feeds

Activity history queries

These choices optimize:

Feed queries

Activity lookups

Relationship checks

6️⃣ API Design & Key Endpoints
🔹 Core CRUD

/api/users

/api/posts

/api/follows

/api/posts/:id/like

🔹 Special Endpoints (Required)
# Feed
GET /api/feed?userId=1&limit=10&offset=0


Returns posts from followed users

Sorted by newest first

Includes:

Author details

Hashtags

Like count

Supports pagination

🔍 Posts by Hashtag
GET /api/posts/hashtag/:tag


Case-insensitive matching

Pagination supported

# Followers
GET /api/users/:id/followers


Sorted by follow date (newest first)

Pagination supported

Includes total count

# User Activity
GET /api/users/:id/activity


Tracks:

Posts created

Likes given

Follow actions

Supports:

Filtering by activity type

Pagination

Chronological sorting (newest first)

7️⃣ Feed & Activity Query Design

Feed uses QueryBuilder with joins:

User → Follow → Post → Hashtag → Like

Like counts are aggregated using COUNT

Activity endpoint merges:

Posts

Likes

Follows

Final response is sorted and paginated in memory for clarity

This keeps queries readable while remaining efficient for assignment scale.

8️⃣ Testing Strategy
  npm run dev
🔹 PowerShell Interactive Test Script (test.ps1)

Works on Windows without external tools

Tests:

User CRUD

Post creation with hashtags

Follow / unfollow

Like / unlike

Feed endpoint

Activity endpoint

Menu-driven for easy walkthrough during review

🔹 Execution Requirement
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\test.ps1


This does not change system-wide security settings.

9️⃣ Migration Strategy

TypeORM migrations only

synchronize: false enforced

Schema changes are:

Explicit

Version-controlled

Safe for production-like environments

Commands used:

npm run migration:generate
npm run migration:run
npm run migration:revert

🔟 Scalability Considerations

If scaled beyond SQLite:

Switch to PostgreSQL/MySQL

Add indexes on:

post.createdAt

follow.createdAt

Paginate at DB level for large datasets

Cache feeds for high-traffic users