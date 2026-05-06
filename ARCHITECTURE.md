# Architecture Overview

## 1. System Design

This service acts as a middleware between clients and an external API (PokéAPI). It simplifies responses and reduces load on the external API through caching.

### Layers

* **Routes (HTTP Layer)**
  Handles incoming requests and responses.

* **Services (Business Logic)**
  Contains core logic such as caching and data transformation.

* **Clients (External API Layer)**
  Responsible for calling the external API.

* **Cache (Infrastructure Layer)**
  Manages in-memory caching and concurrency control.

---

## 2. Data Flow

```
Client Request
      ↓
Route Handler
      ↓
Service Layer
      ↓
Cache Check
   ↙        ↘
HIT         MISS
 ↓            ↓
Return      Fetch from API
               ↓
           Store in Cache
               ↓
            Return
```

---

## 3. Caching Strategies

### Approach

* In-memory cache
* Cache stores:

  * `data`: cached result
  * `expiry`: expiration timestamp
  * `promise`: in-flight request
  * `isRefreshing`: refresh state

### TTL (Time To Live)

* Cache expires after **60 seconds**
* After expiration, next request triggers a refresh

### SWR (Stale While Revalidate)

* When cached data exists, it is returned immediately even if stale.
* If the cache is stale, the system refreshes data asynchronously in the background.
* The external API is only awaited when no cached data exists.

---

## 4. Cache Behavior

### Cache Hit
* TTL:
    * Data is returned immediately
    * No external API call is made
    * Response header: `X-Cache: HIT`
* SWR:
    * Fresh Cache Hit: Data is returned immediately without external API call.
    * Stale Cache Hit: Stale cached data is returned immediately while a background refresh is triggered.

### Cache Miss

* Data is fetched from external API
* Cache is updated
* Response header: `X-Cache: MISS`

---

## 5. New Data Discovery

New items added to the external API are discovered when:
* TTL: Cache expires
* SWR: happens automatically when stale cache is accessed.

---

## 6. Cache Stampede Prevention

To prevent multiple simultaneous API calls:

* A shared `promise` is stored during fetch
* If another request arrives:

  * TTL: It waits for the same promise instead of triggering a new API call
  * SWR: 
    * If no cached data exists, concurrent requests await the same promise.
    * If stale data exists, return stale cache while refresh occurs in background.

---

## 7. TTL vs SWR:
* SWR has faster response times and reduces latency spikes after cache expiration
* However, SWR returns stale data during refresh window, which is not the case with TTL

## 8. Force Refresh

An optional query parameter allows bypassing cache:

```
GET /items?forceRefresh=true
```

Behavior:

* Ignores cache
* Fetches fresh data immediately
* Returns `X-Cache: MISS`

---

## 9. Error Handling

### External API Failure

* Request returns an error response
* Cache is not updated

---

## 10. Concurrency Handling

* First request triggers API call
* Subsequent requests wait for the same promise
* Prevents redundant calls and race conditions

---

## 11. Scaling Considerations

### Current

* In-memory cache per instance

### Limitations

* Not shared across multiple instances
* Cache resets on restart

### Production Improvements

* Use Redis for shared cache

---

## 12. Monitoring & Observability

Recommended additions:

* Cache hit/miss ratio
* API latency tracking
* Error rate monitoring
* Logging for failures and retries

---

## 13. Future Improvements

* Request timeouts for external API
* Rate limiting
* Persistent distributed cache (Redis)

---

## 14. Design Decisions Summary

* Chose TTL-based caching for simplicity, and SWR to reduce latency
* Accepted temporary staleness for performance gains
* Used shared promise to handle concurrency
