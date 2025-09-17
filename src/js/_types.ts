//found  here https://github.com/christianliebel/paint/blob/6b4703cabfb818683c348c212651923a282d3aab/types/static.d.ts#L8
export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt: () => Promise<{
        outcome: string
    }>;
}
  
  export interface LaunchParams {
    readonly targetURL?: string | null;
    readonly files: readonly FileSystemFileHandle[];
  }
  
  export type LaunchConsumer = (params: LaunchParams) => any;
  
  export interface LaunchQueue {
    setConsumer(consumer: LaunchConsumer): void;
  }
  
declare global {
    interface Window {
        readonly launchQueue: LaunchQueue;
    }
  
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
        appinstalled: Event;
    }
}