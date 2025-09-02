// Simple event bus for cross-component communication
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Unsubscribe from an event
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Emit an event with data
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (e) {
        console.error(`Error in event handler for ${event}:`, e);
      }
    });
  }
}

// Create a singleton instance
export const eventBus = new EventBus();

// Event constants
export const EVENTS = {
  TWEET_POSTED: 'tweet-posted',
};
