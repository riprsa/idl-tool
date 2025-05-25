export interface IDL {
    program?: Program;
    accounts?: Account[];
    instructions?: Instruction[];
    types?: Type[];
    definedTypes?: Type[];
    errors?: ErrorType[];
    events?: Event[];
}

export interface Program {
    accounts?: Account[];
    instructions?: Instruction[];
    definedTypes?: Type[];
    types?: Type[];
    errors?: ErrorType[];
    events?: Event[];
    name?: string;
    version?: string;
    publicKey?: string;
    prefix?: string;
}

export interface Account {
    name: string;
    docs?: string[];
    discriminator?: number[];
    data?: {
        fields: Field[];
    };
    type?: {
        fields: Field[];
    };
}

export interface Instruction {
    name: string;
    docs?: string[];
    accounts?: InstructionAccount[];
    args?: Argument[];
    arguments?: Argument[];
    discriminator?: number[];
}

export interface InstructionAccount {
    name: string;
    isWritable?: boolean;
    writable?: boolean;
    isSigner?: boolean;
    signer?: boolean;
    isOptional?: boolean;
    optional?: boolean;
    docs?: string[];
}

export interface Argument {
    name: string;
    type: TypeNode;
    docs?: string[];
}

export interface Type {
    name: string;
    docs?: string[];
    type: TypeNode;
}

export interface Field {
    name: string;
    type: TypeNode;
    docs?: string[];
}

export type TypeNode = {
    kind: string;
    format?: string;
    endian?: string;
    encoding?: string;
    name?: string;
    type?: TypeNode;
    variants?: { name: string }[];
    fields?: Field[];
    [key: number]: TypeNode; // For array types
} | string;

export function isTypeNodeObject(node: TypeNode): node is { kind: string;[key: string]: any } {
    return typeof node === 'object' && node !== null;
}

export interface ErrorType {
    name: string;
    code: number;
    message?: string;
    msg?: string;
    docs?: string[];
}

export interface Event {
    name: string;
    docs?: string[];
    discriminator?: number[];
    type?: {
        fields: Field[];
    };
    fields?: Field[];
} 