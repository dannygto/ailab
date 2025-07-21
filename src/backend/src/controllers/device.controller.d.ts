import { Request, Response } from 'express';
export declare class DeviceController {
    getAllDevices: (req: Request, res: Response) => void;
    getDeviceById: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    updateDeviceStatus: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    sendCommand: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    getDeviceCommands: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    getDeviceData: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    createSession: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    endSession: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    createReservation: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
    getDeviceReservations: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
}
export declare const deviceController: DeviceController;
//# sourceMappingURL=device.controller.d.ts.map