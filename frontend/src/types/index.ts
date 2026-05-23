export enum ServiceStatus {
    RECIBIDO = 'RECIBIDO',
    EN_DIAGNOSTICO = 'EN_DIAGNOSTICO',
    EN_REPARACION = 'EN_REPARACION',
    LISTO_ENTREGA = 'LISTO_ENTREGA',
    ENTREGADO = 'ENTREGADO'
}

export interface Evidence {
    id: number;
    rutaImagen: string;
    fechaCaptura: string;
}

export interface ServiceOrder {
    id: number;
    clienteNombre: string;
    dispositivo: string;
    descripcionProblema: string;
    estadoActual: ServiceStatus;
    fechaCreacion: string;
    evidencias: Evidence[];
}

export interface User {
    id: number;
    username: string;
    fullName: string;
    role: 'ADMIN' | 'TECHNICIAN';
}

export interface AuthResponse {
    message: string;
    username: string;
    fullName: string;
    role: string;
    token: string;
}

export const formatStatus = (status: string) => {
    switch (status) {
        case 'RECIBIDO': return 'Recibido';
        case 'EN_DIAGNOSTICO': return 'En diagnóstico';
        case 'EN_REPARACION': return 'En reparación';
        case 'LISTO_ENTREGA': return 'Listo para entrega';
        case 'ENTREGADO': return 'Entregado';
        default: return status.replace('_', ' ');
    }
};
