# Public API Cache Service

## Overview

This project is a backend service that fetches data from a public API (PokéAPI), caches it in memory, and exposes simplified endpoints.
---

## API Used

* PokéAPI: https://pokeapi.co/

---

## Features

* Fetch list of items with pagination support
* Fetch individual item details by ID
* In-memory caching with TTL and SWR
* Cache hit/miss tracking via response headers
* Cache stampede prevention (shared promise)
* Optional cache bypass (`forceRefresh`)
* Error handling for API failures
* Swagger API documentation
* Automated tests using Jest

---

## Endpoints

### 1. GET /items

Returns a list of item IDs.

#### Query Parameters

* `forceRefresh=true` (optional)
  Bypass cache and fetch fresh data from external API
* `swr=true` (optional)
  Activate SWR-based cache strategy, while having no query parameters or setting swr=false activates TTL-based cache strategy

#### Example Request

```bash
GET http://localhost:8080/items
GET http://localhost:8080/items?forceRefresh=true
GET http://localhost:8080/items?swr=true
```

#### Example Response

```json
[1, 2, 3, 4]
```

#### Headers

```
X-Cache: HIT | MISS
```

---

### 2. GET /items/:id

Returns details of a specific item.

#### Example Request

```bash
GET http://localhost:8080/items/1
```

#### Example Response

```json
{
  "id": 1,
  "name": "bulbasaur",
  "description": "seed"
}
```

#### Error Responses

**400 – Invalid ID**

```json
{
  "error": "Invalid ID"
}
```

**404 – Item not found**

```json
{
  "error": "Item not found"
}
```

**502 – External API failure**

```json
{
  "error": "External API failed"
}
```

---

## Project Structure

```
src/
  routes/        # HTTP routes
  services/      # business logic
  clients/       # external API calls
  cache/         # caching logic
  tests/         # unit tests
```

---

## Setup & Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Run the project (development)

```bash
npm run dev
```

### 3. Run in production mode

```bash
npm run build
npm start
```

---

## Server

Default:

```
http://localhost:8080
```

---

## API Documentation (Swagger)

```
http://localhost:8080/docs
```

---

## Running Tests

```bash
npm test
```

---

## Environment Variables

```
PORT=8080
```

---

## Caching Behavior

* TTL:
    * Data is cached for 60 seconds (TTL)
    * First request → cache MISS → fetch from API
    * Subsequent requests → cache HIT
    * Cache refreshes after expiration
    * `forceRefresh=true` bypasses cache
* SWR: 
    * Cached data is returned immediately, even if stale
        * First request with empty cache → cache MISS → fetch from API
        * Subsequent requests → cache HIT
        * When cache becomes stale:
            * stale data is still returned to clients
            * background refresh is triggered asynchronously
        * Concurrent stale requests reuse the same refresh promise to prevent duplicate API calls
        * Users receive stale data during the refresh window
        * `forceRefresh=true` bypasses cache and forces immediate refresh

---

## Assumptions

* External API data does not change frequently
* Cache staleness within TTL is acceptable
* Item IDs are derived from array index

---

## AI Usage

* Used ChatGPT for:

  * understanding caching strategies
  * generating initial scaffolding

* Manually reviewed or modified:

  * cache logic
  * tests
  * forceRefresh

* Most confident:

  * caching strategies
  * API design

* Least confident:

  * Jest testing
