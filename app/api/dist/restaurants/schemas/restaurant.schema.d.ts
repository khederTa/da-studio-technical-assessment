import { Document } from 'mongoose';
export type RestaurantDocument = Restaurant & Document;
export declare class TableConfig {
    size: number;
    count: number;
}
export declare class Restaurant {
    name: string;
    zone: string;
    tables: TableConfig[];
}
export declare const RestaurantSchema: import("mongoose").Schema<Restaurant, import("mongoose").Model<Restaurant, any, any, any, any, any, Restaurant>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Restaurant, Document<unknown, {}, Restaurant, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Restaurant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Restaurant, Document<unknown, {}, Restaurant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    zone?: import("mongoose").SchemaDefinitionProperty<string, Restaurant, Document<unknown, {}, Restaurant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tables?: import("mongoose").SchemaDefinitionProperty<TableConfig[], Restaurant, Document<unknown, {}, Restaurant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Restaurant>;
