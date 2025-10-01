// Background request handling for AI generation that continues when user switches tabs or page reloads

interface BackgroundRequest {
  id: string;
  endpoint: string;
  body: Record<string, unknown>;
  startTime: number;
  status: 'pending' | 'completed' | 'error';
  result?: unknown;
  error?: string;
  toolType: 'objection' | 'message' | 'framework'; // Track which tool made the request
  toastShown?: boolean; // Track if toast has been shown for this request
}

const STORAGE_KEY = 'icpilot_background_requests';
const REQUEST_TIMEOUT = 120000; // 2 minutes timeout
const POLL_INTERVAL = 3000; // Check every 3 seconds for pending requests

// Get all background requests from storage
function getBackgroundRequests(): BackgroundRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save background requests to storage
function saveBackgroundRequests(requests: BackgroundRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.warn('Failed to save background requests:', error);
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Start a background request that persists across tab switches and page reloads
export async function startBackgroundRequest(
  endpoint: string,
  body: Record<string, unknown>,
  toolType: 'objection' | 'message' | 'framework',
  onProgress?: (status: 'pending' | 'completed' | 'error') => void,
  onComplete?: (result: unknown) => void,
  onError?: (error: string) => void
): Promise<string> {
  const requestId = generateRequestId();

  // Store the request with tool type
  const requests = getBackgroundRequests();

  // Check if there's already a pending request for this tool type to prevent duplicates
  const existingPending = requests.find(r =>
    r.toolType === toolType &&
    r.status === 'pending' &&
    Date.now() - r.startTime < 300000 // Within last 5 minutes
  );

  if (existingPending) {
    console.log(`Skipping duplicate ${toolType} request - one already pending`);
    return existingPending.id;
  }

  const newRequest: BackgroundRequest = {
    id: requestId,
    endpoint,
    body,
    startTime: Date.now(),
    status: 'pending',
    toolType
  };

  requests.push(newRequest);
  saveBackgroundRequests(requests);

  // Start the actual request (don't await - let it run in background)
  executeRequest(requestId, onProgress, onComplete, onError);

  return requestId;
}

// Execute the request with proper error handling
async function executeRequest(
  requestId: string,
  onProgress?: (status: 'pending' | 'completed' | 'error') => void,
  onComplete?: (result: unknown) => void,
  onError?: (error: string) => void
): Promise<void> {
  const requests = getBackgroundRequests();
  const request = requests.find(r => r.id === requestId);

  if (!request || request.status !== 'pending') {
    return;
  }

  try {
    onProgress?.('pending');

    // Create AbortController with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(request.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 402) {
      // Payment required - handle specially
      throw new Error('PAYMENT_REQUIRED');
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const result = await response.json();

    // Update request status
    request.status = 'completed';
    request.result = result;
    saveBackgroundRequests(requests);

    onProgress?.('completed');
    onComplete?.(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update request status
    request.status = 'error';
    request.error = errorMessage;
    saveBackgroundRequests(requests);

    onProgress?.('error');
    onError?.(errorMessage);
  }
}

// Check for completed requests (call this when component mounts or tab becomes visible)
export function checkBackgroundRequests(
  onComplete?: (requestId: string, result: unknown) => void,
  onError?: (requestId: string, error: string) => void
): void {
  const requests = getBackgroundRequests();
  const now = Date.now();

  requests.forEach(request => {
    // Clean up old requests (older than 10 minutes)
    if (now - request.startTime > 600000) {
      clearBackgroundRequest(request.id);
      return;
    }

    if (request.status === 'completed' && request.result) {
      onComplete?.(request.id, request.result);
      clearBackgroundRequest(request.id);
    } else if (request.status === 'error' && request.error) {
      onError?.(request.id, request.error);
      clearBackgroundRequest(request.id);
    }
  });
}

// Check for recent requests on page load (completed or pending within last 5 minutes)
export function checkForRecentRequests(
  toolType: 'objection' | 'message' | 'framework',
  onCompleted?: (result: unknown) => void,
  onPending?: (toastShown: boolean) => void,
  onError?: (error: string) => void
): 'completed' | 'pending' | 'error' | 'none' {
  const requests = getBackgroundRequests();
  const fiveMinutesAgo = Date.now() - 300000; // 5 minutes

  // Look for recently completed requests of this tool type
  const recentCompletion = requests.find(request =>
    request.toolType === toolType &&
    request.status === 'completed' &&
    request.result &&
    request.startTime > fiveMinutesAgo
  );

  if (recentCompletion) {
    console.log(`Found completed ${toolType} request:`, recentCompletion.id);
    onCompleted?.(recentCompletion.result);
    clearBackgroundRequest(recentCompletion.id);
    return 'completed';
  }

  // Look for pending requests of this tool type
  const pendingRequest = requests.find(request =>
    request.toolType === toolType &&
    request.status === 'pending' &&
    request.startTime > fiveMinutesAgo
  );

  if (pendingRequest) {
    onPending?.(pendingRequest.toastShown || false);
    return 'pending';
  }

  // Look for error requests of this tool type
  const errorRequest = requests.find(request =>
    request.toolType === toolType &&
    request.status === 'error' &&
    request.startTime > fiveMinutesAgo
  );

  if (errorRequest) {
    onError?.(errorRequest.error || 'Unknown error');
    clearBackgroundRequest(errorRequest.id);
    return 'error';
  }

  return 'none';
}

// Mark that a toast has been shown for a pending request
export function markToastShown(toolType: 'objection' | 'message' | 'framework'): void {
  const requests = getBackgroundRequests();
  const fiveMinutesAgo = Date.now() - 300000; // 5 minutes

  const pendingRequest = requests.find(request =>
    request.toolType === toolType &&
    request.status === 'pending' &&
    request.startTime > fiveMinutesAgo
  );

  if (pendingRequest && !pendingRequest.toastShown) {
    pendingRequest.toastShown = true;
    saveBackgroundRequests(requests);
  }
}

// Legacy function for backward compatibility
export function checkForRecentCompletions(
  toolType: 'objection' | 'message' | 'framework',
  onFound?: (result: unknown) => void
): boolean {
  return checkForRecentRequests(toolType, onFound) === 'completed';
}

// Clear a specific background request
export function clearBackgroundRequest(requestId: string): void {
  const requests = getBackgroundRequests();
  const filtered = requests.filter(r => r.id !== requestId);
  saveBackgroundRequests(filtered);
}

// Clear all background requests
export function clearAllBackgroundRequests(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

// Get pending requests count (for UI indicators)
export function getPendingRequestsCount(): number {
  return getBackgroundRequests().filter(r => r.status === 'pending').length;
}

// Polling system to check for completed requests (survives page reloads)
export function startRequestPolling(
  onComplete: (requestId: string, result: unknown, toolType: string) => void,
  onError: (requestId: string, error: string, toolType: string) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  // Check for completed requests immediately
  checkBackgroundRequests(onComplete, onError);

  // Set up polling interval
  const intervalId = setInterval(() => {
    checkBackgroundRequests(onComplete, onError);
  }, POLL_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

// Enhanced check function that includes tool type
function checkBackgroundRequestsWithToolType(
  onComplete?: (requestId: string, result: unknown, toolType: string) => void,
  onError?: (requestId: string, error: string, toolType: string) => void
): void {
  const requests = getBackgroundRequests();
  const now = Date.now();

  requests.forEach(request => {
    // Clean up old requests (older than 10 minutes)
    if (now - request.startTime > 600000) {
      clearBackgroundRequest(request.id);
      return;
    }

    if (request.status === 'completed' && request.result) {
      onComplete?.(request.id, request.result, request.toolType);
      clearBackgroundRequest(request.id);
    } else if (request.status === 'error' && request.error) {
      onError?.(request.id, request.error, request.toolType);
      clearBackgroundRequest(request.id);
    }
  });
}

// Hook for React components to handle background requests that survive page reloads
export function useBackgroundRequestPolling(
  onComplete: (requestId: string, result: unknown, toolType: string) => void,
  onError: (requestId: string, error: string, toolType: string) => void
): void {
  if (typeof window === 'undefined') return;

  const cleanup = startRequestPolling(onComplete, onError);

  // Cleanup when component unmounts
  return cleanup;
}

// Legacy function for backward compatibility
export function useVisibilityHandler(
  onComplete: (requestId: string, result: unknown) => void,
  onError: (requestId: string, error: string) => void
): void {
  return useBackgroundRequestPolling(
    (requestId, result, toolType) => onComplete(requestId, result),
    (requestId, error, toolType) => onError(requestId, error)
  );
}