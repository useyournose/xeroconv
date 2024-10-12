declare module '@garmin/fitsdk' {

    export class Stream {
        static fromByteArray(bytes: number[]): Stream;
        static fromArrayBuffer(bytes: ArrayBuffer): Stream;
        // Other methods and properties...
    }
    

    export class Decoder {
        static isFIT(stream: Stream): boolean;
        isFIT(): boolean;
        checkIntegrity(): boolean;
        read(decoderOptions?:decoderOptions): { messages: messages; errors: any[] };
        constructor (stream: Stream);
    }

    type messages = {
        deviceInfoMesgs:deviceInfoMesg[];
        chronoShotSessionMesgs:chronoShotSessionMesg[];
        chronoShotDataMesgs:chronoShotDataMesg[];
    }

    type chronoShotSessionMesg = {
        shotCount:number;
        maxSpeed: number;
        minSpeed: number;
        avgSpeed: number;
        grainWeight: number;
    }
    type deviceInfoMesg = {
        manufacturer:string;
        serialNumber:number;
    }
    
    type chronoShotDataMesg = {
        shotNum: number;
        shotSpeed: number;
        timestamp: string;
    }
  
    export interface decoderOptions {
        //mesgListener: (messageNumber, message) => {},
        applyScaleAndOffset?: boolean;
        expandSubFields?: boolean;
        expandComponents?: boolean;
        convertTypesToStrings?: boolean;
        convertDateTimesToDates?: boolean;
        includeUnknownData?: boolean;
        mergeHeartRates?: boolean;
    }
}