import { Document, Schema as MongooseSchema } from 'mongoose';
export type InventoryDocument = Inventory & Document;
export declare class TableAvailability {
    size: number;
    totalTables: number;
    reservedTables: number;
}
export declare class Inventory {
    restaurantId: string;
    dateSlot: string;
    availableTables: TableAvailability[];
}
export declare const InventorySchema: MongooseSchema<Inventory, import("mongoose").Model<Inventory, any, any, any, any, any, Inventory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Inventory, Document<unknown, {}, Inventory, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Inventory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    restaurantId?: import("mongoose").SchemaDefinitionProperty<string, Inventory, Document<unknown, {}, Inventory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Inventory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dateSlot?: import("mongoose").SchemaDefinitionProperty<string, Inventory, Document<unknown, {}, Inventory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Inventory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    availableTables?: import("mongoose").SchemaDefinitionProperty<TableAvailability[], Inventory, Document<unknown, {}, Inventory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Inventory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Inventory>;
