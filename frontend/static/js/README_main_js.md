# Enhanced Main.js Documentation

## Overview
This enhanced main.js file integrates complete business logic for the stock analysis platform, including user behavior tracking, customer service assignment, and session management.

## Features Implemented

### 1. Session Management
- **Session ID Generation**: Automatically generates unique session IDs for each user visit
- **Session Persistence**: Stores session ID in `sessionStorage` for tracking across page views
- **Original Referrer Tracking**: Captures and stores the original referrer for cloaking validation

### 2. User Behavior Tracking
Tracks three main user actions:
- **page_load**: Sent when user first lands on the page
- **popup_triggered**: Sent when user clicks "Get Free Consultation" button
- **conversion**: Sent when user clicks "Connect with Investment Advisor" button

### 3. Customer Service Integration
- Calls `/app/maike/api/customerservice/get_info` API to get assigned customer service
- Passes stock code, text, and original referrer to the backend
- Redirects to `/jpint` page for customer service connection
- Fallback to global link if API fails

### 4. Data Persistence
Uses `localStorage` to store:
- `stockcode`: User's entered stock symbol
- `text`: Stock symbol text
- `stock_name`: Stock name (if available)

Uses `sessionStorage` to store:
- `session_id`: Unique session identifier
- `original_referrer`: Original page referrer

### 5. UI Enhancements
- **Visitor Count Animation**: Dynamic visitor count with random variance
- **Progress Bar Animation**: Smooth 3-stage analysis progress animation
- **Cookie Banner**: GDPR-compliant cookie consent banner
- **Loading Overlay**: Removes loading overlay when ready

### 6. Error Handling
- Global error handlers for uncaught errors and promise rejections
- Automatic error logging to `/app/maike/api/info/logError`
- Fallback behaviors when APIs fail

## Configuration

```javascript
const CONFIG = {
  API_BASE: '/app/maike/api',           // Base API endpoint
  TRACKING_ENABLED: true,                // Enable/disable tracking
  DEBUG_MODE: false,                     // Enable console logging
  VISITOR_COUNT_BASE: 41978,             // Base visitor count
  VISITOR_COUNT_VARIANCE: 50             // Random variance for visitor count
};
```

## API Endpoints Used

### 1. Page Tracking
**Endpoint**: `POST /app/maike/api/info/page_track`

**Request Body**:
```json
{
  "session_id": "sess_1234567890_abc123",
  "action_type": "page_load|popup_triggered|conversion",
  "stock_name": "Toyota Motor",
  "stock_code": "7203",
  "url": "https://example.com/",
  "timestamp": "2025-11-17T12:00:00.000Z"
}
```

### 2. Error Logging
**Endpoint**: `POST /app/maike/api/info/logError`

**Request Body**:
```json
{
  "message": "error_description",
  "stack": "error_stack_trace",
  "phase": "runtime",
  "stockcode": "7203",
  "href": "https://example.com/",
  "ref": "https://google.com/",
  "ts": 1700000000000
}
```

### 3. Customer Service Assignment
**Endpoint**: `POST /app/maike/api/customerservice/get_info`

**Request Headers**:
- `Content-Type: application/json`
- `timezone: Asia/Tokyo`
- `language: ja-JP`

**Request Body**:
```json
{
  "stockcode": "7203",
  "text": "7203",
  "original_ref": "https://www.google.com/search?q=stock"
}
```

**Response**:
```json
{
  "statusCode": "ok",
  "id": "cs_673abcdef123456",
  "CustomerServiceUrl": "https://line.me/R/ti/p/@example",
  "CustomerServiceName": "LINE Official Account",
  "Links": "https://fallback.url"
}
```

### 4. Get Links (Fallback)
**Endpoint**: `GET /api/get-links`

**Response**:
```json
{
  "data": [
    {
      "redirectUrl": "https://fallback.url"
    }
  ]
}
```

## User Flow

### Complete User Journey:

1. **Page Load**
   - Generate/retrieve session ID
   - Store original referrer
   - Send `page_load` tracking event
   - Initialize cookie banner
   - Start visitor count animation
   - Load fallback global link

2. **User Input**
   - User enters stock code (e.g., "7203")
   - User clicks "Get Free Consultation" button

3. **Analysis Animation**
   - Show modal with progress bars
   - Animate 3-stage analysis (Market → Chart → News)
   - Save stock code to localStorage
   - Duration: 1.5 seconds

4. **Results Display**
   - Hide progress view
   - Show results with stock code
   - Display "Connect with Investment Advisor" button
   - Send `popup_triggered` tracking event

5. **Conversion**
   - User clicks advisor button
   - Send `conversion` tracking event
   - Trigger Google Analytics conversion
   - Call customer service API
   - Redirect to `/jpint` with data in localStorage
   - Fallback to global link if API fails

## Error Handling

### API Failure Scenarios:

1. **Tracking API Fails**: Silently logs error, doesn't block user flow
2. **Customer Service API Fails**: Falls back to global link or shows alert
3. **Network Timeout**: Logs error and provides fallback options
4. **JavaScript Errors**: Caught by global error handler and logged

## Testing Checklist

- [ ] Page loads and sends page_load tracking
- [ ] Visitor count animates correctly
- [ ] Cookie banner shows/hides correctly
- [ ] Stock code input and validation works
- [ ] Progress animation displays correctly
- [ ] popup_triggered event sent after animation
- [ ] Chat button calls customer service API
- [ ] conversion event sent on chat button click
- [ ] Redirect to /jpint works correctly
- [ ] localStorage persists stock code
- [ ] sessionStorage maintains session ID
- [ ] Error handling works for failed APIs
- [ ] Fallback link used when needed
- [ ] Global error handlers catch exceptions

## Debug Mode

To enable debug mode for testing:

```javascript
// In browser console:
sessionStorage.setItem('debug_mode', 'true');
location.reload();

// Or modify CONFIG.DEBUG_MODE in the source
```

When debug mode is enabled, all log messages will appear in browser console with `[StockAnalysis]` prefix.

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Requires ES6+ support (async/await, arrow functions, template literals)
- Uses Fetch API (IE11 not supported)
- localStorage and sessionStorage required

## Performance Notes

- All API calls are async and non-blocking
- Error tracking uses fire-and-forget pattern
- Visitor count updates every 8-12 seconds
- Progress animations use requestAnimationFrame where possible
- Session data stored in memory (sessionStorage) for fast access

## Security Considerations

- No sensitive data stored in localStorage
- Session IDs are randomly generated (not predictable)
- API calls include timezone and language headers only
- CORS headers required on backend APIs
- Original referrer stored for cloaking validation only

## Maintenance

### To Update Configuration:
1. Modify CONFIG object at top of file
2. Test all flows after changes
3. Update this documentation

### To Add New Tracking Events:
1. Call `sendTrackingData('event_name', { additionalData })`
2. Update backend to handle new event type
3. Update admin dashboard to display new events

### To Add New APIs:
1. Create async function following existing patterns
2. Add error handling with try/catch
3. Include timezone and language headers
4. Log errors using logError() function

## Backup

Original main.js has been backed up to: `main.js.backup`

To restore original version:
```bash
cp main.js.backup main.js
```
