import { Request, Response } from 'express';
export declare class DeviceController {
    getAllDevices: (req: Request, res: Response) => void;
    getDeviceById: (req: Request, res: Response) => Response<any, Record<string, any>>;
    updateDeviceStatus: (req: Request, res: Response) => Response<any, Record<string, any>>;
    sendCommand: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getDeviceCommands: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getDeviceData: (req: Request, res: Response) => Response<any, Record<string, any>>;
    createSession: (req: Request, res: Response) => Response<any, Record<string, any>>;
    endSession: (req: Request, res: Response) => Response<any, Record<string, any>>;
    createReservation: (req: Request, res: Response) => Response<any, Record<string, any>>;
    getDeviceReservations: (req: Request, res: Response) => Response<any, Record<string, any>>;
}
export declare const deviceController: DeviceController;
//# sourceMappingURL=device.controller.d.ts.map