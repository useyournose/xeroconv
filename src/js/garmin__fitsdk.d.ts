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
        fileIdMesgs: fileIdMesgs[];
        fileCreatorMesgs: fileCreatorMesgs[]
    }

    type chronoShotSessionMesg = {
        shotCount: number;
        maxSpeed: number;
        minSpeed: number;
        avgSpeed: number;
        grainWeight: number;
        projectileType: string;
        timestamp: Date;
    }
    type deviceInfoMesg = {
        garminProduct: 4053;
        product: 4053;
        manufacturer: "garmin" ;
        serialNumber: number;
        softwareVersion: number;
        timestamp: Date;
    }
    
    type chronoShotDataMesg = {
        shotNum: number;
        shotSpeed: number;
        timestamp: Date;
    }

    type fileIdMesgs = {
        garminProduct: 4053;
        product: 4053;
        manufacturer: "garmin" ;
        serialNumber: number;
        type: number;
        timeCreated: Date;
    }

    type fileCreatorMesgs = {
        softwareVersion: number
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