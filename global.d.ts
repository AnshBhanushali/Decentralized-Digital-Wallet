// global.d.ts

declare global {
    interface Window {
      ethereum?: {
        request: (...args: any[]) => Promise<any>;
      };
    }
  }
  
  export {};
  